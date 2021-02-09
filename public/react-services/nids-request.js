/*
 * Wazuh app - API request service
 * Copyright (C) 2015-2020 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import axios from 'axios';
import chrome from 'ui/chrome';
import { AppState } from './app-state';
import { ApiCheck } from './wz-api-check';
import { WzAuthentication } from './wz-authentication';
import { WzMisc } from '../factories/misc';
import { WazuhConfig } from './wazuh-config';
import { log } from '../../server/logger';

export class NidsRequest {  
  /**
   * Permorn a generic request
   * @param {String} method
   * @param {String} path
   * @param {Object} payload
   */

  static async genericReq(method, path, payload = null, customTimeout = false, shouldRetry = true,  checkAuth=false) {
    try {
      if (!method || !path) {
        throw new Error('Missing parameters');
      }
      //meter header!
      //meter Auth!
      const timeout = 30000;
      const url = chrome.addBasePath(path);
      
      const options = {
        method: method,
        headers: { 'Content-Type': 'application/json',  'kbn-xsrf':'kibana'},
        url: url,
        data: payload,
        timeout: customTimeout || timeout
      };
      
      const data = await axios(options);
      
      if (data.error) {
        throw new Error(data.error);
      }
      return Promise.resolve(data);
    } catch (error) {
      //if the requests fails, we need to check if the API is down
      const errorMessage = (error && error.response && error.response.data && error.response.data.message) || (error || {}).message;
      return errorMessage
        ? Promise.reject(errorMessage)
        : Promise.reject(error || 'Server did not respond');
    }
  }

  // /**
  //  * Perform a request to the Wazuh API
  //  * @param {String} method Eg. GET, PUT, POST, DELETE
  //  * @param {String} path API route
  //  * @param {Object} body Request body
  //  */
  // static async apiReq(method, path, body, shouldRetry=true) {
  //   try {
  //     if (!method || !path || !body) {
  //       throw new Error('Missing parameters');
  //     }
  //     const id = JSON.parse(AppState.getCurrentAPI()).id;
  //     const requestData = { method, path, body, id };
  //     const data = await this.genericReq('POST', '/api/request', requestData);
  //     const hasFailed = (((data || {}).data || {}).data || {}).total_failed_items || 0;
  //     if(hasFailed){
  //       const error = ((((data.data || {}).data || {}).failed_items || [])[0] || {}).error || {};
  //       const failed_ids = ((((data.data || {}).data || {}).failed_items || [])[0] || {}).id || {};
  //       const message = ((data.data || {}).message || "Unexpected error");
  //       return Promise.reject(`${message} (${error.code}) - ${error.message} ${failed_ids && failed_ids.length > 1 ? ` Affected ids: ${failed_ids} ` : ""}`)
  //     }
  //     return Promise.resolve(data);
  //   } catch (error) {
  //     return ((error || {}).data || {}).message || false
  //       ? Promise.reject(error.data.message)
  //       : Promise.reject(error.message || error);
  //   }
  // }

}
