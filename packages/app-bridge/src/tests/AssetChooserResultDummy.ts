/* (c) Copyright Frontify Ltd., all rights reserved. */

import { AssetChooserResult } from '../types';

export class AssetChooserResultDummy {
    static with(id: number): AssetChooserResult {
        return {
            id,
            creator_name: 'Creator Name',
            ext: 'png',
            external_url: null,
            file_id: 'x1x1x1x1x1x1',
            file_name: 'fileName.png',
            generic_url: 'https://generic.url',
            height: 480,
            object_type: 'IMAGE',
            file_origin_url: 'https://origin.url',
            preview_url: 'https://preview.url',
            project: 23,
            project_name: null,
            project_type: null,
            filesize: 256,
            file_size_formatted: '123.45 MB',
            status: 'FINISHED',
            title: 'A title',
            width: 640,
            token: '--token--',
        };
    }
}
