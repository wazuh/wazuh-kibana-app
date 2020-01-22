/*
* Wazuh app - React component for registering agents.
* Copyright (C) 2015-2020 Wazuh, Inc.
*
* This program is free software; you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation; either version 2 of the License, or
* (at your option) any later version.
*
* Find more information about this on the LICENSE file.
*/

import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";

import {
  EuiBasicTable,
  EuiFlexGroup,
  EuiFlexItem
} from "@elastic/eui";

import WzNoConfig from "../util-components/no-config";
import WzConfigurationSettingsTabSelector from "../util-components/configuration-settings-tab-selector";
import { renderValueOrNoValue } from '../utils/utils';
import helpLinks from './help-links';

const renderTableField = (item) => item || '-';

const renderUrlAttr = (item) => {
  if(item){
    return (
      <div style={{display: 'block'}}>
        {item.start && (
          <div><b>Start: </b>{item.start}</div>
        )}
        {item.end && (
          <div><b>End: </b>{item.end}</div>
        )}
        {item.port && (
          <div><b>Port: </b>{item.port}</div>
        )}
      </div>
      )
  }
  return '-'
}

const columnsAllowAttr = [
  { field: 'replaced_os' , name: 'Replaced OS', render: renderTableField },
  { field: 'src' , name: 'Source', render: (item) => renderTableField(item.toString()) },
];

const renderAllowAttr = (item) => {
  if(item){
    return (
      <EuiBasicTable 
        items={item}
        columns={columnsAllowAttr}
      />
    )
  }
  return '-'
}

const columns = [
  { field: 'name', name: 'Name' , render: renderValueOrNoValue },
  { field: 'version', name: 'Version' , render: renderValueOrNoValue },
  { field: 'update_interval', name: 'Update interval' , render: renderValueOrNoValue },
  { field: 'update_from_year', name: 'Update from year' , render: renderValueOrNoValue },
  { field: 'path', name: 'Path' , render: renderValueOrNoValue },
  { field: 'url', name: 'URL' , render: renderValueOrNoValue },
  { field: 'url_attrs', name: 'URL attributes', render: renderUrlAttr },
  { field: 'allow', name: 'Allow', render: renderAllowAttr }
];

class WzConfigurationVulnerabilitiesProviders extends Component{
  constructor(props){
    super(props);
  }
  render(){
    let { currentConfig, wodleConfig } = this.props;
    return (
      <Fragment>
        {(wodleConfig['vulnerability-detector'] && !wodleConfig['vulnerability-detector'].providers && (
          <WzNoConfig error='not-present' help={helpLinks}></WzNoConfig>
        )) || (
          <Fragment>
            <WzConfigurationSettingsTabSelector
              title='Providers'
              description='List of OVAL databases providers to check for vulnerability scans'
              currentConfig={wodleConfig}
              helpLinks={helpLinks}
            >
              <EuiBasicTable
                items={wodleConfig['vulnerability-detector'].providers}
                columns={columns}/>
            </WzConfigurationSettingsTabSelector>
          </Fragment>
        )}
      </Fragment>
    )
  }
}

WzConfigurationVulnerabilitiesProviders.propTypes = {
  
};

export default WzConfigurationVulnerabilitiesProviders;