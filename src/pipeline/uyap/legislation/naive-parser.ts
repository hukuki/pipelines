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
        let sentences = await this.splitSentences(article);
        let pieces = await this.splitPieces(sentences);
        let mergedPieces = await this.mergePieces(pieces);
        
        let piecesWithMetadata = mergedPieces.map(piece => ({
            content: piece,
            metadata: prev.metadata}
        ));

        for(const piece of piecesWithMetadata){
            const numWords = piece.content.split(/\s+/).length;

            if(piece.content.length < Parser.IGNORE_MIN_NUM_WORDS) continue;

            await this.next?.run(piece);
        }
    }
}

export default NaiveParser;