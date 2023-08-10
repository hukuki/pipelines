import { Pipeable } from "..";
import { CVBufferFile } from "../interface";
import fs from 'fs/promises';
import _ from 'lodash';

class FSLoader<T extends object> extends Pipeable<T, CVBufferFile> {
    private folder: string | undefined;
    private nameKey: string | undefined;
    
    constructor({folder, nameKey}: {folder?: string, nameKey?: string}) {
        super();
        
        if(!folder && !nameKey) throw new Error("Either folder or nameKey must be provided.");

        this.folder = folder;
        this.nameKey = nameKey;
    }
    
    public async run(prev?: T): Promise<any> {
        if(this.nameKey){
            if(!prev) throw new Error("There is no input.");
            
            const filename = _.get(prev, this.nameKey);
            const folder = this.folder + "/" || "";; 

            const content = await fs.readFile(folder + filename);

            await this.next?.run({
                filename,
                content,
                metadata: prev
            });
        }
        else if(this.folder){
            const files = await fs.readdir(this.folder);
            for(const file of files){
                const content = await fs.readFile(this.folder + "/" + file);
                
                await this.next?.run({
                    filename: file,
                    content,
                    metadata: prev
                });
            }
        }
    }
}

export default FSLoader;