import React, { Component, Fragment } from "react";
import Proptypes from "prop-types";

import {
  
} from "@elastic/eui";

import WzConfigurationSettingsTabSelector from '../util-components/configuration-settings-tab-selector';
import WzNoConfig from '../util-components/no-config';
import { isString } from '../utils/utils';

const mainSettings = [
  { field: 'email_to', label: 'Send alerts to this email address'},
  { field: 'level', label: 'Minimum severity level to send the alert by email' },
  { field: 'group', label: 'Send only alerts that belong to one of these groups' },
  { field: 'event_location', label: 'Send alerts when they match this event location' },
  { field: 'format', label: 'Format for email alerts' },
  { field: 'rule_id', label: 'Send only alerts that belong to one of these rule IDs' },
  { field: 'do_not_delay', label: 'Disable delayed email delivery' },
  { field: 'do_not_group', label: 'Disable alerts grouping into the same email' }
];

const helpLinks = [
  { text: 'How to configure email alerts', href: 'https://documentation.wazuh.com/current/user-manual/manager/manual-email-report/index.html'},
  { text: 'How to configure authenticated SMTP server', href: 'https://documentation.wazuh.com/current/user-manual/manager/manual-email-report/smtp_authentication.html'},
  { text: 'Email alerts reference', href: 'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/email_alerts.html'}
];

class WzConfigurationAlertsEmailAlerts extends Component{
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
    const selectedItem = Array.isArray(currentConfig['mail-alerts'].email_alerts) && currentConfig['mail-alerts'].email_alerts[selectedItemIndex];
    return (
      <Fragment>
        {currentConfig['mail-alerts'] && isString(currentConfig['mail-alerts']) && (
          <WzNoConfig error={currentConfig['mail-alerts']} help={helpLinks}/>
        )}
        {currentConfig['mail-alerts'] && !isString(currentConfig['mail-alerts']) && (!currentConfig['mail-alerts'].email_alerts || !currentConfig['mail-alerts'].email_alerts.length) && (
          <Fragment>
            <EuiSpacer size='s'/>
            <WzNoConfig error='not-present' help={helpLinks}/>
          </Fragment>
        )}
        {/*wazuhNotReadyYet && */ (!currentConfig || !currentConfig['mail-alerts']) && ( /* TODO: wazuhNotReady */
          <Fragment>
            <EuiSpacer size='s'/>
            <WzNoConfig error='Wazuh not ready yet' help={helpLinks}/>
          </Fragment>
        )}
        {selectedItem && (
          <WzConfigurationSettingsTabSelector
            title='Main settings'
            description='Granular email alert options'
            currentConfig={currentConfig}
            helpLinks={helpLinks}>
              <ul>
                {currentConfig['mail-alerts'].email_alerts.map((item, key) => (
                  <li key={`mail-alerts-${key}`} onClick={() => this.selectItem(key)}></li>
                ))}
              </ul>
              <EuiSpacer size='s'/>
              {mainSettings.map(item => 
                <WzConfigurationSetting keyItem={'email-alerts'} description={item.text} value={selectedItem[item.key]}/>
              )}
          </WzConfigurationSettingsTabSelector>
        )}
      </Fragment>
    )
  }
}

export default WzConfigurationAlertsEmailAlerts;