/*
 * Wazuh app - React component for all management section.
 * Copyright (C) 2015-2020 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import React, { Component, Fragment } from 'react';
// Redux
import store from '../../../../redux/store';

import { updateRulesetSection } from '../../../../redux/actions/rulesetActions';
import WzRuleset from './ruleset/main-ruleset';
import WzGroups from './groups/groups-main';
import WzStatus from './status/status-main';
import WzLogs from './mg-logs/logs';
import WzReporting from './reporting/reporting-main';
import WzConfiguration from './configuration/configuration-main';
import WzStatistics from './statistics/statistics-main';
import WzAddModulesData from '../../../../components/add-modules-data/add-modules-data-main';
import { connect } from 'react-redux';

class WzManagementMain extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.store = store;
  }
  UNSAFE_componentWillMount() {
    this.props.updateRulesetSection(this.props.section);
  }

  componentWillUnmount() {
    store.dispatch(updateRulesetSection(''));
  }

  render() {
    const { section } = this.props;
    const ruleset = ['ruleset', 'rules', 'decoders', 'lists'];
    return (
      <Fragment>
        {(section === 'groups' && <WzGroups {...this.props} />) ||
          (section === 'status' && <WzStatus />) ||
          (section === 'reporting' && <WzReporting />) ||
          (section === 'statistics' && <WzStatistics />) ||
          (section === 'logs' && <WzLogs />) ||
          (section === 'configuration' && <WzConfiguration {...this.props.configurationProps} />) ||
          (section === 'setup_modules' && <WzAddModulesData />) ||
          (ruleset.includes(section) && <WzRuleset />)
        }
      </Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    state: state.managementReducers
  };
}

const mapDispatchToProps = dispatch => {
  return {
    updateRulesetSection: section => dispatch(updateRulesetSection(section))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WzManagementMain);
