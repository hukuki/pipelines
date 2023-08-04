import { Pipeable } from "..";
import { CVBufferFile } from "../interface";
import fs from 'fs';

class FSSaver extends Pipeable<CVBufferFile, CVBufferFile> {
    
    private folder: string;

    constructor({folder}: {folder: string}){
        super();

        this.folder = folder;
        fs.mkdirSync(folder, { recursive: true });
    }

    public async run(prev: CVBufferFile): Promise<any> {
        fs.writeFileSync(`${this.folder}/${prev.filename}`, prev.content);

        await this.next?.run(prev);
    }
}

export default FSSaver;