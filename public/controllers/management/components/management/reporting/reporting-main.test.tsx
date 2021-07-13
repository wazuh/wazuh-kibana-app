/*
 * Wazuh app - React test for Reporting component.
 *
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 *
 */

import React from 'react';
import { mount } from 'enzyme';
import WzReporting from './reporting-main';

jest.mock('../../../../../kibana-services', () => ({
  getAngularModule: jest.fn(),
  getHttp: () => ({
    basePath: {
      prepend: (str) => str,
    },
  }),
}));

describe('Reporting component', () => {
  it('renders correctly to match the snapshot', () => {
    const wrapper = mount(<WzReporting />);
    expect(wrapper).toMatchSnapshot();
  });
});
