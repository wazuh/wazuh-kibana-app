/*
 * Wazuh app - React component for groups.
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import React, { Component } from 'react';
// Redux
import store from '../../../../../redux/store';
import WzReduxProvider from '../../../../../redux/wz-redux-provider';
//Wazuh groups overview
import WzGroupsOverview from './groups-overview';
import WzGroupDetail from './group-detail';
import WzGroupEditor from './groups-editor';
import { updateGroupDetail } from '../../../../../redux/actions/groupsActions';
import {
  updateShowAddAgents,
  resetGroup
} from '../../../../../redux/actions/groupsActions';
import { connect } from 'react-redux';
import { updateGlobalBreadcrumb } from '../../../../../redux/actions/globalBreadcrumbActions';
import { WzRequest } from '../../../../../react-services/wz-request';

class WzGroups extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  setGlobalBreadcrumb() {
    const breadcrumb = [
      { text: '' },
      { text: 'Management', href: '/app/wazuh#/manager' },
      { text: 'Groups' }
    ];
    store.dispatch(updateGlobalBreadcrumb(breadcrumb));
  }

  async componentDidMount() {
    this.setGlobalBreadcrumb();
    console.log(window.location.href)
    // Check if there is a group in the URL
    const [_, group] = window.location.href.match(new RegExp('group=' + '([^&]*)')) || [];
    window.location.href = window.location.href.replace(new RegExp('group=' + '[^&]*'), '');
    if(group){
      try{
        // Try if the group can be accesed
        const responseGroup = await WzRequest.apiReq('GET', '/groups', {params: {groups_list: group}});
        const dataGroup = responseGroup?.data?.data?.affected_items?.[0];
        this.props.updateGroupDetail(dataGroup);
      }catch(error){};
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      nextProps.groupsProps.closeAddingAgents &&
      this.props.state.showAddAgents
    ) {
      this.props.updateShowAddAgents(false);
    }
    if (
      nextProps.groupsProps.selectedGroup &&
      nextProps.groupsProps.selectedGroup !==
        this.props.groupsProps.selectedGroup
    ) {
      store.dispatch(updateGroupDetail(nextProps.groupsProps.selectedGroup));
    }
  }
  componentWillUnmount() {
    // When the component is going to be unmounted the groups state is reset
    this.props.resetGroup();
  }
  componentDidUpdate() {
    if (this.props.groupsProps.selectedGroup) {
      this.props.groupsProps.updateProps();
    }
  }
  render() {
    const { itemDetail, showAddAgents, fileContent } = this.props.state;
    return (
      <WzReduxProvider>
        {!showAddAgents &&
          ((itemDetail && !fileContent && <WzGroupDetail {...this.props} />) ||
            (fileContent && <WzGroupEditor />) || <WzGroupsOverview />)}
      </WzReduxProvider>
    );
  }
}
const mapStateToProps = state => {
  return {
    state: state.groupsReducers
  };
};
const mapDispatchToProps = dispatch => {
  return {
    resetGroup: () => dispatch(resetGroup()),
    updateShowAddAgents: showAddAgents =>
      dispatch(updateShowAddAgents(showAddAgents)),
    updateGroupDetail: groupDetail => dispatch(updateGroupDetail(groupDetail))
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WzGroups);
