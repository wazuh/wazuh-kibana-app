/*
 * Wazuh app - React component for registering agents.
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
import {
  EuiCallOut,
} from '@elastic/eui';

import { connect } from 'react-redux';
import GroupsHandler from './utils/groups-handler';
import { getToasts }  from '../../../../../kibana-services';

import {
  updateLoadingStatus,
  updateFileContent,
  updateIsProcessing,
  updatePageIndexAgents,
  updateShowModal,
  updateListItemsForRemove,
  updateSortDirectionAgents,
  updateSortFieldAgents,
  updateReload
} from '../../../../../redux/actions/groupsActions';

import { getAgentFilterValues } from './get-agents-filters-values';
import { TableWzAPI } from '../../../../../components/common/tables';
import { WzButtonPermissions } from '../../../../../components/common/permissions/button';
import { WzButtonPermissionsModalConfirm } from '../../../../../components/common/buttons';

class WzGroupAgentsTable extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.suggestions = [
      { type: 'q', label: 'status', description: 'Filter by agent connection status', operators: ['=', '!=',], values: ['active', 'disconnected', 'never_connected', 'pending'] },
      { type: 'q', label: 'os.platform', description: 'Filter by OS platform', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('os.platform', value, {q: `group=${this.props.state.itemDetail.name}`})},
      { type: 'q', label: 'ip', description: 'Filter by agent IP', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('ip', value,  {q: `group=${this.props.state.itemDetail.name}`})},
      { type: 'q', label: 'name', description: 'Filter by agent name', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('name', value,  {q: `group=${this.props.state.itemDetail.name}`})},
      { type: 'q', label: 'id', description: 'Filter by agent id', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('id', value,  {q: `group=${this.props.state.itemDetail.name}`})},
      { type: 'q', label: 'node_name', description: 'Filter by node name', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('node_name', value,  {q: `group=${this.props.state.itemDetail.name}`})},
      { type: 'q', label: 'manager', description: 'Filter by manager', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('manager', value,  {q: `group=${this.props.state.itemDetail.name}`})},
      { type: 'q', label: 'version', description: 'Filter by agent version', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('version', value,  {q: `group=${this.props.state.itemDetail.name}`})},
      { type: 'q', label: 'configSum', description: 'Filter by agent config sum', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('configSum', value,  {q: `group=${this.props.state.itemDetail.name}`})},
      { type: 'q', label: 'mergedSum', description: 'Filter by agent merged sum', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('mergedSum', value,  {q: `group=${this.props.state.itemDetail.name}`})},
      //{ type: 'q', label: 'dateAdd', description: 'Filter by add date', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('dateAdd', value,  {q: `group=${this.props.state.itemDetail.name}`})},
      //{ type: 'q', label: 'lastKeepAlive', description: 'Filter by last keep alive', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('lastKeepAlive', value,  {q: `group=${this.props.state.itemDetail.name}`})},
    ]
    this.groupsHandler = GroupsHandler;

    this.columns = [
      {
        field: 'id',
        name: 'Id',
        align: 'left',
        sortable: true
      },
      {
        field: 'name',
        name: 'Name',
        align: 'left',
        sortable: true
      },
      {
        field: 'ip',
        name: 'Ip',
        align: 'left',
        sortable: true
      },
      {
        field: 'status',
        name: 'Status',
        align: 'left',
        sortable: true
      },
      {
        field: 'os.name',
        name: 'Os name',
        align: 'left',
        sortable: true
      },
      {
        field: 'os.version',
        name: 'Os version',
        align: 'left',
        sortable: true
      },
      {
        field: 'version',
        name: 'Version',
        align: 'left',
        sortable: true
      },
      {
        name: 'Actions',
        align: 'left',
        render: item => {
          return (
            <div>
              <WzButtonPermissions
                buttonType='icon'
                permissions={[[{action: 'agent:read', resource: `agent:id:${item.id}`}, ...(item.group || []).map(group => ({ action: 'agent:read', resource: `agent:group:${group}` }))]]}
                tooltip={{position: 'top', content: 'Go to the agent'}}
                aria-label="Go to the agent"
                iconType="eye"
                onClick={async () => {
                  this.props.groupsProps.showAgent(item);
                }}
                color="primary"
              />
              <WzButtonPermissionsModalConfirm
                buttonType='icon'
                permissions={[[{action: 'agent:modify_group', resource: `agent:id:${item.id}`}, ...(item.group || []).map(group => ({ action: 'agent:modify_group', resource: `agent:group:${group}` }))]]}
                tooltip={{position: 'top', content: 'Remove agent from this group'}}
                aria-label="Remove agent from this group"
                iconType="trash"
                onConfirm={async () => {
                  this.removeItems([item]);
                }}
                color="danger"
                isDisabled={item.name === 'default'}
                modalTitle={`Remove ${item.file || item.name} agent from this group?`}
                modalProps={{
                  buttonColor: 'danger'
                }}
              />
            </div>
          );
        }
      }
    ];
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const { error } = this.props.state;
    if (!error) {
      return (
          <TableWzAPI
            tableColumns={this.columns}
            tableInitialSortingField='id'
            searchBarSuggestions={this.suggestions}
            endpoint={`/groups/${this.props.state.itemDetail.name}/agents`}
            reload={this.props.state.reload}
            searchTable={true}
          />
      );
    } else {
      return <EuiCallOut color="warning" title={error} iconType="gear" />;
    }
  }

  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  async removeItems(items) {
    const { itemDetail } = this.props.state;

    this.props.updateLoadingStatus(true);
    const results = items.map(async (item, i) => {
      await this.groupsHandler.deleteAgent(item.id, itemDetail.name);
    });

    Promise.all(results).then(
      completed => {
        this.props.updateIsProcessing(true);
        this.props.updateLoadingStatus(false);
        this.props.updateReload();
        this.showToast('success', 'Success', 'Deleted successfully', 3000);
      },
      error => {
        this.props.updateIsProcessing(true);
        this.props.updateLoadingStatus(false);
        this.props.updateReload();
        this.showToast('danger', 'Error', error, 3000);
      }
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
    updateLoadingStatus: status => dispatch(updateLoadingStatus(status)),
    updateFileContent: content => dispatch(updateFileContent(content)),
    updateIsProcessing: isProcessing =>
      dispatch(updateIsProcessing(isProcessing)),
    updatePageIndexAgents: pageIndexAgents =>
      dispatch(updatePageIndexAgents(pageIndexAgents)),
    updateShowModal: showModal => dispatch(updateShowModal(showModal)),
    updateListItemsForRemove: itemList =>
      dispatch(updateListItemsForRemove(itemList)),
    updateSortDirectionAgents: sortDirectionAgents =>
      dispatch(updateSortDirectionAgents(sortDirectionAgents)),
    updateSortFieldAgents: sortFieldAgents =>
      dispatch(updateSortFieldAgents(sortFieldAgents)),
    updateReload: () => dispatch(updateReload())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WzGroupAgentsTable);
