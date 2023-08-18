import { Pipeable } from '../../..';
import fs from 'fs';
import CVLegislationTree from '../model/legislation-tree';

class FsJsonSaver extends Pipeable<CVLegislationTree, CVLegislationTree> {

    private folder: string;

    constructor({folder}: {folder: string}){
        super();

        this.folder = folder;
        fs.mkdirSync(folder, { recursive: true });
    }

    public async run(prev: CVLegislationTree): Promise<any> {
        // save the onject as json
        fs.writeFileSync(`${this.folder}/${prev.providerLegislationId}.json`, JSON.stringify(prev));
    }
}

export default FsJsonSaver;