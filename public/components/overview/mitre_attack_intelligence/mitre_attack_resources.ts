/*
 * Wazuh app - Mitre Att&ck resouces.
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

import { WzRequest } from '../../../react-services';
import { Markdown } from '../../common/util';

const getMitreAttackIntelligenceSuggestions = (endpoint: string, field: string) => async (input: string) => {
  try{
    const response = await WzRequest.apiReq('GET', endpoint, {});
    return response?.data?.data.affected_items
      .map(item => ({
        ...item,
        ['references.external_id']: item?.references?.find(reference => reference.source === 'mitre-attack')?.external_id
      }))
      .map(item => item[field])
      .filter(item => item && item.toLowerCase().includes(input.toLowerCase()))
      .sort()
      .slice(0,9)
  }catch(error){
    return [];
  }
};

function buildResource(label: string, labelResource: string){
  const id = label.toLowerCase();
  const endpoint: string = `/mitre/${id}`;
  return {
    label: label,
    id,
    searchBarSuggestions: [{
        type: 'q',
        label: 'references.external_id',
        description: `${labelResource} ID`,
        operators: ['=', '!='],
        values: getMitreAttackIntelligenceSuggestions(endpoint, 'references.external_id')
      },
      {
        type: 'q',
        label: 'name',
        description: `${labelResource} name`,
        operators: ['=', '!='],
        values: getMitreAttackIntelligenceSuggestions(endpoint, 'name')
      },
      {
        type: 'q',
        label: 'description',
        description: `${labelResource} description`,
        operators: ['~'],
        values: (input) => input ? [input] : []
      }
    ],
    apiEndpoint: endpoint,
    fieldName: 'name',
    initialSortingField: 'name',
    tableColumns: [
      {
        field: 'references.external_id',
        name: 'ID',
        // sortable: true,
        width: '12%'
      },
      {
        field: 'name',
        name: 'Name',
        sortable: true,
        width: '30%'
      },
      {
        field: 'description',
        name: 'Description',
        sortable: true,
        render: (value) => value ? (
          Markdown({markdown: value})
        ) : '',
        truncateText: true
      }
    ]
  }
};

export const MitreAttackResources = [
  buildResource('Groups', 'Group'),
  buildResource('Mitigations', 'Mitigation'),
  {
    label: 'References',
    id: 'references',
    searchBarSuggestions: [
      {
        type: 'q',
        label: 'type',
        description: `Reference type`,
        operators: ['=', '!='],
        values: ['group', 'mitigation', 'software', 'tactic', 'technique']
      },
      {
        type: 'q',
        label: 'description',
        description: `Reference description`,
        operators: ['~'],
        values: (input) => input ? [input] : []
      }
    ],
    apiEndpoint: '/mitre/references',
    fieldName: 'type',
    initialSortingField: 'type',
    tableColumns: [
      {
        field: 'id',
        name: 'ID',
        sortable: true,
        width: '12%'
      },
      {
        field: 'type',
        name: 'Type',
        sortable: true,
        width: '30%'
      },
      {
        field: 'description',
        name: 'Description',
        sortable: true,
        render: (value) => value ? (
          Markdown({markdown: value})
        ) : '',
        truncateText: true
      }
    ]
  },
  buildResource('Software', 'Software'),
  buildResource('Tactics', 'Tactic'),
  buildResource('Techniques', 'Technique')
];