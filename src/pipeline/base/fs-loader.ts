import { Pipeable } from "..";
import { CVBufferFile } from "../interface";
import fs from 'fs/promises';

class FSLoader extends Pipeable<never, CVBufferFile> {
    private folder: string;
    
    constructor({folder}: {folder: string}) {
        super();
        
        this.folder = folder;
    }
    
    public async run(prev?: undefined): Promise<any> {
        const files = await fs.readdir(this.folder);
        for(const file of files){
            const content = await fs.readFile(this.folder + "/" + file);
            
            await this.next?.run({
                filename: file,
                content
            });
        }
    }
}

export default FSLoader;