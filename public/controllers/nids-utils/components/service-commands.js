import React, { Component, Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
	EuiCard,
	EuiIcon,
	EuiPanel,
	EuiFlexItem,
	EuiFlexGroup,
	EuiSpacer,
	EuiText,
	EuiFlexGrid,
	EuiButtonEmpty,
	EuiTitle,
	EuiHealth,
	EuiHorizontalRule,
	EuiPage,
	EuiButton,
	EuiPopover,
	WzTextWithTooltipIfTruncated,
	EuiSelect,
	EuiLoadingChart,
	EuiBasicTable,
	WzButtonPermissions,
	EuiCodeEditor,
	EuiToolTip,
	EuiButtonIcon,
	EuiEmptyPrompt,
	EuiPageBody
} from '@elastic/eui';
import { useSelector, useDispatch } from 'react-redux';
import { AppNavigate } from '../../../react-services/app-navigate';
import { IsLoadingData, getFile, NidsSaveFile, LoadFileLastLines, SaveCurrentContent } from '../../../redux/actions/nidsActions';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../../components/common/hocs';
import { updateSelectedSettingsSection } from '../../../redux/actions/appStateActions';

export const ServiceCommands = withReduxProvider(() => {
	const dispatch = useDispatch();
	const file = useSelector(state => state.nidsReducers.file);
	const fileContent = useSelector(state => state.nidsReducers.fileContent);
	const nodeDetail = useSelector(state => state.nidsReducers.nodeDetail);

	const [newFileContent, setFileContent] = useState('');

  const title = headRender();
  
  // useEffect(() => {		
		// console.log(file);
	// }, []);

  function headRender() {
		return (
			<div>
				<EuiFlexGroup>

					<EuiFlexItem>
						<EuiFlexGroup>
							<EuiFlexItem>
								<EuiTitle size={'s'} style={{ padding: '6px 0px' }}>
									<h2>File:</h2>
								</EuiTitle>
							</EuiFlexItem>
						</EuiFlexGroup>
					</EuiFlexItem>

					<EuiFlexItem grow={false}>
						<EuiButtonEmpty iconType="sortLeft" onClick={ev => {
							AppNavigate.navigateToModule(ev, 'node', {})
						}}>
							Back
						</EuiButtonEmpty>
					</EuiFlexItem>

				</EuiFlexGroup>
				<EuiSpacer size="xs" />
			</div>
		);
	}

  return (
    <Fragment>
			
    <EuiPage>
      <EuiSpacer size="m" />
      <EuiPanel paddingSize="m">
        {title}
      </EuiPanel>				
    </EuiPage>

    <EuiSpacer size="m" />

    <EuiPage>
      <EuiPanel paddingSize="m">
        <p>sdñkfgbpsdñif</p>	
      </EuiPanel>
    </EuiPage>

  </Fragment>
  )
});
