/*
 * Wazuh app - Class for Wazuh-API functions
 * Copyright (C) 2015-2020 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

// Require some libraries
import { pciRequirementsFile } from '../integration-files/pci-requirements';
import { gdprRequirementsFile } from '../integration-files/gdpr-requirements';
import { hipaaRequirementsFile } from '../integration-files/hipaa-requirements';
import { nistRequirementsFile } from '../integration-files/nist-requirements';
import { tscRequirementsFile } from '../integration-files/tsc-requirements';
import { getPath } from '../../util/get-path';
import { ErrorResponse } from './error-response';
import { Parser } from 'json2csv';
import { log } from '../logger';
import { KeyEquivalence } from '../../util/csv-key-equivalence';
import { ApiErrorEquivalence } from '../../util/api-errors-equivalence';
import { cleanKeys } from '../../util/remove-key';
import apiRequestList from '../../util/api-request-list';
import * as ApiHelper from '../lib/api-helper';
import { Queue } from '../jobs/queue';
import fs from 'fs';
import { ManageHosts } from '../lib/manage-hosts';
import { UpdateRegistry } from '../lib/update-registry';
import { ApiInterceptor } from '../lib/api-interceptor';
import { ISecurityFactory } from '../lib/security-factory';
import jwtDecode from 'jwt-decode';
import { KibanaRequest, RequestHandlerContext, KibanaResponseFactory } from 'src/core/server';
import { APIUserAllowRunAs, CacheInMemoryAPIUserAllowRunAs, API_USER_STATUS_RUN_AS } from '../lib/cache-api-user-has-run-as';

export class WazuhApiCtrl {

  constructor(private securityObj: ISecurityFactory) {
    this.queue = Queue;
    // this.monitoringInstance = new Monitoring(server, true);
    this.manageHosts = new ManageHosts();
    this.updateRegistry = new UpdateRegistry();
    this.apiInterceptor = new ApiInterceptor();
  }

  getApiIdFromCookie(cookie) {
    if (!cookie) return false;
    const getWzApi = /.*wz-api=([^;]+)/;
    const wzApi = cookie.match(getWzApi)
    if (wzApi && wzApi.length && wzApi[1]) return wzApi[1];
    return false;
  }

  getTokenFromCookie(cookie) {
    if (!cookie) return false;
    const getWzToken = /.*wz-token=([^;]+)/;
    const wzToken = cookie.match(getWzToken)
    if (wzToken && wzToken.length && wzToken[1]) return wzToken[1];
    return false;
  }

  getUserFromCookie(cookie) {
    if (!cookie) return false;
    const getWzUser = /.*wz-user=([^;]+)/;
    const wzUser = cookie.match(getWzUser)
    if (wzUser && wzUser.length && wzUser[1]) return wzUser[1];
    return false;
  }

  async getToken(context: RequestHandlerContext, request: KibanaRequest, response: KibanaResponseFactory) {
    try {
      const { force, idHost } = request.body;
      const { userName, authContext } = await this.securityObj.getCurrentUser(request, context);
      
      if (!force && request.headers.cookie && userName === this.getUserFromCookie(request.headers.cookie) && idHost === this.getApiIdFromCookie(request.headers.cookie)) {
        const wzToken = this.getTokenFromCookie(request.headers.cookie);

        if (wzToken) {
          try { // if the current token is not a valid jwt token we ask for a new one
            const decodedToken = jwtDecode(wzToken);
            const expirationTime = (decodedToken.exp - (Date.now() / 1000));
            if (wzToken && expirationTime > 0) {
              return response.ok({
                body: { token: wzToken }
              });
            }
          } catch (error) {
            log('wazuh-api:getToken', error.message || error);
          }
        }
      }
      let token;
      if (await APIUserAllowRunAs.canUse(idHost)) {
        token = await this.apiInterceptor.authenticateApi(idHost, authContext)
      } else {
        token = await this.apiInterceptor.authenticateApi(idHost)
      };

      return response.ok({
        headers: {
          'set-cookie': [
            `wz-token=${token};Path=/;HttpOnly`,
            `wz-user=${userName};Path=/;HttpOnly`,
            `wz-api=${idHost};Path=/;HttpOnly`,
          ],
        },
        body: {token}
      });
    } catch (error) {
      const errorMessage = ((error.response || {}).data || {}).detail || error.message || error;
      log('wazuh-api:getToken', errorMessage);
      return ErrorResponse(
        `Error getting the authorization token: ${errorMessage}`,
        3000,
        500,
        response
      );
    }
  }

  /**
   * Returns if the wazuh-api configuration is working
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Object} status obj or ErrorResponse
   */
  async checkStoredAPI(context: RequestHandlerContext, request: KibanaRequest, response: KibanaResponseFactory) {
    try {
      // Get config from wazuh.yml
      const id = request.body.id || request.body;
      const api = await this.manageHosts.getHostById(id);

      // Check Manage Hosts
      if (!Object.keys(api).length) {
        throw new Error('Could not find Wazuh API entry on wazuh.yml');
      }

      log('wazuh-api:checkStoredAPI', `${id} exists`, 'debug');

      // Fetch needed information about the cluster and the manager itself
      const responseManagerInfo = await this.apiInterceptor.request(
        'get',
        `${api.url}:${api.port}/manager/info`,
        {},
        { idHost: id, forceRefresh: true }
      );

      // Look for socket-related errors
      if (this.checkResponseIsDown(responseManagerInfo)) {
        return ErrorResponse(
          `ERROR3099 - ${responseManagerInfo.data.detail || 'Wazuh not ready yet'}`,
          3099,
          500,
          response
        );
      }

      // If we have a valid response from the Wazuh API
      if (responseManagerInfo.status === 200 && responseManagerInfo.data) {
        // Clear and update cluster information before being sent back to frontend
        delete api.cluster_info;
        const responseAgents = await this.apiInterceptor.request(
          'get',
          `${api.url}:${api.port}/agents`,
          { params: { agents_list: '000' } },
          { idHost: id }
        );

        if (responseAgents.status === 200) {
          const managerName = responseAgents.data.data.affected_items[0].manager;

          const responseClusterStatus = await this.apiInterceptor.request(
            'get',
            `${api.url}:${api.port}/cluster/status`,
            {},
            { idHost: id }
          );
          if (responseClusterStatus.status === 200) {
            if (responseClusterStatus.data.data.enabled === 'yes') {
              const responseClusterLocalInfo = await this.apiInterceptor.request(
                'get',
                `${api.url}:${api.port}/cluster/local/info`,
                {},
                { idHost: id }
              );
              if (responseClusterLocalInfo.status === 200) {
                const clusterEnabled = responseClusterStatus.data.data.enabled === 'yes';
                api.cluster_info = {
                  status: clusterEnabled ? 'enabled' : 'disabled',
                  manager: managerName,
                  node: responseClusterLocalInfo.data.data.affected_items[0].node,
                  cluster: clusterEnabled
                    ? responseClusterLocalInfo.data.data.affected_items[0].cluster
                    : 'Disabled',
                };
              }
            } else {
              // Cluster mode is not active
              api.cluster_info = {
                status: 'disabled',
                manager: managerName,
                cluster: 'Disabled',
              };
            }
          } else {
            // Cluster mode is not active
            api.cluster_info = {
              status: 'disabled',
              manager: managerName,
              cluster: 'Disabled',
            };
          }

          if (api.cluster_info) {
            // Update cluster information in the wazuh-registry.json
            await this.updateRegistry.updateClusterInfo(id, api.cluster_info);

            // Hide Wazuh API secret, username, password
            const copied = { ...api };
            copied.secret = '****';
            copied.password = '****';

            return response.ok({
              body: {
                statusCode: 200,
                data: copied,
                idChanged: request.idChanged || null,
              }
            });
          }
        }
      }

      // If we have an invalid response from the Wazuh API
      throw new Error(responseManagerInfo.data.detail || `${api.url}:${api.port} is unreachable`);
    } catch (error) {
      log('wazuh-api:checkStoredAPI', error.message || error);
      if (error.code === 'EPROTO') {
        return response.ok({
          body: {
            statusCode: 200,
            data: { password: '****', apiIsDown: true },
          }
        });
      } else if (error.code === 'ECONNREFUSED') {
        return response.ok({
          body: {
            statusCode: 200,
            data: { password: '****', apiIsDown: true },
          }
        });
      } else {
        try {
          const apis = await this.manageHosts.getHosts();
          for (const api of apis) {
            try {
              const id = Object.keys(api)[0];
              const host = api[id];

              const response = await this.apiInterceptor(
                'get',
                `${host.url}:${host.port}/manager/info`,
                {},
                { idHost: id }
              );

              if (this.checkResponseIsDown(response)) {
                return ErrorResponse(
                  `ERROR3099 - ${response.data.detail || 'Wazuh not ready yet'}`,
                  3099,
                  500,
                  response
                );
              }
              if (response.status === 200) {
                request.body = id;
                request.idChanged = id;
                return this.checkStoredAPI(context, request, response);
              }
            } catch (error) { } // eslint-disable-line
          }
        } catch (error) {
          return ErrorResponse(error.message || error, 3020, 500, response);
        }
        return ErrorResponse(error.message || error, 3002, 500, response);
      }
    }
  }

  /**
   * This perfoms a validation of API params
   * @param {Object} body API params
   */
  validateCheckApiParams(body) {
    if (!('username' in body)) {
      return 'Missing param: API USERNAME';
    }

    if (!('password' in body) && !('id' in body)) {
      return 'Missing param: API PASSWORD';
    }

    if (!('url' in body)) {
      return 'Missing param: API URL';
    }

    if (!('port' in body)) {
      return 'Missing param: API PORT';
    }

    if (!body.url.includes('https://') && !body.url.includes('http://')) {
      return 'protocol_error';
    }

    return false;
  }

  /**
   * This check the wazuh-api configuration received in the POST body will work
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Object} status obj or ErrorResponse
   */
  async checkAPI(context: RequestHandlerContext, request: KibanaRequest, response: KibanaResponseFactory) {
    try {
      let apiAvailable = null;
      const notValid = this.validateCheckApiParams(request.body);
      if (notValid) return ErrorResponse(notValid, 3003, 500, response);
      log('wazuh-api:checkAPI', `${request.body.id} is valid`, 'debug');
      // Check if a Wazuh API id is given (already stored API)
      if (request.body && request.body.id && !request.body.password) {
        const data = await this.manageHosts.getHostById(request.body.id);
        if (data) {
          apiAvailable = data;
        } else {
          log('wazuh-api:checkAPI', `API ${request.body.id} not found`);
          return ErrorResponse(`The API ${request.body.id} was not found`, 3029, 500, response);
        }
        // Check if a password is given
      } else if (request.body && request.body.password) { // TODO: Check if this is in use
        apiAvailable = request.body;
        apiAvailable.password = Buffer.from(request.body.password, 'base64').toString('ascii');
      }
      const options = { idHost: request.body.id };
      if (request.body.forceRefresh) {
        options["forceRefresh"] = request.body.forceRefresh;
      }

      let responseManagerInfo = await this.apiInterceptor.request(
        'GET',
        `${apiAvailable.url}:${apiAvailable.port}/manager/info`,
        {},
        options
      );
      const responseIsDown = this.checkResponseIsDown(responseManagerInfo);

      if (responseIsDown) {
        return ErrorResponse(
          `ERROR3099 - ${responseManagerInfo.data.detail || 'Wazuh not ready yet'}`,
          3099,
          500,
          response
        );
      }

      // Check wrong credentials
      if (parseInt(responseManagerInfo.status) === 401) {
        log('wazuh-api:checkAPI', `Wrong Wazuh API credentials used`);
        return ErrorResponse('Wrong credentials', 3004, 500, response);
      }
      log('wazuh-api:checkAPI', `${request.body.id} credentials are valid`, 'debug');
      if (responseManagerInfo.status === 200 && responseManagerInfo.data) {
        let responseAgents = await this.apiInterceptor.request(
          'GET',
          `${apiAvailable.url}:${apiAvailable.port}/agents`,
          { params: { agents_list: '000' } },
          { idHost: request.body.id }
        );

        if (responseAgents.status === 200) {
          const managerName = responseAgents.data.data.affected_items[0].manager;

          let responseCluster = await this.apiInterceptor.request(
            'GET',
            `${apiAvailable.url}:${apiAvailable.port}/cluster/status`,
            {},
            { idHost: request.body.id }
          );

          // Check the run_as for the API user and update it
          let apiUserAllowRunAs = API_USER_STATUS_RUN_AS.DISABLED;
          if (apiAvailable.run_as) {
            const responseApiUserAllowRunAs = await this.apiInterceptor.request(
              'GET',
              `${apiAvailable.url}:${apiAvailable.port}/security/users/me`,
              {},
              { idHost: request.body.id }
            );
            if (responseApiUserAllowRunAs.status === 200) {
              apiUserAllowRunAs = responseApiUserAllowRunAs.data.data.affected_items[0].allow_run_as ? API_USER_STATUS_RUN_AS.ENABLED : API_USER_STATUS_RUN_AS.NOT_ALLOWED;
            }
          }
          CacheInMemoryAPIUserAllowRunAs.set(request.body.id, apiAvailable.username, apiUserAllowRunAs);

          if (responseCluster.status === 200) {
            log('wazuh-api:checkStoredAPI', `Wazuh API response is valid`, 'debug');
            if (responseCluster.data.data.enabled === 'yes') {
              // If cluster mode is active
              let responseClusterLocal = await this.apiInterceptor.request(
                'GET',
                `${apiAvailable.url}:${apiAvailable.port}/cluster/local/info`,
                {},
                { idHost: request.body.id }
              );

              if (responseClusterLocal.status === 200) {
                return response.ok({
                  body: {
                    manager: managerName,
                    node: responseClusterLocal.data.data.affected_items[0].node,
                    cluster: responseClusterLocal.data.data.affected_items[0].cluster,
                    status: 'enabled',
                    allow_run_as: apiUserAllowRunAs,
                  }
                });
              }
            } else {
              // Cluster mode is not active
              return response.ok({
                body: {
                  manager: managerName,
                  cluster: 'Disabled',
                  status: 'disabled',
                  allow_run_as: apiUserAllowRunAs,
                }
              });
            }
          }
        }
      }

      const tmpMsg = responseManagerInfo.data.detail || 'Unexpected error checking the Wazuh API';

      throw new Error(tmpMsg);
    } catch (error) {
      log('wazuh-api:checkAPI', error.message || error);

      if (error && error.response && error.response.status === 401) {
        return ErrorResponse(
          `Unathorized. Please check API credentials. ${error.response.data.message}`,
          401,
          401,
          response
        );
      }
      if (error && error.response && error.response.data && error.response.data.detail) {
        return ErrorResponse(
          error.response.data.detail,
          error.response.status || 500,
          error.response.status || 500,
          response
        );
      }
      if (error.code === 'EPROTO') {
        return ErrorResponse(
          'Wrong protocol being used to connect to the Wazuh API',
          3005,
          500,
          response
        );
      }
      return ErrorResponse(error.message || error, 3005, 500, response);
    }
  }

  /**
   * This get PCI requirements
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Array<Object>} requirements or ErrorResponse
   */
  async getPciRequirement(context: RequestHandlerContext, request: KibanaRequest, response: KibanaResponseFactory) {
    try {
      let pci_description = '';

      if (request.params.requirement === 'all') {
        if (!request.headers.id) {
          return response.ok({
            body: pciRequirementsFile
          });
        }

        const apiId = request.headers.id;
        const api = await this.manageHosts.getHostById(apiId);

        if (!Object.keys(api).length) {
          log('wazuh-api:getPciRequirement', `Cannot get the credentials for the host ${apiId}`);
          // Can not get credentials from wazuh-hosts
          return ErrorResponse('Unexpected error getting host credentials', 3007, 400, response);
        }

        const responseRequirement = await this.apiInterceptor.request(
          'get',
          `${api.url}:${api.port}/rules/requirement/pci`,
          {},
          { idHost: apiId }
        );

        if ((((responseRequirement || {}).data || {}).data || {}).affected_items) {
          let PCIobject = {};
          for (const item of responseRequirement.data.data.affected_items) {
            if (typeof pciRequirementsFile[item] !== 'undefined')
              PCIobject[item] = pciRequirementsFile[item];
          }
          return response.ok({
            body: PCIobject
          });
        } else {
          log(
            'wazuh-api:getPciRequirement',
            'An error occurred trying to parse PCI DSS requirements'
          );
          return ErrorResponse(
            'An error occurred trying to parse PCI DSS requirements',
            3009,
            400,
            response
          );
        }
      } else {
        if (typeof pciRequirementsFile[request.params.requirement] !== 'undefined') {
          pci_description = pciRequirementsFile[request.params.requirement];
        }

        return response.ok({
          body: {
            pci: {
              requirement: request.params.requirement,
              description: pci_description,
            }
          }
        });
      }
    } catch (error) {
      log('wazuh-api:getPciRequirement', error.message || error);
      return ErrorResponse(error.message || error, 3010, 400, response);
    }
  }

  /**
   * This get GDPR Requirements
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Array<Object>} requirements or ErrorResponse
   */
  async getGdprRequirement(context: RequestHandlerContext, request: KibanaRequest, response: KibanaResponseFactory) {
    try {
      let gdpr_description = '';

      if (request.params.requirement === 'all') {
        if (!request.headers.id) {
          return response.ok({
            body: gdprRequirementsFile
          });
        }

        const apiId = request.headers.id;
        const api = await this.manageHosts.getHostById(apiId);

        // Checking for GDPR
        const version = await this.apiInterceptor.request(
          'get',
          `${api.url}:${api.port}//`,
          {},
          { idHost: apiId }
        );
        const number = version.data.api_version;

        const [major, minor, patch] = number.split('.');

        if ((major >= 3 && minor < 2) || (major >= 3 && minor >= 2 && patch < 3)) {
          return {};
        }

        if (!Object.keys(api).length) {
          log('wazuh-api:getGdprRequirement', 'Unexpected error getting host credentials');
          // Can not get credentials from wazuh-hosts
          return ErrorResponse('Unexpected error getting host credentials', 3024, 400, response);
        }

        const responseRequirement = await this.apiInterceptor.request(
          'get',
          `${api.url}:${api.port}/rules/requirement/gdpr`,
          {},
          { idHost: apiId }
        );

        if ((((responseRequirement || {}).data || {}).data || {}).affected_items) {
          let GDPRobject = {};
          for (const item of responseRequirement.data.data.affected_items) {
            if (typeof gdprRequirementsFile[item] !== 'undefined')
              GDPRobject[item] = gdprRequirementsFile[item];
          }
          return response.ok({
            body: GDPRobject
          });
        } else {
          log(
            'wazuh-api:getGdprRequirement',
            'An error occurred trying to parse GDPR requirements'
          );
          return ErrorResponse(
            'An error occurred trying to parse GDPR requirements',
            3026,
            400,
            response
          );
        }
      } else {
        if (typeof gdprRequirementsFile[request.params.requirement] !== 'undefined') {
          gdpr_description = gdprRequirementsFile[request.params.requirement];
        }

        return response.ok({
          body: {
            gdpr: {
              requirement: request.params.requirement,
              description: gdpr_description,
            },
          }
        });
      }
    } catch (error) {
      log('wazuh-api:getGdprRequirement', error.message || error);
      return ErrorResponse(error.message || error, 3027, 400, response);
    }
  }

  checkResponseIsDown(response) {
    if (response.status !== 200) {
      // Avoid "Error communicating with socket" like errors
      const socketErrorCodes = [1013, 1014, 1017, 1018, 1019];
      const status = (response.data || {}).status || 1
      const isDown = socketErrorCodes.includes(status);

      isDown && log('wazuh-api:makeRequest', 'Wazuh API is online but Wazuh is not ready yet');

      return isDown;
    }
    return false;
  }

  /**
   * This get PCI requirements
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Array<Object>} requirements or ErrorResponse
   */
  async getHipaaRequirement(context: RequestHandlerContext, request: KibanaRequest, response: KibanaResponseFactory) {
    try {
      let hipaa_description = '';

      if (request.params.requirement === 'all') {
        if (!request.headers.id) {
          return response.ok({
            body: hipaaRequirementsFile
          });
        }

        const apiId = request.headers.id;
        const api = await this.manageHosts.getHostById(apiId);

        if (!Object.keys(api).length) {
          log('wazuh-api:getHipaaRequirement', 'Unexpected error getting host credentials');
          // Can not get credentials from wazuh-hosts
          return ErrorResponse('Unexpected error getting host credentials', 3007, 400, response);
        }

        const responseRequirement = await this.apiInterceptor.request(
          'get',
          `${api.url}:${api.port}/rules/requirement/hipaa`,
          {},
          { idHost: apiId }
        );

        if ((((responseRequirement || {}).data || {}).data || {}).affected_items) {
          let HIPAAobject = {};
          for (const item of responseRequirement.data.data.affected_items) {
            if (typeof hipaaRequirementsFile[item] !== 'undefined')
              HIPAAobject[item] = hipaaRequirementsFile[item];
          }
          return response.ok({
            body: HIPAAobject
          });
        } else {
          log(
            'wazuh-api:getPciRequirement',
            'An error occurred trying to parse HIPAA requirements'
          );
          return ErrorResponse(
            'An error occurred trying to parse HIPAA requirements',
            3009,
            400,
            response
          );
        }
      } else {
        if (typeof hipaaRequirementsFile[request.params.requirement] !== 'undefined') {
          hipaa_description = hipaaRequirementsFile[request.params.requirement];
        }

        return response.ok({
          body: {
            hipaa: {
              requirement: request.params.requirement,
              description: hipaa_description,
            },
          }
        });
      }
    } catch (error) {
      log('wazuh-api:getPciRequirement', error.message || error);
      return ErrorResponse(error.message || error, 3010, 400, response);
    }
  }

  /**
   * This get NIST 800-53 requirements
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Array<Object>} requirements or ErrorResponse
   */
  async getNistRequirement(context: RequestHandlerContext, request: KibanaRequest, response: KibanaResponseFactory) {
    try { // TODO: Fix this method
      let nist_description = '';

      if (request.params.requirement === 'all') {
        if (!request.headers.id) {
          return response.ok({
            body: nistRequirementsFile
          });
        }

        const apiId = request.headers.id;
        const api = await this.manageHosts.getHostById(apiId);
        if (!Object.keys(api).length) {
          log('wazuh-api:getNistRequirement', 'Unexpected error getting host credentials');
          // Can not get credentials from wazuh-hosts
          return ErrorResponse('Unexpected error getting host credentials', 3007, 400, response);
        }

        const responseRequirement = await this.apiInterceptor.request(
          'get',
          `${api.url}:${api.port}/rules/requirement/nist-800-53`,
          {},
          { idHost: apiId }
        );
        if ((((responseRequirement || {}).data || {}).data || {}).affected_items) {
          let NISTobject = {};
          for (const item of responseRequirement.data.data.affected_items) {
            if (typeof nistRequirementsFile[item] !== 'undefined')
              NISTobject[item] = nistRequirementsFile[item];
          }
          return response.ok({
            body: NISTobject
          });
        } else {
          log(
            'wazuh-api:getNistRequirement',
            'An error occurred trying to parse NIST 800-53 requirements'
          );
          return ErrorResponse(
            'An error occurred trying to parse NIST 800-53 requirements',
            3009,
            400,
            response
          );
        }
      } else {
        if (typeof nistRequirementsFile[request.params.requirement] !== 'undefined') {
          nist_description = nistRequirementsFile[request.params.requirement];
        }

        return response.ok({
          body: {
            nist: {
              requirement: request.params.requirement,
              description: nist_description,
            },
          }
        });
      }
    } catch (error) {
      log('wazuh-api:getNistRequirement', error.message || error);
      return ErrorResponse(error.message || error, 3010, 400, response);
    }
  }

  /**
   * This get TSC requirements
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Array<Object>} requirements or ErrorResponse
   */
  async getTSCRequirement(context: RequestHandlerContext, request: KibanaRequest, response: KibanaResponseFactory) {
    try {
      let tsc_description = '';

      if (request.params.requirement === 'all') {
        if (!request.headers.id) {
          return response.ok({
            body: tscRequirementsFile
          });
        }

        const apiId = request.headers.id;
        const api = await this.manageHosts.getHostById(apiId);

        if (!Object.keys(api).length) {
          log(
            'wazuh-api:getTSCRequirement',
            'Unexpected error getting host credentials'
          );
          // Can not get credentials from wazuh-hosts
          return ErrorResponse(
            'Unexpected error getting host credentials',
            3007,
            400,
            response
          );
        }

        const responseRequirement = await needle(
          'get',
          `${api.url}:${api.port}/rules/tsc`,
          {},
          ApiHelper.buildOptionsObject(api)
        );

        if ((((responseRequirement || {}).body || {}).data || {}).items) {
          let TSCobject = {};
          for (const item of responseRequirement.body.data.items) {
            if (typeof tscRequirementsFile[item] !== 'undefined')
              TSCobject[item] = tscRequirementsFile[item];
          }
          return response.ok({
            body: TSCobject
          });
        } else {
          log(
            'wazuh-api:getTSCRequirement',
            'An error occurred trying to parse TSC requirements'
          );
          return ErrorResponse(
            'An error occurred trying to parse TSC requirements',
            3009,
            400,
            response
          );
        }
      } else {
        if (
          typeof tscRequirementsFile[request.params.requirement] !== 'undefined'
        ) {
          tsc_description = tscRequirementsFile[request.params.requirement];
        }

        return response.ok({
          body: {
            tsc: {
              requirement: request.params.requirement,
              description: tsc_description
            }
          }
        });
      }
    } catch (error) {
      log('wazuh-api:getTSCRequirement', error.message || error);
      return ErrorResponse(error.message || error, 3010, 400, response);
    }
  }

  /**
   * Check main Wazuh daemons status
   * @param {*} api API entry stored in .wazuh
   * @param {*} path Optional. Wazuh API target path.
   */
  async checkDaemons(api, path) {
    try {
      const response = await this.apiInterceptor.request(
        'GET',
        getPath(api) + '/manager/status',
        {},
        { idHost: api.id }
      );

      const daemons = ((((response || {}).data || {}).data || {}).affected_items || [])[0] || {};

      const isCluster =
        ((api || {}).cluster_info || {}).status === 'enabled' &&
        typeof daemons['wazuh-clusterd'] !== 'undefined';
      const wazuhdbExists = typeof daemons['wazuh-db'] !== 'undefined';

      const execd = daemons['ossec-execd'] === 'running';
      const modulesd = daemons['wazuh-modulesd'] === 'running';
      const wazuhdb = wazuhdbExists ? daemons['wazuh-db'] === 'running' : true;
      const clusterd = isCluster ? daemons['wazuh-clusterd'] === 'running' : true;

      const isValid = execd && modulesd && wazuhdb && clusterd;

      isValid && log('wazuh-api:checkDaemons', `Wazuh is ready`, 'debug');

      if (path === '/ping') {
        return { isValid };
      }

      if (!isValid) {
        throw new Error('Wazuh not ready yet');
      }
    } catch (error) {
      log('wazuh-api:checkDaemons', error.message || error);
      return Promise.reject(error);
    }
  }

  sleep(timeMs) {
    // eslint-disable-next-line
    return new Promise((resolve, reject) => {
      setTimeout(resolve, timeMs);
    });
  }

  /**
   * Helper method for Dev Tools.
   * https://documentation.wazuh.com/current/user-manual/api/reference.html
   * Depending on the method and the path some parameters should be an array or not.
   * Since we allow the user to write the request using both comma-separated and array as well,
   * we need to check if it should be transformed or not.
   * @param {*} method The request method
   * @param {*} path The Wazuh API path
   */
  shouldKeepArrayAsIt(method, path) {
    // Methods that we must respect a do not transform them
    const isAgentsRestart = method === 'POST' && path === '/agents/restart';
    const isActiveResponse = method === 'PUT' && path.startsWith('/active-response/');
    const isAddingAgentsToGroup = method === 'POST' && path.startsWith('/agents/group/');

    // Returns true only if one of the above conditions is true
    return isAgentsRestart || isActiveResponse || isAddingAgentsToGroup;
  }

  /**
   * This performs a request over Wazuh API and returns its response
   * @param {String} method Method: GET, PUT, POST, DELETE
   * @param {String} path API route
   * @param {Object} data data and params to perform the request
   * @param {String} id API id
   * @param {Object} response
   * @returns {Object} API response or ErrorResponse
   */
  async makeRequest(method, path, data, id, response, token) {
    // console.log("makeRequest");
    // console.log(method);
    // console.log(method, path );
    // console.log(method, path, data );
    // console.log(method, path, data, id );
    // console.log(method, path, data, id, response)
    
    const devTools = !!(data || {}).devTools;
    try {
      const api = await this.manageHosts.getHostById(id);
      if (devTools) {
        delete data.devTools;
      }

      if (!Object.keys(api).length) {
        log('wazuh-api:makeRequest', 'Could not get host credentials');
        //Can not get credentials from wazuh-hosts
        return ErrorResponse('Could not get host credentials', 3011, 404, response);
      }

      let body = {}
      if (!data) {
        data = {};
      }

      const options = {};
      options['idHost'] = id;

      // Set content type application/xml if needed
      if (typeof (data || {}).body === 'string' && (data || {}).origin === 'xmleditor') {
        options.content_type = 'application/xml';
        delete data.origin;
      }

      if (typeof (data || {}).body === 'string' && (data || {}).origin === 'json') {
        options.content_type = 'application/json';
        delete data.origin;
      }

      if (typeof (data || {}).body === 'string' && (data || {}).origin === 'raw') {
        options.content_type = 'application/octet-stream';
        delete data.origin;
      }
      const delay = (data || {}).delay || 0;
      let fullUrl = getPath(api) + path;
      if (delay) {
        const current = new Date();
        this.queue.addJob({
          startAt: new Date(current.getTime() + delay),
          type: 'request',
          method,
          fullUrl,
          data,
          options,
        });
        return response.ok({
          body: { error: 0, message: 'Success' }
        });
      }

      if (path === '/ping') {
        try {
          const check = await this.checkDaemons(api, path);
          return check;
        } catch (error) {
          const isDown = (error || {}).code === 'ECONNREFUSED';
          if (!isDown) {
            log('wazuh-api:makeRequest', 'Wazuh API is online but Wazuh is not ready yet');
            return ErrorResponse(
              `ERROR3099 - ${error.message || 'Wazuh not ready yet'}`,
              3099,
              500,
              response
            );
          }
        }
      }

      log('wazuh-api:makeRequest', `${method} ${fullUrl}`, 'debug');

      // Extract keys from parameters
      const dataProperties = Object.keys(data);

      // Transform arrays into comma-separated string if applicable.
      // The reason is that we are accepting arrays for comma-separated
      // parameters in the Dev Tools
      if (!this.shouldKeepArrayAsIt(method, path)) {
        for (const key of dataProperties) {
          if (Array.isArray(data[key])) {
            data[key] = data[key].join();
          }
        }
      }

      const responseToken = await this.apiInterceptor.requestToken(method, fullUrl, data, options, token);  

      console.log(responseToken.data, path);
      
      const responseIsDown = this.checkResponseIsDown(responseToken);
      if (responseIsDown) {
        return ErrorResponse(
          `ERROR3099 - ${response.body.message || 'Wazuh not ready yet'}`,
          3099,
          500,
          response
        );
      }
      let responseBody = (responseToken || {}).data || {};
      if (!responseBody) {
        responseBody =
          typeof responseBody === 'string' && path.includes('/files') && method === 'GET'
            ? ' '
            : false;
        response.data = responseBody;
      }
      const responseError = response.status !== 200 ? response.status : false;

      if (!responseError && responseBody) {
        //cleanKeys(response);
        return response.ok({
          body: responseToken.data
        });
      }

      if (responseError && devTools) {
        return response.ok({
          body: response.data
        });
      }
      throw responseError && responseBody.detail
        ? { message: responseBody.detail, code: responseError }
        : new Error('Unexpected error fetching data from the Wazuh API');
    } catch (error) {
      if (error && error.response && error.response.status === 401) {
        return ErrorResponse(
          error.message || error,
          error.code ? `Wazuh API error: ${error.code}` : 3013,
          401,
          response
        );
      }
      const errorMsg = (error.response || {}).data || error.message
      log('wazuh-api:makeRequest', errorMsg || error);
      if (devTools) {
        return response.ok({
          body: { error: '3013', message: errorMsg || error }
        });
      } else {
        if ((error || {}).code && ApiErrorEquivalence[error.code]) {
          error.message = ApiErrorEquivalence[error.code];
        }
        return ErrorResponse(
          errorMsg.detail || error,
          error.code ? `Wazuh API error: ${error.code}` : 3013,
          500,
          response
        );
      }
    }
  }

  /**
   * This performs a generic request and returs its response
   * @param {String} method Method: GET, PUT, POST, DELETE
   * @param {String} path API route
   * @param {Object} data data and params to perform the request
   * @param {String} id API id
   */
  async makeGenericRequest(method, path, data, id) {
    try {
      const api = await this.manageHosts.getHostById(id);
      if (!Object.keys(api).length) {
        //Can not get credentials from wazuh-hosts
        throw new Error('Could not get host credentials');
      }

      if (!method.match(/^(?:GET|PUT|POST|DELETE)$/)) {
        log('wazuh-api:makeRequest', 'Request method is not valid.');
        //Method is not a valid HTTP request method
        throw new Error('Request method is not valid.');
      }

      if (!path.match(/^\/.+/)) {
        log('wazuh-api:makeRequest', 'Request path is not valid.');
        //Path doesn't start with '/'
        throw new Error('Request path is not valid.');
      }

      if (!data) {
        data = {};
      }

      const fullUrl = getPath(api) + path;

      log('wazuh-api:makeGenericRequest', `${method} ${fullUrl}`, 'debug');

      const response = await this.apiInterceptor.request(
        'GET',
        fullUrl,
        data,
        { idHost: id }
      );

      if (response && response.data && !response.data.error && response.data.data) {
        cleanKeys(response);
        return response.data;
      }
      throw ((response || {}).data || {}).error && ((response || {}).data || {}).message
        ? { message: response.data.message, code: response.data.error }
        : new Error('Unexpected error fetching data from the Wazuh API');
    } catch (error) {
      log('wazuh-api:makeGenericRequest', error.message || error);
      return Promise.reject(error);
    }
  }

  /**
   * This make a request to API
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Object} api response or ErrorResponse
   */
  requestApi(context: RequestHandlerContext, request: KibanaRequest, response: KibanaResponseFactory) {

    const token = this.getTokenFromCookie(request.headers.cookie);
    const idApi = this.getApiIdFromCookie(request.headers.cookie);
    if (idApi !== request.body.id) { // if the current token belongs to a different API id, we relogin to obtain a new token
      return ErrorResponse(
        'status code 401',
        401,
        401,
        response
      );
    }
    if (!request.body.method) {
      return ErrorResponse('Missing param: method', 3015, 400, response);
    } else if (!request.body.method.match(/^(?:GET|PUT|POST|DELETE)$/)) {
      log('wazuh-api:makeRequest', 'Request method is not valid.');
      //Method is not a valid HTTP request method
      return ErrorResponse('Request method is not valid.', 3015, 400, response);
    } else if (!request.body.path) {
      return ErrorResponse('Missing param: path', 3016, 400, response);
    } else if (!request.body.path.match(/^\/.+/)) {
      log('wazuh-api:makeRequest', 'Request path is not valid.');
      //Path doesn't start with '/'
      return ErrorResponse('Request path is not valid.', 3015, 400, response);
    } else {
      return this.makeRequest(
        request.body.method,
        request.body.path,
        request.body.body,
        request.body.id,
        response,
        token
      );
    }
  }

  /**
   * Fetch agent status and insert it directly on demand
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Object} status obj or ErrorResponseerror.message || error
   */
  async fetchAgents(context: RequestHandlerContext, request: KibanaRequest, response: KibanaResponseFactory) {
    try {
      const output = await this.monitoringInstance.fetchAgentsExternal();
      return response.ok({
        body: {
          statusCode: 200,
          error: '0',
          data: '',
          output,
        }
      });
    } catch (error) {
      log('wazuh-api:fetchAgents', error.message || error);
      return ErrorResponse(error.message || error, 3018, 500, response);
    }
  }

  /**
   * Get full data on CSV format from a list Wazuh API endpoint
   * @param {Object} ctx
   * @param {Object} request
   * @param {Object} response
   * @returns {Object} csv or ErrorResponse
   */
  async csv(context: RequestHandlerContext, request: KibanaRequest, response: KibanaResponseFactory) {
    try {
      if (!request.body || !request.body.path) throw new Error('Field path is required');
      if (!request.body.id) throw new Error('Field id is required');

      const filters = Array.isArray(((request || {}).body || {}).filters) ? request.body.filters : [];

      const config = await this.manageHosts.getHostById(request.body.id);

      let tmpPath = request.body.path;

      if (tmpPath && typeof tmpPath === 'string') {
        tmpPath = tmpPath[0] === '/' ? tmpPath.substr(1) : tmpPath;
      }

      if (!tmpPath) throw new Error('An error occurred parsing path field');

      log('wazuh-api:csv', `Report ${tmpPath}`, 'debug');
      // Real limit, regardless the user query
      const params = { limit: 500 };

      if (filters.length) {
        for (const filter of filters) {
          if (!filter.name || !filter.value) continue;
          params[filter.name] = filter.value;
        }
      }

      let itemsArray = [];

      const output = await this.apiInterceptor.request(
        'GET',
        `${config.url}:${config.port}/${tmpPath}`,
        { params: params },
        { idHost: request.body.id }
      );

      const isList = request.body.path.includes('/lists') && request.body.filters && request.body.filters.length && request.body.filters.find(filter => filter._isCDBList);

      const totalItems = (((output || {}).data || {}).data || {}).total_affected_items;

      if (totalItems && !isList) {
        params.offset = 0;
        itemsArray.push(...output.data.data.affected_items);
        while (itemsArray.length < totalItems && params.offset < totalItems) {
          params.offset += params.limit;
          const tmpData = await this.apiInterceptor.request(
            'GET',
            `${config.url}:${config.port}/${tmpPath}`,
            { params: params },
            { idHost: request.body.id }
          );
          itemsArray.push(...tmpData.data.data.affected_items);
        }
      }

      if (totalItems) {
        const { path, filters } = request.body;
        const isArrayOfLists =
          path.includes('/lists') && !isList;
        const isAgents = path.includes('/agents') && !path.includes('groups');
        const isAgentsOfGroup = path.startsWith('/agents/groups/');
        const isFiles = path.endsWith('/files');
        let fields = Object.keys(output.data.data.affected_items[0]);

        if (isAgents || isAgentsOfGroup) {
          if (isFiles) {
            fields = ['filename', 'hash'];
          } else {
            fields = [
              'id',
              'status',
              'name',
              'ip',
              'group',
              'manager',
              'node_name',
              'dateAdd',
              'version',
              'lastKeepAlive',
              'os.arch',
              'os.build',
              'os.codename',
              'os.major',
              'os.minor',
              'os.name',
              'os.platform',
              'os.uname',
              'os.version',
            ];
          }
        }

        if (isArrayOfLists) {
          const flatLists = [];
          for (const list of itemsArray) {
            const { relative_dirname, items } = list;
            flatLists.push(...items.map(item => ({ relative_dirname, key: item.key, value: item.value })));
          }
          fields = ['relative_dirname', 'key', 'value'];
          itemsArray = [...flatLists];
        }

        if (isList) {
          fields = ['key', 'value'];
          itemsArray = output.data.data.affected_items[0].items;
        }
        fields = fields.map(item => ({ value: item, default: '-' }));

        const json2csvParser = new Parser({ fields });

        let csv = json2csvParser.parse(itemsArray);
        for (const field of fields) {
          const { value } = field;
          if (csv.includes(value)) {
            csv = csv.replace(value, KeyEquivalence[value] || value);
          }
        }

        return response.ok({
          headers: { 'Content-Type': 'text/csv' },
          body: csv
        });
      } else if (output && output.data && output.data.data && !output.data.data.total_affected_items) {
        throw new Error('No results');
      } else {
        throw new Error(`An error occurred fetching data from the Wazuh API${output && output.body && output.body.message ? `: ${output.body.message}` : ''}`);
      }
    } catch (error) {
      log('wazuh-api:csv', error.message || error);
      return ErrorResponse(error.message || error, 3034, 500, response);
    }
  }

  /**
   * Get the each filed unique values of agents
   * @param {Object} ctx
   * @param {Object} request
   * @param {Object} response
   * @returns {Array<Object>} unique fileds or ErrorResponse
   */
  async getAgentsFieldsUniqueCount(context: RequestHandlerContext, request: KibanaRequest, response: KibanaResponseFactory) {
    try {
      if (!request.params || !request.params.api) throw new Error('Field api is required');

      const config = await this.manageHosts.getHostById(request.params.api);

      const distinctUrl = `${config.url}:${config.port}/overview​/agents`;

      const data = await this.apiInterceptor.request(
        'get',
        distinctUrl,
        {},
        { idHost: request.body.id }
      );
      const responseData = (data || {}).data || {};

      const nodes = responseData.nodes;
      const groups = responseData.groups;
      const osPlatforms = responseData.agent_os;
      const versions = responseData.agent_version;
      const summary = responseData.agent_status;
      const lastAgent = responseData.last_registered_agent;

      const result = {
        groups: [],
        nodes: [],
        versions: [],
        osPlatforms: [],
        lastAgent: {},
        summary: {
          agentsCountActive: 0,
          agentsCountDisconnected: 0,
          agentsCountNeverConnected: 0,
          agentsCountTotal: 0,
          agentsCoverity: 0,
        },
      };

      if (nodes && nodes.items) {
        result.nodes = nodes.items
          .filter(item => !!item.node_name && item.node_name !== 'unknown')
          .map(item => item.node_name);
      }

      if (groups && groups.items) {
        result.groups = groups.items.map(item => item.name);
      }

      if (osPlatforms && osPlatforms.items) {
        result.osPlatforms = osPlatforms.items
          .filter(item => !!item.os && item.os.platform && item.os.name && item.os.version)
          .map(item => item.os);
      }

      if (versions && versions.items) {
        result.versions = versions.items.filter(item => !!item.version).map(item => item.version);
      }

      if (summary) {
        Object.assign(result.summary, {
          agentsCountActive: summary.Active,
          agentsCountDisconnected: summary.Disconnected,
          agentsCountNeverConnected: summary['Never connected'],
          agentsCountTotal: summary.Total,
          agentsCoverity:
            summary.Total ? ((summary.Active) / (summary.Total)) * 100 : 0,
        });
      }

      if (lastAgent) {
        Object.assign(result.lastAgent, lastAgent);
      }

      return response.ok({
        body: { error: 0, result }
      });
    } catch (error) {
      log('wazuh-api:getAgentsFieldsUniqueCount', error.message || error);
      return ErrorResponse(error.message || error, 3035, 500, response);
    }
  }

  // Get de list of available requests in the API
  getRequestList(context: RequestHandlerContext, request: KibanaRequest, response: KibanaResponseFactory) {
    //Read a static JSON until the api call has implemented
    return response.ok({
      body: apiRequestList
    });
  }

  /**
   * This get the timestamp field
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Object} timestamp field or ErrorResponse
   */
  getTimeStamp(context: RequestHandlerContext, request: KibanaRequest, response: KibanaResponseFactory) {
    try {
      const source = JSON.parse(fs.readFileSync(this.updateRegistry.file, 'utf8'));
      if (source.installationDate && source.lastRestart) {
        log(
          'wazuh-api:getTimeStamp',
          `Installation date: ${source.installationDate}. Last restart: ${source.lastRestart}`,
          'debug'
        );
        return response.ok({
          body: {
            installationDate: source.installationDate,
            lastRestart: source.lastRestart,
          }
        });
      } else {
        throw new Error('Could not fetch wazuh-version registry');
      }
    } catch (error) {
      log('wazuh-api:getTimeStamp', error.message || error);
      return ErrorResponse(
        error.message || 'Could not fetch wazuh-version registry',
        4001,
        500,
        response
      );
    }
  }

  /**
   * This get the extensions
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Object} extensions object or ErrorResponse
   */
  async setExtensions(context: RequestHandlerContext, request: KibanaRequest, response: KibanaResponseFactory) {
    try {
      const { id, extensions } = request.body;
      // Update cluster information in the wazuh-registry.json
      await this.updateRegistry.updateAPIExtensions(id, extensions);
      return response.ok({
        body: {
          statusCode: 200
        }
      });
    } catch (error) {
      log('wazuh-api:setExtensions', error.message || error);
      return ErrorResponse(
        error.message || 'Could not set extensions',
        4001,
        500,
        response
      );
    }
  }

  /**
   * This get the extensions
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Object} extensions object or ErrorResponse
   */
  getExtensions(context: RequestHandlerContext, request: KibanaRequest, response: KibanaResponseFactory) {
    try {
      const source = JSON.parse(
        fs.readFileSync(this.updateRegistry.file, 'utf8')
      );
      return response.ok({
        body: {
          extensions: (source.hosts[request.params.id] || {}).extensions || {}
        }
      });
    } catch (error) {
      log('wazuh-api:getExtensions', error.message || error);
      return ErrorResponse(
        error.message || 'Could not fetch wazuh-version registry',
        4001,
        500,
        response
      );
    }
  }

  /**
   * This get the wazuh setup settings
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Object} setup info or ErrorResponse
   */
  async getSetupInfo(context: RequestHandlerContext, request: KibanaRequest, response: KibanaResponseFactory) {
    try {
      const source = JSON.parse(fs.readFileSync(this.updateRegistry.file, 'utf8'));
      return response.ok({
        body: {
          statusCode: 200,
          data: !Object.values(source).length ? '' : source
        }
      });
    } catch (error) {
      log('wazuh-api:getSetupInfo', error.message || error);
      return ErrorResponse(
        `Could not get data from wazuh-version registry due to ${error.message || error}`,
        4005,
        500,
        response
      );
    }
  }

  /**
   * Get basic syscollector information for given agent.
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Object} Basic syscollector information
   */
  async getSyscollector(context: RequestHandlerContext, request: KibanaRequest, response: KibanaResponseFactory) {
    try {
      const idApi = this.getApiIdFromCookie(request.headers.cookie);
      if (!request.params || !idApi || !request.params.agent) {
        throw new Error('Agent ID and API ID are required');
      }

      const { agent } = request.params;

      const config = await this.manageHosts.getHostById(idApi);

      const data = await Promise.all([
        this.apiInterceptor.request('GET', `${config.url}:${config.port}/syscollector/${agent}/hardware`, {}, { idHost: idApi }),
        this.apiInterceptor.request('GET', `${config.url}:${config.port}/syscollector/${agent}/os`, {}, { idHost: idApi })
      ]);

      const result = data.map(item => (item.data || {}).data || []);
      const [hardwareResponse, osResponse] = result;

      // Fill syscollector object
      const syscollector = {
        hardware:
          typeof hardwareResponse === 'object' && Object.keys(hardwareResponse).length
            ? { ...hardwareResponse.affected_items[0] }
            : false,
        os:
          typeof osResponse === 'object' && Object.keys(osResponse).length
            ? { ...osResponse.affected_items[0] }
            : false,
      };

      return response.ok({
        body: syscollector
      });
    } catch (error) {
      log('wazuh-api:getSyscollector', error.message || error);
      return ErrorResponse(error.message || error, 3035, 500, response);
    }
  }
}
