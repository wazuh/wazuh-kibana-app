import React, { Component, Fragment } from "react";
import Proptypes from "prop-types";

import {
  EuiSpacer
} from "@elastic/eui";

import WzNoConfig from '../util-components/no-config';
import { isString } from '../utils/utils';

const helpLinks = [
  { text: 'How to generate automatic reports', href: 'https://documentation.wazuh.com/current/user-manual/manager/automatic-reports.html'},
  { text: 'Reports reference', href: 'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/reports.html' }
];

const mainSettings = [
  { field: 'title', label: 'Report name'},
  { field: 'mail_to', label: 'Send report to this email addresses' },
  { field: 'showlogs', label: 'Include logs when creating a report' },
  { field: 'group', label: 'Filter by this group' },
  { field: 'category', label: 'Filter by this category' },
  { field: 'rule', label: 'Filter by this rule ID' },
  { field: 'level', label: 'Filter by this alert level and above' },
  { field: 'location', label: 'Filter by this log location' },
  { field: 'srcip', label: 'Filter by this source IP address' },
  { field: 'user', label: 'Filter by this user name' }
];

class WzConfigurationAlertsReports extends Component{
  constructor(props){
    super(props);
    this.state = {
      view: '',
      selectedItemIndex: 0
    };

  }
  selectItem(selectedItem){
    this.setState({ selectedItem })
  }
  changeView(view){
    this.setState({ view });
  }
  render(){
    //TODO: 
    const { selectedItemIndex } = this.state;
    const { currentConfig } = this.props;
    const selectedItem = Array.isArray(currentConfig['monitor-reports'].email_alerts) && currentConfig['mail-alerts'].email_alerts[selectedItemIndex];
    return (
      <Fragment>
        {currentConfig['monitor-reports'] && isString(currentConfig['monitor-reports']) && (
          <WzNoConfig error={currentConfig['monitor-reports']} help={helpLinks}/>
        )}
        {currentConfig['monitor-reports'] && !isString(currentConfig['monitor-reports']) && (!currentConfig['monitor-reports'].reports || !currentConfig['monitor-reports'].reports.length) && (
          <Fragment>
            <EuiSpacer size='s'/>
            <WzNoConfig error='not-present' help={helpLinks}/>
          </Fragment>
        )}
        {/*wazuhNotReadyYet && */ (!currentConfig || !currentConfig['monitor-reports']) && ( /* TODO: wazuhNotReady */
          <Fragment>
            <EuiSpacer size='s'/>
            <WzNoConfig error='Wazuh not ready yet' help={helpLinks}/>
          </Fragment>
        )}
        {selectedItem && (
          <WzConfigurationSettingsTabSelector
            title='Main settings'
            description='Daily reports about alerts'
            currentConfig={currentConfig}
            helpLinks={helpLinks}>
              <ul>
                {currentConfig['monitor-reports'].email_alerts.map((item, key) => (
                  <li key={`monitor-reports-${key}`} onClick={() => this.selectItem(key)}></li>
                ))}
              </ul>
              <EuiSpacer size='s'/>
              {mainSettings.map((item, key) => 
                <WzConfigurationSetting key={`monitor-reports-${key}-setting`} keyItem={`monitor-reports-${key}`} description={item.text} value={selectedItem[item.key]}/>
              )}
          </WzConfigurationSettingsTabSelector>
        )}
      </Fragment>
    )
  }
}

export default WzConfigurationAlertsReports;