/*
 * Wazuh app - React component for showing the Mitre Att&ck intelligence left panel.
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
  EuiSpacer
} from '@elastic/eui';
import { WzFieldSearchDelay } from '../../../components/common/search';
import { MitreAttackResources } from './mitre_attack_resources';
import { ModuleMitreAttackIntelligenceResourceButton } from './module_mitre_attack_intelligence_resource_button'

export const ModuleMitreAttackIntelligenceLeftPanel = ({onSelectResource, selectedResource, onSearchTermAllResourcesChange, onSearchTermAllResourcesSearch}) => {
  return (
    <>
      <WzFieldSearchDelay
        delay={1000}
        fullWidth
        placeholder='Search in all resources'
        onChange={onSearchTermAllResourcesChange}
        onSearch={onSearchTermAllResourcesSearch}
        isClearable
        aria-label='Search in all resources'
      />
      <EuiSpacer size='s'/>
      {MitreAttackResources.map(resource => (
        <ModuleMitreAttackIntelligenceResourceButton
          key={`module_mitre_attack_intelligence_left_panel_resource_${resource.id}`}
          isSelected={resource.id === selectedResource}
          onClick={() => onSelectResource(resource.id)}
        >
          {resource.label}
        </ModuleMitreAttackIntelligenceResourceButton>
      ))}
    </>
  )
};


