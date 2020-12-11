/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { WzUserPermissions } from './wz-user-permissions';
//import { checkMissingUserPermissions } from './wz-user-permissions1';

const requiredPermissionsCluster = [
  {
    action: 'cluster:delete_file',
    resource: 'file:path:etc/lists/security-eventchannel',
  },
];

const requiredPermissionsManager = [
  {
    action: 'cluster:status',
    resource: '*:*:*',
  },
  {
    action: 'manager:read_file',
    resource: 'file:path:/etc/lists',
  },
  {
    action: 'manager:read',
    resource: '*:*:*',
  },
  {
    action: 'manager:upload_file',
    resource: 'file:path:/etc/lists',
  },
];

const userClusterTest = {
  'lists:read': {
    '*:*:*': 'allow',
    'list:path:*': 'allow',
    'node:id:*': 'allow',
  },
  'cluster:status': {
    '*:*:*': 'allow',
    'list:path:*': 'allow',
    'node:id:*': 'allow',
  },
  'cluster:read': {
    '*:*:*': 'allow',
    'list:path:*': 'allow',
    'node:id:*': 'allow',
  },
  'cluster:read_file': {
    '*:*:*': 'allow',
    'list:path:*': 'allow',
    'node:id:*': 'allow',
  },
  'cluster:delete_file': {
    '*:*:*': 'allow',
    'list:path:*': 'allow',
    'node:id:*': 'allow',
  },
  'cluster:upload_file': {
    '*:*:*': 'allow',
    'list:path:*': 'allow',
    'node:id:*': 'allow',
  },
  rbac_mode: 'white',
};

const userManagerTest = [
  {
    'manager:read': {
      '*:*:*': 'allow',
      'file:path:*': 'allow',
    },
    'manager:upload_file': {
      '*:*:*': 'allow',
      'file:path:*': 'allow',
    },
    'manager:read_file': {
      '*:*:*': 'allow',
      'file:path:*': 'allow',
    },
    rbac_mode: 'white',
  },
];

const missingPermissionsForClusterUser = [
  {
    action: 'cluster:delete_file',
    resource: 'file:path:etc/lists/security-eventchannel',
  },
];

const missingPermissionsForManagerUser = [
  {
    action: 'manager:read_file',
    resource: 'file:path:/etc/lists',
  },
  {
    action: 'manager:read',
    resource: '*:*:*',
  },
  {
    action: 'manager:upload_file',
    resource: 'file:path:/etc/lists',
  },
];

describe('Wazuh User Permissions', () => {
  describe('Given a Json with permissions that the user does not have', () => {
    describe('Should return a simple required permissions to show on view', () => {
      it('Should return a simple missing permissions for manager user', () => {
        const simplePermission = [
          {
            action: 'manager:status',
            resource: '*:*:*',
          },
        ];
        const result = WzUserPermissions.checkMissingUserPermissions(simplePermission, {
          'lists:read': {
            'list:path:*': 'allow',
          },
          rbac_mode: 'white',
        });
        expect(result).toEqual(simplePermission);
      });

      it('Should return a simple missing permissions for cluster user', () => {
        const simplePermission = [
          {
            action: 'cluster:status',
            resource: '*:*:*',
          },
        ];
        const result = WzUserPermissions.checkMissingUserPermissions(simplePermission, {
          'lists:read': {
            'list:path:*': 'allow',
          },
          rbac_mode: 'white',
        });
        expect(result).toEqual(simplePermission);
      });
    });

    describe('Should return all permissions ok', () => {
      it('Should return all permissions ok for manager user', () => {
        const simplePermission = [
          {
            action: 'manager:read_file',
            resource: 'file:path:/etc/lists',
          },
        ];
        const result = WzUserPermissions.checkMissingUserPermissions(
          simplePermission,
          userManagerTest
        );
        expect(result).toEqual(false); // false === all permissions OK
      });

      // it('Should return a simple missing permissions for cluster user', () => {
      //   const simplePermission = [
      //     {
      //       action: 'cluster:read',
      //       resource: 'node:id:*',
      //     },
      //   ];
      //   const result = WzUserPermissions.checkMissingUserPermissions(
      //     simplePermission,
      //     userClusterTest
      //   );
      //   expect(result).toEqual(false);
      // });
    });

    describe('Should return all the required permissions to show on view', () => {
      it('Should return missing permissions for manager user', () => {
        const result = WzUserPermissions.checkMissingUserPermissions(
          requiredPermissionsManager,
          userClusterTest
        );
        expect(result).toEqual(missingPermissionsForManagerUser);
      });

      it('Should return missing permissions for cluster user', () => {
        const result = WzUserPermissions.checkMissingUserPermissions(requiredPermissionsCluster, userClusterTest);
        expect(result).toEqual(missingPermissionsForClusterUser);
      });
    });
  });
});
