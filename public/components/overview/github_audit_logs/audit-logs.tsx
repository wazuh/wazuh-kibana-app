/*
 * Wazuh app - React component for showing the Mitre Att&ck intelligence.
 *
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import React from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import { KbnSearchBar } from '../../kbn-search-bar';

export const ModuleGitHubAuditLogs = () => {
  return (
    <div>
       <EuiFlexGroup>
          <EuiFlexItem>
            <div className='wz-discover hide-filter-control' >
              <KbnSearchBar/>
            </div>
          </EuiFlexItem>
        </EuiFlexGroup>
    </div>
  )
};
