/*
 * Wazuh app - Load the Agent controllers and React components.
 * Copyright (C) 2015-2020 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */


import { uiModules } from 'ui/modules';
import { NidsUtilsController } from './nids-utils';
import { LogCommandsController } from './log-commands';
import { NidsFiles } from './components/nids-files';
import { ServiceCommands } from './components/service-commands';

const app = uiModules.get('app/wazuh', []);

app
  .controller('NidsUtilsController', NidsUtilsController)
  .controller('LogCommandsController', LogCommandsController)
  .value('NidsFiles', NidsFiles)
  .value('ServiceCommands', ServiceCommands)
