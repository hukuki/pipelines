import { Pipeable } from "..";
import { CVBufferFile } from "../interface";
import fs from 'fs';
import _ from 'lodash';

export enum FSSaverMode {
    JSON,
    TEXT,
    BINARY,
}

class FSSaver extends Pipeable<object, object> {
    
    private folder: string;
    private nameKey: string;
    private contentKey: string;
    private as: FSSaverMode;

    constructor({ folder, nameKey, contentKey, as = FSSaverMode.BINARY}: { nameKey: string, contentKey?: string, folder: string, as: FSSaverMode }){
        super();

        this.nameKey = nameKey;
        this.contentKey = contentKey;
        this.folder = folder;
        this.as = as;

        fs.mkdirSync(folder, { recursive: true });
    }

    public async run(prev: any): Promise<any> {
        const rawContent = _.get(prev, this.contentKey, prev);
        const content = this.as === FSSaverMode.JSON ? JSON.stringify(rawContent) : rawContent;

        const filename = _.get(prev, this.nameKey);

        fs.writeFileSync(`${this.folder}/${filename}`, content);

        await this.next?.run(prev);
    }
}

export default FSSaver;