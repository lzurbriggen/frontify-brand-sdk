/* (c) Copyright Frontify Ltd., all rights reserved. */

import React, { ComponentType } from 'react';
import { AppBridgeBlock } from '../AppBridgeBlock';
import { getAppBridgeBlockStub, getAppBridgeBlockStubProps } from './AppBridgeBlockStub';

type withAppBridgeStubsProps = { appBridge: AppBridgeBlock };

export function withAppBridgeBlockStubs<T>(
    WrappedComponent: ComponentType<T>,
    appBridgeProps?: getAppBridgeBlockStubProps,
): [ComponentType<Omit<T, keyof withAppBridgeStubsProps>>, ReturnType<typeof getAppBridgeBlockStub>] {
    const appBridge = getAppBridgeBlockStub(appBridgeProps ?? {});
    const ComponentWithAppBridgeStubs = (props: Omit<T, keyof withAppBridgeStubsProps>) => {
        return <WrappedComponent appBridge={appBridge} {...(props as T)} />;
    };

    const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
    ComponentWithAppBridgeStubs.displayName = `withAppBridgeBlockStubs(${displayName})`;

    return [ComponentWithAppBridgeStubs, appBridge];
}
