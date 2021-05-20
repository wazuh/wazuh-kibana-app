/*
 * Wazuh app - Integrity monitoring components
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import { EuiCode, EuiIcon } from '@elastic/eui'
import React from 'react'

/* This function can be used to render possibly empty fields.
It takes a render function suitable for an EuiTable and returns another. */
export const emptyFieldHandler = (renderFn = (value,record) => value) => {
    return (value, record) => {
        if (value === "" || value === undefined) {
            return (
                <>
                    <EuiIcon type="iInCircle"/>
                    <EuiCode>
                        Empty field
                    </EuiCode>
                </>
            )
        } else {
            return renderFn(value,record);
        }
    }
}