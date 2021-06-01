/*
 * Wazuh app - Table with search bar
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import React, { useCallback, useState } from 'react';
import {
  EuiTitle,
  EuiLoadingSpinner,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import { filtersToObject } from '../../wz-search-bar';
import { TableWithSearchBar } from './table-with-search-bar';
import { TableDeafult } from './table-default'
import { WzRequest } from '../../../react-services/wz-request';
import { ExportTableCsv }  from './components/export-table-csv';

export function TableWzAPI({endpoint, ...rest}){

  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const onSearch = useCallback(async function(filters, pagination, sorting){
    try {
      const { pageIndex, pageSize } = pagination;
      const { field, direction } = sorting.sort;
      setIsLoading(true);
      setFilters(filters);

      const params = {
        ...filtersToObject(filters),
        offset: pageIndex * pageSize,
        limit: pageSize,
        sort: `${direction === 'asc' ? '+' : '-'}${field}`
      };

      const response = await WzRequest.apiReq('GET', endpoint, { params });

      const { affected_items: items, total_affected_items: totalItems } = ((response || {}).data || {}).data;
      setIsLoading(false);
      setTotalItems(totalItems);
      return { items: rest.mapResponseItem ? items.map(rest.mapResponseItem) : items, totalItems };
    } catch (error) {
      setIsLoading(false);
      setTotalItems(0);
      return Promise.reject(error);
    };
  },[]);

  const header = (
    <EuiFlexGroup>
      <EuiFlexItem>
        {rest.title && (
          <EuiTitle size="s">
            <h1>{rest.title} {isLoading ? <EuiLoadingSpinner size="s" /> : <span>({ totalItems })</span>}</h1>
          </EuiTitle>
        )}
      </EuiFlexItem>
      {rest.downloadCsv && <ExportTableCsv endpoint={endpoint} totalItems={totalItems} filters={filters} title={rest.title}/>}
    </EuiFlexGroup>
  )

  const table = rest.searchTable ?  
      <TableWithSearchBar
        onSearch={onSearch}
        {...rest}
      /> :
      <TableDeafult
        onSearch={onSearch}
        {...rest}
      />
  
  return (
  <>
    {header}
    {table}
  </>)
}

// Set default props
TableWzAPI.defaultProps = {
  title: null,
  downloadCsv: false,
  searchBar: false
};