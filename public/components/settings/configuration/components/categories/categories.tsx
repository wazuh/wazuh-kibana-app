/*
 * Wazuh app - React component building the configuration component.
 *
 * Copyright (C) 2015-2020 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import React, { Fragment } from 'react';
import { Category } from './components';
export const Categories = ({all}) => {
  return (
    <Fragment>
      {[1].map((item, idx) => <Category key={idx} />)}
    </Fragment>
  )

}