/* (c) Copyright Frontify Ltd., all rights reserved. */

import React from 'react';
import sinon from 'sinon';
import { afterEach, describe, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';

import { Template } from '../types/Template';
import { AppBridgeBlock } from '../AppBridgeBlock';
import { useTemplateChooser } from './useTemplateChooser';
import { withAppBridgeBlockStubs } from '../tests/withAppBridgeBlockStubs';

const OPEN_TEMPLATE_CHOOSER_BUTTON_ID = 'open-template-chooser';
const CLOSE_TEMPLATE_CHOOSER_BUTTON_ID = 'close-template-chooser';

const TemplateChooserDummy = ({
    appBridge,
    onTemplateChosen,
}: {
    appBridge: AppBridgeBlock;
    onTemplateChosen?: (selectedTemplate: Template) => void;
}) => {
    const { openTemplateChooser, closeTemplateChooser } = useTemplateChooser(appBridge);

    return (
        <>
            <button
                data-test-id={OPEN_TEMPLATE_CHOOSER_BUTTON_ID}
                onClick={() => openTemplateChooser(onTemplateChosen ?? (() => null))}
            />
            <button data-test-id={CLOSE_TEMPLATE_CHOOSER_BUTTON_ID} onClick={() => closeTemplateChooser()} />
        </>
    );
};

describe('useReadyForPrint hook', () => {
    afterEach(() => {
        cleanup();
    });

    it('should open the template chooser', () => {
        const [BlockWithStubs, appBridge] = withAppBridgeBlockStubs(TemplateChooserDummy);
        const { getByTestId } = render(<BlockWithStubs />);
        const openTemplateChooserButton = getByTestId(OPEN_TEMPLATE_CHOOSER_BUTTON_ID) as HTMLButtonElement;
        openTemplateChooserButton.click();
        sinon.assert.calledOnce(appBridge.openTemplateChooser);
    });

    it('should close the template chooser', () => {
        const [BlockWithStubs, appBridge] = withAppBridgeBlockStubs(TemplateChooserDummy);
        const { getByTestId } = render(<BlockWithStubs />);
        const openTemplateChooserButton = getByTestId(CLOSE_TEMPLATE_CHOOSER_BUTTON_ID) as HTMLButtonElement;
        openTemplateChooserButton.click();
        sinon.assert.calledOnce(appBridge.closeTemplateChooser);
    });
});
