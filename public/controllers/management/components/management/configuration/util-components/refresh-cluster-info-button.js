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

import React, { Component } from "react";
import PropTypes from "prop-types";

import {
  EuiButtonEmpty
} from "@elastic/eui";

import { connect } from 'react-redux';
import { updateClusterNodes, updateClusterNodeSelected, updateLoadingStatus } from "../../../../../../redux/actions/configurationActions";
import { clusterNodes } from '../utils/wz-fetch';

class WzRefreshClusterInfoButton extends Component{
  constructor(props){
    super(props);
  }
  async checkIfClusterOrManager(){
    try{ // in case which enable/disable cluster configuration, update Redux Store
      // try if it is a cluster
      const nodes = await clusterNodes();
      // set cluster nodes in Redux Store
      this.props.updateClusterNodes(nodes.data.data.items);
      // set cluster node selected in Redux Store
      const existsClusterCurrentNodeSelected = nodes.data.data.items.find(node => node.name === this.props.clusterNodeSelected);
      this.props.updateClusterNodeSelected(existsClusterCurrentNodeSelected ? existsClusterCurrentNodeSelected.name : nodes.data.data.items.find(node => node.type === 'master').name);
      this.props.updateLoadingStatus(true);
      setTimeout(() => this.props.updateLoadingStatus(false),1); // Trick to unmount this component and redo the request to get XML configuration
    }catch(error){
      // do nothing if it isn't a cluster
      this.props.updateClusterNodes(false);
      this.props.updateClusterNodeSelected(false);
      this.props.updateLoadingStatus(true);
      setTimeout(() => this.props.updateLoadingStatus(false),1); // Trick to unmount this component and redo the request to get XML configuration
    }
  }
  render(){
    return (
      <EuiButtonEmpty iconType='refresh' onClick={() => this.checkIfClusterOrManager()}>Refresh</EuiButtonEmpty>
    )
  }
}

const mapStateToProps = (state) => ({
  clusterNodeSelected: state.configurationReducers.clusterNodeSelected
});

const mapDispatchToProps = (dispatch) => ({
  updateClusterNodes: (clusterNodes) =>  dispatch(updateClusterNodes(clusterNodes)),
  updateClusterNodeSelected: (clusterNodeSelected) => dispatch(updateClusterNodeSelected(clusterNodeSelected)),
  updateLoadingStatus: (loadingStatus) => dispatch(updateLoadingStatus(loadingStatus))
});

export default connect(mapStateToProps, mapDispatchToProps)(WzRefreshClusterInfoButton);