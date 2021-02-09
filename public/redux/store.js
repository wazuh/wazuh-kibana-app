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

import { createStore, applyMiddleware  } from 'redux';
import thunk from 'redux-thunk';
import rootReducers from './reducers/rootReducers';

export default createStore(rootReducers, applyMiddleware(thunk));

