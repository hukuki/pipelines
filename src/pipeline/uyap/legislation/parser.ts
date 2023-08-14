import { python } from 'pythonia'
import { Pipeable } from '../../../pipeline';
import { CVBufferFile } from '../../../pipeline/interface';
import { CVClause } from './interface';

export type ParserOutput  = {
    content: string,
    metadata?: object
};

abstract class Parser extends Pipeable<CVBufferFile, ParserOutput>{
    
    protected static readonly SOFT_MAX_NUM_TOKENS = 350;
    protected static readonly IGNORE_MIN_NUM_WORDS = 7;

    private static tokenizer: any;
    private static nltk: any;
    
    protected async tokenize(text: string): Promise<string[]> {
        if(!Parser.tokenizer){
            const { AutoTokenizer } = await python('transformers');
            Parser.tokenizer = await AutoTokenizer.from_pretrained("dbmdz/bert-base-turkish-cased");
        }

        const tokens = (await Parser.tokenizer.tokenize(text)).valueOf() as string[];

        return tokens;
    }

    protected async splitSentences(text: string): Promise<string[]> {
        if(!Parser.nltk){
            Parser.nltk = await python('nltk');
        }

        const language = "turkish"
        const sentences = (await Parser.nltk.tokenize.sent_tokenize(text, language)).valueOf() as string[];

        return sentences;
    }

    /**
     * A function to return a list of strings, each of which is a piece of the original string.
     * It aims to create chunks that are smaller than the soft limit, so that they are embeddable.
     * 
     * It checks if each piece is smaller than the soft limit. If it is not, it splits it into smaller pieces.
     * 
     * @param pieces An array of strings to be split.
     * @returns 
     */
    protected splitPieces = async (pieces: string[]): Promise<string[]> => {
        // A piece might be longer that our soft limit.
        // If so, we split it into smaller pieces.
        
        const splittedPieces = [];

        for(let i = 0; i < pieces.length; i++){
            const piece = pieces[i];
            const tokens = await this.tokenize(piece);
            const numTokens = tokens.length;
            
            if(numTokens <= Parser.SOFT_MAX_NUM_TOKENS) {
                splittedPieces.push(piece);
                continue;
            }

            const numBuckets = Math.ceil(numTokens / Parser.SOFT_MAX_NUM_TOKENS);
            const bucketSize = Math.ceil(numTokens / numBuckets);

            const texts = this.splitString(piece, bucketSize);
            
            splittedPieces.push(...texts);
        }

        return splittedPieces;
    }


    /**
     * It merges given pieces into chunks that are smaller than the soft limit.
     * 
     * @param pieces An array of strings to be merged.
     * @returns Merged pieces
     */
    protected mergePieces = async (pieces: string[]): Promise<string[]> => {
        const numTokensPerClause = await Promise.all(pieces.map(this.tokenize).map(async t=> (await t).length));
        
        const totalNumTokens = numTokensPerClause.reduce((a, b) => a + b, 0);

        const numBuckets = Math.ceil(totalNumTokens / Parser.SOFT_MAX_NUM_TOKENS);
        const bucketSize = Math.ceil(totalNumTokens / numBuckets);
        
        const clauses: string[] = [];
        
        // Starter empty clause
        let emptyClause = {
            text: "",
            numTokens: 0
        };
        
        // Copy empty clause
        let clause = {...emptyClause};

        for (let i = 0; i < pieces.length; i++) {
            const piece = pieces[i];
            const token = numTokensPerClause[i];

            if (token + clause.numTokens > bucketSize) {
                clauses.push(clause.text);
                
                clause = {...emptyClause};
            }

            clause.text += piece + "\n";
            clause.numTokens += token;
        }

        if(clause.text != "")
            clauses.push(clause.text);
        
        return clauses;
    }

    /**
     * Returns an array of equally sized strings, each of which is a chunk of the original string.
     * @param str String to split into equally sized chunks
     * @param N Number of chunks
     * @returns Array of chunks
     */
    protected splitString(str: string, N: number) {
        const arr = [];
      
        for (let i = 0; i < str.length; i += N) {
          arr.push(str.substring(i, i + N));
        }
      
        return arr;
    }

    /**
     * Cleans the given pieces of text. Turkish legislation contains a lot of noise, this function tries to remove it.
     * For example, things like (1), a), 1., etc. are removed. These are not useful for training a model.
     * 
     * However, note that this is only initial cleaning. In python pipeline for training, we do more cleaning.
     * 
     * @param pieces Pieces of text to clean
     * @returns Cleaned pieces of text
     */
    protected clean(pieces: string[]): string[] {
        pieces = pieces.filter(piece => piece.length > 0);

        pieces = pieces.map(piece => (piece[0] == "-" || piece[0] == "–") ? piece.substring(1) : piece);
        pieces = pieces.map(piece => piece.replace("_", ""));
        pieces = pieces.map(piece => piece.trim());
        pieces = pieces.map(piece => piece.replace(/^[a-züşöçğı]+\)/g, ""));
        pieces = pieces.map(piece => piece.trim());
        pieces = pieces.map(piece => piece.replace(/^[0-9]+\)/g, ""));
        pieces = pieces.map(piece => piece.trim());
        pieces = pieces.map(piece => piece.replace(/^[A-ZÜŞÖÇĞİ]+\)/g, ""));
        pieces = pieces.map(piece => piece.trim());
        pieces = pieces.map(piece => piece.replace(/^[0-9]+\.\s/g, ""));
        pieces = pieces.map(piece => piece.trim());
        pieces = pieces.map(piece => piece.replace("(…)", ""));
        pieces = pieces.map(piece => piece.trim());
        pieces = pieces.map(piece => piece.replace(/^\([0-9]+\)/g, ""));
        pieces = pieces.map(piece => piece.trim());

        return pieces;
    }
}

export default Parser;