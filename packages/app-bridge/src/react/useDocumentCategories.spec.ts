// @vitest-environment happy-dom

/* (c) Copyright Frontify Ltd., all rights reserved. */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

import { DocumentCategoryDummy, getAppBridgeThemeStub } from '../tests';

import { useDocumentCategories } from './useDocumentCategories';
import { DocumentCategory } from '../types';

const DOCUMENT_ID = 345345;
const ANOTHER_DOCUMENT_ID = 76685;
const DOCUMENT_CATEGORY_ID_1 = 147;
const DOCUMENT_CATEGORY_ID_2 = 258;
const DOCUMENT_CATEGORY_ID_3 = 369;
const DOCUMENT_CATEGORY_ID_4 = 3456;
const DOCUMENT_PAGE_ID = 234;

describe('useDocumentCategories', () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    it('should fetch document categories on mount', async () => {
        const appBridge = getAppBridgeThemeStub();
        const spy = vi.spyOn(appBridge, 'getDocumentCategoriesByDocumentId');

        const { result } = renderHook(() => useDocumentCategories(appBridge, DOCUMENT_ID));

        expect(result.current.isLoading).toBe(true);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(DOCUMENT_ID);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
            expect(result.current.documentCategories).toEqual([
                DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_1, DOCUMENT_ID, 2),
                DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_2, DOCUMENT_ID, 0),
                DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_3, DOCUMENT_ID, 2),
            ]);
        });
    });

    it('should not fetch document categories on mount if not enabled', () => {
        const appBridge = getAppBridgeThemeStub();
        const spy = vi.spyOn(appBridge, 'getDocumentCategoriesByDocumentId');

        const { result } = renderHook(() => useDocumentCategories(appBridge, DOCUMENT_ID, { enabled: false }));

        expect(result.current.isLoading).toBe(true);
        expect(spy).not.toHaveBeenCalled();
        expect(result.current.documentCategories).toEqual([]);
    });

    it('should fetch document categories if it gets enabled', async () => {
        const appBridge = getAppBridgeThemeStub();
        const spy = vi.spyOn(appBridge, 'getDocumentCategoriesByDocumentId');

        let enabled = false;

        const { result, rerender } = renderHook(() => useDocumentCategories(appBridge, DOCUMENT_ID, { enabled }));

        expect(result.current.isLoading).toBe(true);
        expect(spy).not.toHaveBeenCalled();
        expect(result.current.documentCategories).toEqual([]);

        enabled = true;

        rerender();

        expect(result.current.isLoading).toBe(true);
        expect(spy).toHaveBeenCalled();

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
            expect(result.current.documentCategories).toEqual([
                DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_1, DOCUMENT_ID, 2),
                DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_2, DOCUMENT_ID, 0),
                DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_3, DOCUMENT_ID, 2),
            ]);
        });
    });

    it('should update document categories if a category is added', async () => {
        const appBridge = getAppBridgeThemeStub();
        const spy = vi.spyOn(appBridge, 'getDocumentCategoriesByDocumentId');

        const DOCUMENT_CATEGORY = DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(
            DOCUMENT_CATEGORY_ID_4,
            DOCUMENT_ID,
            5,
        );

        const { result } = renderHook(() => useDocumentCategories(appBridge, DOCUMENT_ID));

        expect(result.current.isLoading).toBe(true);
        expect(spy).toHaveBeenCalledOnce();

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        // Mock the response of the second call
        spy.mockImplementationOnce(() =>
            Promise.resolve([
                DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_1, DOCUMENT_ID, 2),
                DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_2, DOCUMENT_ID, 0),
                DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_3, DOCUMENT_ID, 2),
                DOCUMENT_CATEGORY,
            ]),
        );

        // Trigger a "document category added" event in the specified document
        window.emitter.emit('AppBridge:GuidelineDocumentCategory:Action', {
            action: 'add',
            documentCategory: DOCUMENT_CATEGORY,
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
            expect(spy).toHaveBeenCalledTimes(2);
        });

        expect(result.current.documentCategories).toEqual([
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_1, DOCUMENT_ID, 2),
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_2, DOCUMENT_ID, 0),
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_3, DOCUMENT_ID, 2),
            DOCUMENT_CATEGORY,
        ]);
    });

    it('should not update document categories if a category is added to another document', async () => {
        const appBridge = getAppBridgeThemeStub();
        const spy = vi.spyOn(appBridge, 'getDocumentCategoriesByDocumentId');

        const DOCUMENT_CATEGORY = DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(
            DOCUMENT_CATEGORY_ID_4,
            ANOTHER_DOCUMENT_ID,
            5,
        );

        const { result } = renderHook(() => useDocumentCategories(appBridge, DOCUMENT_ID));

        expect(result.current.isLoading).toBe(true);
        expect(spy).toHaveBeenCalledOnce();

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        // Trigger a "document category added" event from another document
        window.emitter.emit('AppBridge:GuidelineDocumentCategory:Action', {
            action: 'add',
            documentCategory: DOCUMENT_CATEGORY,
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
            expect(spy).toHaveBeenCalledOnce();
        });

        expect(result.current.documentCategories).toEqual([
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_1, DOCUMENT_ID, 2),
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_2, DOCUMENT_ID, 0),
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_3, DOCUMENT_ID, 2),
        ]);
    });

    it('should update document categories if a category is removed', async () => {
        const appBridge = getAppBridgeThemeStub();
        const spy = vi.spyOn(appBridge, 'getDocumentCategoriesByDocumentId');

        const DOCUMENT_CATEGORY_TO_DELETE = DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(
            DOCUMENT_CATEGORY_ID_2,
            DOCUMENT_ID,
            5,
        );

        const { result } = renderHook(() => useDocumentCategories(appBridge, DOCUMENT_ID));

        expect(result.current.isLoading).toBe(true);
        expect(spy).toHaveBeenCalledOnce();

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        // Trigger a "document category delete" event in the specified document
        window.emitter.emit('AppBridge:GuidelineDocumentCategory:Action', {
            action: 'delete',
            documentCategory: {
                id: DOCUMENT_CATEGORY_TO_DELETE.id,
                documentId: DOCUMENT_CATEGORY_TO_DELETE.documentId,
            },
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
            expect(spy).toHaveBeenCalledOnce();
        });

        expect(result.current.documentCategories).toEqual([
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_1, DOCUMENT_ID, 2),
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_3, DOCUMENT_ID, 2),
        ]);
    });

    it('should not update document categories if a category is removed from another document', async () => {
        const appBridge = getAppBridgeThemeStub();
        const spy = vi.spyOn(appBridge, 'getDocumentCategoriesByDocumentId');

        const DOCUMENT_CATEGORY_TO_DELETE = DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(
            DOCUMENT_CATEGORY_ID_4,
            ANOTHER_DOCUMENT_ID,
            5,
        );

        const { result } = renderHook(() => useDocumentCategories(appBridge, DOCUMENT_ID));

        expect(result.current.isLoading).toBe(true);
        expect(spy).toHaveBeenCalledOnce();

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        // Trigger a "document category delete" event in the specified document
        window.emitter.emit('AppBridge:GuidelineDocumentCategory:Action', {
            action: 'delete',
            documentCategory: {
                id: DOCUMENT_CATEGORY_TO_DELETE.id,
                documentId: DOCUMENT_CATEGORY_TO_DELETE.documentId,
            },
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
            expect(spy).toHaveBeenCalledOnce();
        });

        expect(result.current.documentCategories).toEqual([
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_1, DOCUMENT_ID, 2),
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_2, DOCUMENT_ID, 0),
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_3, DOCUMENT_ID, 2),
        ]);
    });

    it('should update document categories if a category is updated', async () => {
        const appBridge = getAppBridgeThemeStub();
        const spy = vi.spyOn(appBridge, 'getDocumentCategoriesByDocumentId');

        const DOCUMENT_CATEGORY_TO_UPDATE: DocumentCategory = {
            ...DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_2, DOCUMENT_ID, 5),
            title: 'Updated title',
        };

        const { result } = renderHook(() => useDocumentCategories(appBridge, DOCUMENT_ID));

        expect(result.current.isLoading).toBe(true);
        expect(spy).toHaveBeenCalledOnce();

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        // Mock the response of the second call
        spy.mockImplementationOnce(() =>
            Promise.resolve([
                DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_1, DOCUMENT_ID, 2),
                DOCUMENT_CATEGORY_TO_UPDATE,
                DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_3, DOCUMENT_ID, 2),
            ]),
        );

        // Trigger a "document category update" event in the specified document
        window.emitter.emit('AppBridge:GuidelineDocumentCategory:Action', {
            action: 'update',
            documentCategory: DOCUMENT_CATEGORY_TO_UPDATE,
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
            expect(spy).toHaveBeenCalledTimes(2);
        });

        expect(result.current.documentCategories).toEqual([
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_1, DOCUMENT_ID, 2),
            DOCUMENT_CATEGORY_TO_UPDATE,
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_3, DOCUMENT_ID, 2),
        ]);
    });

    it('should not update document categories if a category is updated from another document', async () => {
        const appBridge = getAppBridgeThemeStub();
        const spy = vi.spyOn(appBridge, 'getDocumentCategoriesByDocumentId');

        const DOCUMENT_CATEGORY_TO_UPDATE: DocumentCategory = {
            ...DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(
                DOCUMENT_CATEGORY_ID_4,
                ANOTHER_DOCUMENT_ID,
                5,
            ),
            title: 'Updated title',
        };

        const { result } = renderHook(() => useDocumentCategories(appBridge, DOCUMENT_ID));

        expect(result.current.isLoading).toBe(true);
        expect(spy).toHaveBeenCalledOnce();

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        // Trigger a "document category update" event in the specified document
        window.emitter.emit('AppBridge:GuidelineDocumentCategory:Action', {
            action: 'update',
            documentCategory: DOCUMENT_CATEGORY_TO_UPDATE,
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
            expect(spy).toHaveBeenCalledOnce();
        });

        expect(result.current.documentCategories).toEqual([
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_1, DOCUMENT_ID, 2),
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_2, DOCUMENT_ID, 0),
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_3, DOCUMENT_ID, 2),
        ]);
    });

    it('should update document categories number if a document page is added to a category', async () => {
        const appBridge = getAppBridgeThemeStub();
        const spy = vi.spyOn(appBridge, 'getDocumentCategoriesByDocumentId');

        const { result } = renderHook(() => useDocumentCategories(appBridge, DOCUMENT_ID));

        expect(result.current.isLoading).toBe(true);
        expect(spy).toHaveBeenCalledOnce();

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.documentCategories).toEqual([
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_1, DOCUMENT_ID, 2),
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_2, DOCUMENT_ID, 0),
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_3, DOCUMENT_ID, 2),
        ]);

        // Trigger a "document page add" event in the specified document
        window.emitter.emit('AppBridge:GuidelineDocumentCategory:DocumentPageAction', {
            action: 'add',
            documentPage: { id: DOCUMENT_PAGE_ID, categoryId: DOCUMENT_CATEGORY_ID_2 },
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
            expect(spy).toHaveBeenCalledOnce();
        });

        expect(result.current.documentCategories).toEqual([
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_1, DOCUMENT_ID, 2),
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_2, DOCUMENT_ID, 1),
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_3, DOCUMENT_ID, 2),
        ]);
    });

    it('should not update document categories if a document page is added to another category', async () => {
        const appBridge = getAppBridgeThemeStub();
        const spy = vi.spyOn(appBridge, 'getDocumentCategoriesByDocumentId');

        const { result } = renderHook(() => useDocumentCategories(appBridge, DOCUMENT_ID));

        expect(result.current.isLoading).toBe(true);
        expect(spy).toHaveBeenCalledOnce();

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.documentCategories).toEqual([
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_1, DOCUMENT_ID, 2),
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_2, DOCUMENT_ID, 0),
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_3, DOCUMENT_ID, 2),
        ]);

        // Trigger a "document page add" event in the specified document
        window.emitter.emit('AppBridge:GuidelineDocumentCategory:DocumentPageAction', {
            action: 'add',
            documentPage: { id: DOCUMENT_PAGE_ID, categoryId: DOCUMENT_CATEGORY_ID_4 },
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
            expect(spy).toHaveBeenCalledOnce();
        });

        expect(result.current.documentCategories).toEqual([
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_1, DOCUMENT_ID, 2),
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_2, DOCUMENT_ID, 0),
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_3, DOCUMENT_ID, 2),
        ]);
    });

    it('should update document categories if a document page is removed from a category', async () => {
        const appBridge = getAppBridgeThemeStub();
        const spy = vi.spyOn(appBridge, 'getDocumentCategoriesByDocumentId');

        const { result } = renderHook(() => useDocumentCategories(appBridge, DOCUMENT_ID));

        expect(result.current.isLoading).toBe(true);
        expect(spy).toHaveBeenCalledOnce();

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.documentCategories).toEqual([
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_1, DOCUMENT_ID, 2),
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_2, DOCUMENT_ID, 0),
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_3, DOCUMENT_ID, 2),
        ]);

        // Trigger a "document page delete" event in the specified document
        window.emitter.emit('AppBridge:GuidelineDocumentCategory:DocumentPageAction', {
            action: 'delete',
            documentPage: { id: DOCUMENT_PAGE_ID, categoryId: DOCUMENT_CATEGORY_ID_3 },
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
            expect(spy).toHaveBeenCalledOnce();
        });

        expect(result.current.documentCategories).toEqual([
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_1, DOCUMENT_ID, 2),
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_2, DOCUMENT_ID, 0),
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_3, DOCUMENT_ID, 1),
        ]);
    });

    it('should not update document categories if a document page is removed from another category', async () => {
        const appBridge = getAppBridgeThemeStub();
        const spy = vi.spyOn(appBridge, 'getDocumentCategoriesByDocumentId');

        const { result } = renderHook(() => useDocumentCategories(appBridge, DOCUMENT_ID));

        expect(result.current.isLoading).toBe(true);
        expect(spy).toHaveBeenCalledOnce();

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.documentCategories).toEqual([
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_1, DOCUMENT_ID, 2),
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_2, DOCUMENT_ID, 0),
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_3, DOCUMENT_ID, 2),
        ]);

        // Trigger a "document page delete" event in the specified document
        window.emitter.emit('AppBridge:GuidelineDocumentCategory:DocumentPageAction', {
            action: 'delete',
            documentPage: { id: DOCUMENT_PAGE_ID, categoryId: DOCUMENT_CATEGORY_ID_4 },
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
            expect(spy).toHaveBeenCalledOnce();
        });

        expect(result.current.documentCategories).toEqual([
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_1, DOCUMENT_ID, 2),
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_2, DOCUMENT_ID, 0),
            DocumentCategoryDummy.withDocumentIdAndNumberOfDocumentPages(DOCUMENT_CATEGORY_ID_3, DOCUMENT_ID, 2),
        ]);
    });
});
