/*
 * Wazuh app - React component for showing the Mitre Att&ck intelligence flyout tables.
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

import React , {useState, useEffect} from 'react';
import { WzRequest } from '../../../react-services';
import {
  EuiBasicTableColumn,
  EuiAccordion,
  SortDirection,
  EuiInMemoryTable,
} from '@elastic/eui';
import { Markdown } from '../../common/util/markdown';

type tablePropsType = (item) => {onClick: () => void};
type backToTopType = () => void;

interface referencesTableType {
  referencesName: string,
  referencesArray: Array<string>,
  tableProps: tablePropsType,
  backToTop: backToTopType
}

export const ReferencesTable = ({referencesName, referencesArray, tableProps, backToTop} : referencesTableType) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    getValues();
    backToTop();
  }, [referencesArray]);

  const getValues = async () => {
    setIsLoading(true);
    // We extract the ids from the references tables and count them in a string for the call that will extract the info
    const maxLength = 8100;
    const namesConcatenated = referencesArray.reduce((namesArray = [''], element) => {
      namesArray[namesArray.length -1].length >= maxLength && namesArray.push('');
      namesArray[namesArray.length -1] += `${namesArray[namesArray.length -1].length > 0 ? ',' :''}${element}`;
      return namesArray;
    }, ['']);

    // We make the call to extract the necessary information from the references tables
    try{
      const data = await Promise.all(namesConcatenated.map(async (nameConcatenated) => {
        const queryResult = await WzRequest.apiReq('GET', `/mitre/${referencesName}?${referencesName.replace(/s\s*$/, '')}_ids=${nameConcatenated}`, {});
        return ((((queryResult || {}).data || {}).data || {}).affected_items || []).map((item) => ({...item, ['references.external_id']: item.references.find(reference => reference.source === 'mitre-attack')?.external_id}));  
      }));
      setData(data.flat());  
    }
    catch (error){
      setIsLoading(false);
      return Promise.reject(error);
    }
    setIsLoading(false);
  }

  const columns: EuiBasicTableColumn<any>[] = [
    {
      field: 'references.external_id',
      name: 'ID',
      sortable: true,
    },
    {
      field: 'name',
      name: 'Name',
      sortable: true,
    },
    {
      field: 'description',
      name: 'Description',
      sortable: true,
      render: (item) => item ? <Markdown markdown={item} /> : '',
      truncateText: true
    },
  ];

  return (
    <EuiAccordion
      style={{ textDecoration: 'none' }}
      id=''
      className='events-accordion'
      buttonContent={referencesName.charAt(0).toUpperCase() + referencesName.slice(1)}
      paddingSize='none'
      initialIsOpen={true}
    >
      <EuiInMemoryTable
        columns={columns}
        items={data}
        loading={isLoading}
        pagination={{ pageSizeOptions: [5, 10, 20] }}
        sorting={{ sort: { field: 'name', direction: SortDirection.DESC } }}
        rowProps={tableProps}
      />
    </EuiAccordion>
  );
}

