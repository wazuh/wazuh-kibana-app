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

import React, { useCallback, useState, useRef } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';

import { MitreAttackResources } from './mitre_attack_resources';
import { ModuleMitreAttackIntelligenceLeftPanel } from './module_mitre_attack_intelligence_left_panel';
import { ModuleMitreAttackIntelligenceRightPanel } from './module_mitre_attack_intelligence_right_panel';
import { useAsyncAction } from '../../../components/common/hooks';
import { WzRequest } from '../../../react-services';
import { PanelSplit } from '../../../components/common/panels';

export const ModuleMitreIntelligence = () => {
  const [selectedResource, setSelectedResource] = useState(MitreAttackResources[0].id);
  const [searchTermAllResources, setSearchTermAllResources] = useState('');
  const searchTermAllResourcesLastSearch = useRef('');
  const [resourceFilters, setResourceFilters] = useState([]);
  const searchTermAllResourcesUsed = useRef(false);
  const searchTermAllResourcesAction = useAsyncAction(async (searchTerm) => {
    selectedResource !== null && setSelectedResource(null);
    searchTermAllResourcesUsed.current = true;
    searchTermAllResourcesLastSearch.current = searchTerm;
    const limitResults = 5;
    return (await Promise.all(
      MitreAttackResources.map(
        async resource => {
          const response = await WzRequest.apiReq('GET', resource.apiEndpoint, {params: { search: searchTerm, limit: limitResults }});
          return {
            id: resource.id,
            name: resource.label,
            fieldName: resource.fieldName,
            results: response?.data?.data?.affected_items,
            totalResults: response?.data?.data?.total_affected_items,
            loadMoreResults: response?.data?.data?.total_affected_items && response?.data?.data?.total_affected_items > limitResults && (() => {
              setResourceFilters([{field: 'search', value: searchTermAllResourcesLastSearch.current}]);
              setSelectedResource(resource.id);
            })
          }
        }
      )
      )).filter(searchTermAllResourcesResponse => searchTermAllResourcesResponse.results.length)
  }
  , [searchTermAllResources]);
  
  const onSelectResource = useCallback((resourceID) => {
    setSelectedResource(prevSelectedResource => prevSelectedResource === resourceID && searchTermAllResourcesUsed.current ? null : resourceID);
  }, [searchTermAllResourcesUsed.current]);

  const onSearchTermAllResourcesChange = useCallback((searchTerm) => {
    setSearchTermAllResources(searchTerm);
  }, []);

  return (
    <EuiFlexGroup style={{ margin: '0 8px' }}>
      <EuiFlexItem>
        <PanelSplit 
          side={<ModuleMitreAttackIntelligenceLeftPanel
            onSearchTermAllResourcesChange={onSearchTermAllResourcesChange}
            onSearchTermAllResourcesSearch={searchTermAllResourcesAction.run}
            onSelectResource={onSelectResource}
            selectedResource={selectedResource}
            />}
            sideProps={{style: {width: '15%' , minWidth: 145, overflowX: "hidden"}}}
            content={<ModuleMitreAttackIntelligenceRightPanel
              results={searchTermAllResourcesAction.data}
              loading={searchTermAllResourcesAction.running}
              selectedResource={selectedResource}
              resourceFilters={resourceFilters}
          />}
          contentProps={{style: { maxHeight: 'calc(100vh - 255px)', overflowY: 'auto', overflowX: 'hidden'}}}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  )
}
