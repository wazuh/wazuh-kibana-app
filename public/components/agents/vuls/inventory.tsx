/*
 * Wazuh app - Agent vulnerabilities components
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import React, { Component, Fragment } from 'react';
import {
  EuiPanel,
  EuiPage,
  EuiTabs,
  EuiTab,
  EuiTitle,
  EuiLoadingSpinner,
  EuiEmptyPrompt,
  EuiSpacer,
  EuiProgress,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiHorizontalRule,
  EuiButtonEmpty
} from '@elastic/eui';
import {
  InventoryTable,
  FilterBar
} from './inventory/';
import { WzRequest } from '../../../react-services/wz-request';
import exportCsv from '../../../react-services/wz-csv';
import { getToasts }  from '../../../kibana-services';
import { ICustomBadges } from '../../wz-search-bar/components';
import { filtersToObject } from '../../wz-search-bar';
import { WzEmptyPromptNoPermissions } from "../../common/permissions/prompt";

// import mockup from './vuls-mockup';

export class Inventory extends Component {
  _isMount = false;
  state: {
    filters: [];
    totalItems: number;
    isLoading: Boolean;
    items: [];
    customBadges: ICustomBadges[];
    // isConfigured: Boolean;
  };

  props: any;

  constructor(props) {
    super(props);
    this.state = {
      filters: [],
      items: [],
      totalItems: 0,
      isLoading: true,
      customBadges: []/*,
      isConfigured: false*/
    }
    this.onFiltersChange.bind(this);
  }

  async componentDidMount() {
    this._isMount = true;
    await this.loadAgent();
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(this.props.agent) !== JSON.stringify(prevProps.agent)){
      this.setState({isLoading: true}, this.loadAgent)
    }
  }

  componentWillUnmount() {
    this._isMount = false;
  }

  async loadAgent() {
    // const agentPlatform  = ((this.props.agent || {}).os || {}).platform;
    const {totalItems, items} = await this.getItemNumber();
    // const isConfigured = await this.isConfigured();
    if (this._isMount){
      this.setState({ totalItems, items, isLoading: false/*, isConfigured*/ });
    }
  }

  // Do not load the localStorage filters when changing tabs
  // componentDidUpdate(prevProps, prevState) {
  //   const { selectedTabId } = this.state;
  //   if (selectedTabId !== prevState.selectedTabId) {
  //     const filters = this.getStoreFilters(this.props);
  //     this.setState({ filters });
  //   }
  // }

  // tabs() {
  //   let auxTabs = [
  //     {
  //       id: 'vulnerabilities',
  //       name: `Vulnerabilities ${this.state.isLoading === true ? '' : '(' + this.state.totalItemsFile + ')'}`,
  //       disabled: false,
  //     },
  //   ];
  //   // const platform = (this.props.agent.os || {}).platform || "other";
  //   //  platform  === 'windows' ? auxTabs.push(
  //   //   {
  //   //     id: 'registry',
  //   //     name: `Windows Registry ${this.state.isLoading === true ? '' : '(' + this.state.totalItemsRegistry + ')'}`,
  //   //     disabled: false,
  //   //   },
  //   // ) : null;
  //   return (auxTabs);
  // }

  getStoreFilters(props) {
    const { section, selectView, agent } = props;
    const filters = JSON.parse(window.localStorage.getItem(`wazuh-${section}-${selectView}-vulnerabilities-${agent['id']}`) || '{}');
    return filters;
  }

  setStoreFilters(filters) {
    const { section, selectView, agent } = this.props;
    window.localStorage.setItem(`wazuh-${section}-${selectView}-vulnerabilities-${agent['id']}`, JSON.stringify(filters))
  }

  onFiltersChange = (filters) => {
    // this.setStoreFilters(filters);
    this.setState({ filters });
  }

  onTotalItemsChange = (totalItems: number) => {
    this.setState({ totalItemsFile: totalItems });
  }

  // onSelectedTabChanged = id => {
  //   this.setState({ selectedTabId: id });
  // }

  buildFilter() {
    const filters = filtersToObject(this.state.filters);
    const filter = {
      ...filters,
      limit: '15' 
    };
    return filter;
  }

  async getItemNumber() {
    try {
      const agentID = this.props.agent.id;
      let response = await WzRequest.apiReq('GET', `/vulnerability/${agentID}`, {
        params: this.buildFilter(),
      });
      // response = mockup;
      return {
        totalItems: ((response.data || {}).data || {}).total_affected_items || 0,
        items: ((response.data || {}).data || {}).affected_items || [],
      };
    } catch (error) {
      this.setState({ isLoading: false });
      this.showToast('danger', error, 3000);
    }
  }

  renderTabs() {
    // const tabs = this.tabs();
    const { isLoading } = this.state;
    
      return (
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiTitle size="s">
              <h1>Vulnerabilities&nbsp;{isLoading === true && <EuiLoadingSpinner size="s" />}</h1>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty iconType="importAction" onClick={() => this.downloadCsv()}>
              Export formatted
            </EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
      )
  }

  showToast = (color, title, time) => {
    getToasts().add({
      color: color,
      title: title,
      toastLifeTimeMs: time,
    });
  };

  async downloadCsv() {
    const { filters } = this.state;
    try {
      const filtersObject = filtersToObject(filters);
      const formatedFilters = Object.keys(filtersObject).map(key => ({name: key, value: filtersObject[key]}));
      this.showToast('success', 'Your download should begin automatically...', 3000);
      await exportCsv(
        '/vulnerability/' + this.props.agent.id,
        [{},
          // { name: 'type', value: 'vulnerabilities' },
          ...formatedFilters
        ],
        `vuls-vulnerabilities`
      );
    } catch (error) {
      this.showToast('danger', error, 3000);
    }
  }

  renderTable() {
    const { filters, items,  totalItems } = this.state;
    return (
      <div>
        <FilterBar
          filters={filters}
          onFiltersChange={this.onFiltersChange}
          // selectView={selectedTabId}
          agent={this.props.agent} />
          <InventoryTable
            {...this.props}
            filters={filters}
            items={items}
            totalItems={totalItems}
            onFiltersChange={this.onFiltersChange}
            onTotalItemsChange={this.onTotalItemsChange}/>
      </div>
    )
  }

  // noConfigured() {
  //   return (
  //     <EuiEmptyPrompt
  //       iconType="filebeatApp"
  //       title={<h2>Vulnerabilities is not configured for this agent</h2>}
  //       body={<Fragment>
  //         <EuiHorizontalRule margin='s' />
  //         <EuiLink
  //           href='https://documentation.wazuh.com/current/user-manual/capabilities/file-integrity/index.html'
  //           target="_blank"
  //           style={{ textAlign: "center" }}
  //         >
  //           https://documentation.wazuh.com/current/user-manual/capabilities/file-integrity/index.html
  //         </EuiLink>
  //         <EuiHorizontalRule margin='s' />
  //       </Fragment>}
  //     />);
  // }

  loadingInventory() {
    return <EuiPage>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiProgress size="xs" color="primary" />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPage>;
  }

  // async isConfigured() {
  //   try {
  //     const response = await WzRequest.apiReq(
  //       'GET',
  //       `/agents/${this.props.agent.id}/config/syscheck/syscheck`,
  //       {}
  //     );

  //     return (((response.data || {}).data).syscheck || {}).disabled === 'no';
  //   } catch (error) {
  //     return false;
  //   }
  // }

  render() {
    const { isLoading/*, isConfigured*/ } = this.state;
    if (isLoading) {
      return this.loadingInventory()
    }
    const table = this.renderTable();
    const tabs = this.renderTabs();

    return /*isConfigured ? (*/ <EuiPage>
        <EuiPanel>
          {tabs}
          <EuiSpacer size={(((this.props.agent || {}).os || {}).platform || false) === 'windows' ? 's' : 'm'} />
          {table}
        </EuiPanel>
      </EuiPage>
      //) : this.noConfigured()
  }
}
