/*
 * Wazuh app - React component for alerts stats.
 *
 * Copyright (C) 2015-2019 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { EuiPanel,
  EuiBasicTable,
  EuiFlexItem, 
  EuiFlexGroup, 
  EuiButtonEmpty, 
  EuiTitle,
  EuiTextColor,
  EuiFieldSearch, 
  EuiToolTip, 
  EuiButtonIcon, 
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiLoadingContent,
  EuiLink,
  EuiSpacer,
  EuiDescriptionList,
} from '@elastic/eui';


 export class MitreTable extends Component {
  constructor(props) {
    super(props);

     this.state = {
      tactics: [],
      searchValue: '',
      pageIndex: 0,
      pageSize: 10,
      sortField: 'id',
      sortDirection: 'asc',
      isProcessing: true,
      totalItems: 0,
      q: '',
      search: '',
      currentTechniqueData: {},
      isFlyoutVisible: false,
    };

    this.closeFlyout = this.closeFlyout.bind(this);
    this.showFlyout = this.showFlyout.bind(this);
  }




   async componentDidMount() {
    await this.getItems();
  }

  async componentDidUpdate() {
    if (this.state.isProcessing) {
      await this.getItems();
    }
  }

   formatTactic(tactic) {
     return {
      "id": tactic.id,
      "name": tactic.json.name,
      "phases": tactic.phases,
      "modified": tactic.json.modified,
      "actions": tactic
    }
  }


   async getItems(){
    const tactics = await this.props.wzReq('GET','/mitre',this.buildFilter());
    const formattedTactics =  (((tactics || {}).data || {}).data || {}).items.map(this.formatTactic);

     this.setState({
      tactics: formattedTactics,
      totalItems: (((tactics || {}).data || {}).data || {}).totalItems - 1,
      isProcessing: false,
    });
  }

   buildFilter() {
    const { pageIndex, pageSize, search, q} = this.state;


     const filter = {
      offset: pageIndex * pageSize,
      limit: pageSize,
      sort: this.buildSortFilter(),

    };

     if (q !== ''){
      filter.q = q
    }

     if (search !== '') {
      filter.search = search;
    }

     return filter;
  }



   buildSortFilter() {
    const {sortField, sortDirection} = this.state;

    const field = (sortField === 'os_name') ? '' : sortField;
    const direction = (sortDirection === 'asc') ? '+' : '-';

    return direction+field;
  }

   columns() {
    return [
      {
        field: 'id',
        name: 'ID',
        sortable: true,
      },
      {
        field: 'name',
        name: 'Name',
        sortable: false,
      },
      {
        field: 'modified',
        name: 'Modified',
        sortable: false,
      },
      {
        field: 'phases',
        name: 'Phases',
        sortable: false,
      },
      {
        field: 'actions',
        name: 'Actions',
        sortable: false,
        render: (tactic) => this.actionButtonsRender(tactic)
      },
    ];
  }


  actionButtonsRender(tactic) {
    return (
      <div>
        <EuiToolTip content="View details" position="left">
          <EuiButtonIcon
            onClick={() => this.showFlyout(tactic)}
            iconType="eye"
            aria-label="View details"
          />
        </EuiToolTip>
      </div>
    );
  }

  async showFlyout(techniqueData) {
    this.setState({ isFlyoutVisible: true });
    const result = await this.props.wzReq("GET", "/mitre",{q: `id=${techniqueData.id}`})
    const formattedResult = ((((result || {}).data || {}).data ).items || [])[0] || {}
    this.updateCurrentTechniqueData(formattedResult)
  }


  closeFlyout() {
    this.setState({ isFlyoutVisible: false, currentTechniqueData: {} });
  }

  onTableBarChange = e => {
    this.setState({
      searchValue: e.target.value,
    });
  };

  onTableBarSearch = searchTxt => {
    this.setState({
      search: searchTxt,
    });
  };



   onTableChange = ({ page = {}, sort = {} }) => {
    const { index: pageIndex, size: pageSize } = page;
    const { field: sortField, direction: sortDirection } = sort;
    this.setState({
      pageIndex,
      pageSize,
      sortField,
      sortDirection,
      isProcessing: true,
    });
  };
    /**
     * The "Export Formatted" button have been removed as long as the API can only returns 10 results.
     */
   formattedButton() { 
    return (
      <div>
        {/*
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty iconType="importAction" onClick={this.downloadCsv}>
              Export formatted          
            </EuiButtonEmpty>
          </EuiFlexItem>
        */}
      </div>
    );
  }

   title() {
    const formattedButton = this.formattedButton()
    return (
      <div>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiTitle>
                <h2>MITRE ATT&CK</h2>
              </EuiTitle>
            </EuiFlexItem>
          </EuiFlexGroup>
           <EuiSpacer size="m"/>
          <EuiFlexGroup>
            <EuiFlexItem style={{ paddingBottom: 10 }}>
              <EuiTextColor color="subdued">
                <p>
                From here you can list the globally-accessible knowledge base of adversary tactics and techniques based on real-world observations.
                </p>
              </EuiTextColor>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        {formattedButton}
      </EuiFlexGroup>
      { /*
      * Searchbar is disabled until our API adds the `search` filter to the `/mitre` call
      <EuiSpacer size="m"/>
      <EuiFlexGroup style={{ marginLeft: 2 }}>
        <EuiFieldSearch
                  fullWidth={true}
                  placeholder="Filter MITRE attacks"
                  value={this.state.searchValue}
                  onChange={this.onTableBarChange}
                  onSearch={this.onTableBarSearch}
                  aria-label="Filter MITRE attacks"
                />
        </EuiFlexGroup>
        */}
      </div>
    );
  }

   table(){
    const {pageIndex, pageSize, totalItems, sortField, sortDirection} = this.state
    const tactics = this.state.tactics
    const columns = this.columns()
    const pagination = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      totalItemCount: totalItems,
      hidePerPageOptions: true,
    }
    const sorting = {
      sort: {
        field: sortField,
        direction: sortDirection,
      },
    };

     return (
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiBasicTable
              items={tactics}
              columns={columns}
              pagination={pagination}
              onChange={this.onTableChange}
              sorting={sorting}
            />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

   filterBar() {
     return (
      <EuiFlexGroup>
        <EuiFlexItem>

         </EuiFlexItem>
      </EuiFlexGroup>
    );
  }


  updateCurrentTechniqueData(currentData) {
    if(currentData){
      const techniqueId = currentData.id

      let techniquePhases = currentData.phases
      if(currentData.phases && Array.isArray(currentData.phases))
        techniquePhases = currentData.phases.toString()
      
      let techniquePlatforms = currentData.platforms
      if(currentData.platforms && Array.isArray(currentData.platforms))
        techniquePlatforms = currentData.platforms.toString()

      let techniqueDataSources = currentData.json.x_mitre_data_sources
      if(currentData.json.x_mitre_data_sources && Array.isArray(currentData.json.x_mitre_data_sources))
        techniqueDataSources = currentData.json.x_mitre_data_sources.toString()
      
      const techniqueDescription = (currentData.json || {}).description
      const techniqueName = (currentData.json || {}).name
      const techniqueVersion = (currentData.json || {}).x_mitre_version

      this.setState({currentTechniqueData: {
        id: techniqueId,
        phases: techniquePhases,
        platforms: techniquePlatforms,
        description: techniqueDescription,
        name: techniqueName,
        dataSources: techniqueDataSources,
        version: techniqueVersion
        }
      })
    }
  }


  getFlyoutHeader(){
    return (<EuiFlyoutHeader hasBorder>
       {(Object.keys(this.state.currentTechniqueData).length === 0) &&
           <div>
             <EuiLoadingContent lines={1} />
           </div>
         ||
         <EuiTitle size="m">
           <h2 id="flyoutSmallTitle">{this.state.currentTechniqueData.name}</h2>
         </EuiTitle>
         }
     </EuiFlyoutHeader> 
    )
   }
 
   getFlyoutBody(){
     const link = `https://attack.mitre.org/techniques/${this.state.currentTechniqueData.id}/`
     
     const data = [
       {
         title: 'Id',
         description: this.state.currentTechniqueData.id,
       },
       {
         title: 'Tactic',
         description: this.state.currentTechniqueData.phases,
       },
       {
         title: 'Platform',
         description: this.state.currentTechniqueData.platforms,
       },
       {
         title: 'Data sources',
         description: this.state.currentTechniqueData.dataSources,
       },
       {
         title: 'Version',
         description: this.state.currentTechniqueData.version,
       },
       {
         title: 'Description',
         description: this.state.currentTechniqueData.description,
       },
     ];
     return (
       <EuiFlyoutBody>
         {(Object.keys(this.state.currentTechniqueData).length === 0) &&
           <div>
             <EuiLoadingContent lines={2} />
             <EuiLoadingContent lines={3} />
           </div>
         ||
         <div>
           <EuiDescriptionList listItems={data} />
           <EuiSpacer />
           <p>
             More info:{' '}
             <EuiLink href={link} target="_blank">
               {`MITRE ATT&CK - ${this.state.currentTechniqueData.id}`}
             </EuiLink>
           </p>
         </div>
         }
     </EuiFlyoutBody>
     )
   }


   render() {
    let flyout;
    if (this.state.isFlyoutVisible) {
      flyout = (
        
        <EuiFlyout
          onClose={this.closeFlyout}
          size="s"
          aria-labelledby="flyoutSmallTitle">
          {this.getFlyoutHeader()}
          {this.getFlyoutBody()}
        </EuiFlyout>
      );
    }
    

    const title = this.title();
    const filter = this.filterBar();
    const table = this.table();

     return (
       <div>
        <EuiPanel paddingSize="l">
          {title}
          {filter}
          {table}
        </EuiPanel>

        {flyout}
      </div>
    );
  }
}

 MitreTable.propTypes = {
  wzReq: PropTypes.func,
};