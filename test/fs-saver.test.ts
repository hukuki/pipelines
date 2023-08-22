import FSSaver, { FSSaverMode } from '../src/pipeline/base/fs-saver';
import {describe, it, expect} from '@jest/globals';

/*
describe ('FSSaver', () => {
    it ('should save file', async () => {
        const saver = new FSSaver({
            folder: '__testdir__',
            nameKey: 'filename',
            contentKey: 'content',
            as: FSSaverMode.TEXT
        });

        await saver.run({
            filename: 'test.txt',
            content: 'test'
        })

        expect(fs.readFileSync('__testdir__/test.txt', 'utf-8')).toBe('test');
    });
});
*/