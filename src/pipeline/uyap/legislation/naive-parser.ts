import { Pipeable } from '../..';
import { CVBufferFile } from '../../interface';
import Parser from './parser';

class NaiveParser extends Parser{

    public async run(prev: CVBufferFile): Promise<any> {
        const text = prev.content.toString();
        
        let pieces = text.split(/\n+/);

        pieces = this.clean(pieces);

        if (pieces.length === 0) return;

        let article = pieces.join("\n");
        let sentences = await this.splitSentences(article);
        let clauses = await this.splitClauses(sentences);
                

        /*
        text = pieces.join("\n");
        const content =  Buffer.from(text);

        const path = prev.filename.split("/");
        const filename = path[path.length - 1];
        */

        await this.next?.run([
            
        ]);
    }
}

export default NaiveParser;