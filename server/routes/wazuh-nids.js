/*
 * Wazuh app - Module for Wazuh utils routes
 * Copyright (C) 2015-2020 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import { WazuhNidsCtrl } from '../controllers';

export async function WazuhNidsRoutes(server) {
  const ctrl = new WazuhNidsCtrl(server);

  // Get rulesets nodes
  await server.route({
    method: 'GET',
    path: '/nids/rulesets',
    handler(req, reply) {
      return ctrl.getRulesets(req, reply);
    }
  });

  // Get nids nodes
  await server.route({
    method: 'GET',
    path: '/nids/nodes',
    handler(req, reply) {
      return ctrl.getNodes(req, reply);
    }
  });

  // Get nids nodes
  await server.route({
    method: 'GET',
    path: '/nids/interfaces',
    handler(req, reply) {
      return ctrl.getInterfaces(req, reply);
    }
  });

  // Get nids tags
  await server.route({
    method: 'GET',
    path: '/nids/tags',
    handler(req, reply) {
      return ctrl.getTags(req, reply);
    }
  });

  // Get node orgs
  await server.route({
    method: 'GET',
    path: '/nids/orgs',
    handler(req, reply) {
      return ctrl.getOrgs(req, reply);
    }
  });

  // Delete specific node
  server.route({
    method: 'PUT',
    path: '/nids/node/delete',
    handler(req, reply) {
      return ctrl.deleteNode(req, reply);
    }
  });

  
  server.route({
    method: 'GET',
    path: '/nids/groups',
    handler(req, reply) {
      return ctrl.getGroups(req, reply);
    }
  });

  server.route({
    method: 'put',
    path: '/nids/SaveCurrentContent',
    handler(req, reply) {
      return ctrl.SaveCurrentContent(req, reply);
    }
  });

  server.route({
    method: 'put',
    path: '/nids/PingWazuh',
    handler(req, reply) {
      return ctrl.PingWazuh(req, reply);
    }
  });

  server.route({
    method: 'put',
    path: '/nids/ChangeMainServiceStatus',
    handler(req, reply) {
      return ctrl.ChangeMainServiceStatus(req, reply);
    }
  });

  server.route({
    method: 'put',
    path: '/nids/RunWazuh',
    handler(req, reply) {
      return ctrl.RunWazuh(req, reply);
    }
  });
  server.route({
    method: 'put',
    path: '/nids/getMainconfData',
    handler(req, reply) {
      return ctrl.getMainconfData(req, reply);
    }
  });

  server.route({
    method: 'put',
    path: '/nids/StopWazuh',
    handler(req, reply) {
      return ctrl.StopWazuh(req, reply);
    }
  });

  server.route({
    method: 'put',
    path: '/nids/addWazuhFile',
    handler(req, reply) {
      return ctrl.addWazuhFile(req, reply);
    }
  });
  
  server.route({
    method: 'DELETE',
    path: '/nids/deleteWazuhFile',
    handler(req, reply) {
      return ctrl.deleteWazuhFile(req, reply);
    }
  });

  server.route({
    method: 'PUT',
    path: '/nids/pingWazuhFiles',
    handler(req, reply) {
      return ctrl.PingWazuhFiles(req, reply);
    }
  });

  // Edit specific node
  server.route({
    method: 'PUT',
    path: '/nids/node/editNode',
    handler(req, reply) {
      return ctrl.editNode(req, reply);
    }
  });

  // Edit specific node
  server.route({
    method: 'PUT',
    path: '/nids/node/updateService',
    handler(req, reply) {
      return ctrl.updateService(req, reply);
    }
  });

  // Edit specific node
  server.route({
    method: 'PUT',
    path: '/nids/node/LaunchZeekMainConf',
    handler(req, reply) {
      return ctrl.LaunchZeekMainConf(req, reply);
    }
  });

  // Edit specific node
  server.route({
    method: 'PUT',
    path: '/nids/getFileContent',
    handler(req, reply) {
      return ctrl.getFileContent(req, reply);
    }
  });

  // Edit specific node
  server.route({
    method: 'PUT',
    path: '/nids/saveNidsFile',
    handler(req, reply) {
      return ctrl.saveNidsFile(req, reply);
    }
  });

  // Edit specific node
  server.route({
    method: 'PUT',
    path: '/nids/zeek/diag',
    handler(req, reply) {
      return ctrl.ZeekDiag(req, reply);
    }
  });

  // Edit specific node
  server.route({
    method: 'PUT',
    path: '/nids/node/changeServiceStatus',
    handler(req, reply) {
      return ctrl.changeServiceStatus(req, reply);
    }
  });

  // Edit specific node
  server.route({
    method: 'PUT',
    path: '/nids/zeek',
    handler(req, reply) {
      return ctrl.pingZeek(req, reply);
    }
  });

  // Edit specific node
  server.route({
    method: 'PUT',
    path: '/nids/node/PingPluginsNode',
    handler(req, reply) {
      return ctrl.getNodePlugins(req, reply);
    }
  });

  // Edit specific node
  server.route({
    method: 'POST',
    path: '/nids/node/addService',
    handler(req, reply) {
      return ctrl.addService(req, reply);
    }
  });

  // Add new node
  server.route({
    method: 'POST',
    path: '/nids/node/enroll',
    handler(req, reply) {
      return ctrl.enrollNode(req, reply);
    }
  });

  server.route({
    method: 'POST',
    path: '/nids/node/addStap',
    handler(req, reply) {
      return ctrl.addStap(req, reply);
    }
  });

  server.route({
    method: 'DELETE',
    path: '/nids/node/deleteService',
    handler(req, reply) {
      return ctrl.deleteService(req, reply);
    }
  });

  server.route({
    method: 'PUT',
    path: '/nids/node/syncRuleset',
    handler(req, reply) {
      return ctrl.syncRuleset(req, reply);
    }
  });

  server.route({
    method: 'PUT',
    path: '/nids/deployStapService',
    handler(req, reply) {
      return ctrl.deployStapService(req, reply);
    }
  });

  server.route({
    method: 'PUT',
    path: '/nids/stopStapService',
    handler(req, reply) {
      return ctrl.stopStapService(req, reply);
    }
  });

  server.route({
    method: 'PUT',
    path: '/nids/pingAnalyzer',
    handler(req, reply) {
      return ctrl.pingAnalyzer(req, reply);
    }
  });

  server.route({
    method: 'PUT',
    path: '/nids/ChangeAnalyzerStatus',
    handler(req, reply) {
      return ctrl.ChangeAnalyzerStatus(req, reply);
    }
  });

  server.route({
    method: 'PUT',
    path: '/nids/ReloadFilesData',
    handler(req, reply) {
      return ctrl.ReloadFilesData(req, reply);
    }
  });

  server.route({
    method: 'PUT',
    path: '/nids/wazuh/loadLines',
    handler(req, reply) {
      return ctrl.loadLines(req, reply);
    }
  });

}