import { Pipeable } from '../..';
import { CVBufferFile } from '../../interface';
import Parser from './parser';

class NaiveParser extends Parser {

    public async run(prev: CVBufferFile): Promise<any> {
        const text = prev.content.toString();

        let paragraphs = text.split(/\n+/);
        paragraphs = this.clean(paragraphs);

        if (paragraphs.length === 0) return;

        let article = paragraphs.join("\n");
        let pieces = await this.splitRecursively(article);
        
        let piecesWithMetadata = pieces.map(piece => ({
            content: piece,
            metadata: prev.metadata}
        ));

        for(const piece of piecesWithMetadata){
            // split by multiple whitespaces
            const numWords = piece.content.split(/\s+/).length;

            if(numWords < Parser.IGNORE_MIN_NUM_WORDS) continue;


            await this.next?.run(piece);
        }
    }
}

export default NaiveParser;