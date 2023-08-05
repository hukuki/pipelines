import { python } from 'pythonia'
import { Pipeable } from '../../../pipeline';
import { CVBufferFile } from '../../../pipeline/interface';
import { CVClause } from './interface';

abstract class Parser extends Pipeable<CVBufferFile, string[]>{
    
    protected static readonly SOFT_MAX_NUM_TOKENS = 350;

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

    protected splitClauses = async (pieces: string[]): Promise<CVClause[]> => {
        const tokens = (await Promise.all(pieces.map(this.tokenize)));
        
        let numTokens = tokens.map(t => t.length);

        pieces = pieces.map((piece, index) => {
            const n = numTokens[index];

            if(n <= Parser.SOFT_MAX_NUM_TOKENS) 
                return [piece];

            const numBuckets = Math.ceil(n / Parser.SOFT_MAX_NUM_TOKENS);
            const bucketSize = Math.ceil(n / numBuckets);

            const texts = this.splitString(piece, bucketSize);
            
            return texts;
        }).reduce((prev, curr)=>{
            return prev.concat(curr);
        }, []);

        numTokens = await Promise.all(pieces.map(this.tokenize).map(async t=> (await t).length));
        
        const totalNumTokens = numTokens.reduce((a, b) => a + b, 0);

        const numBuckets = Math.ceil(totalNumTokens / Parser.SOFT_MAX_NUM_TOKENS);
        const bucketSize = Math.ceil(totalNumTokens / numBuckets);
        
        const clauses: CVClause[] = [];
        
        // Starter empty clause
        let emptyClause = {
            text: "",
            numTokens: 0
        };
        
        // Copy empty clause
        let clause = {...emptyClause};

        for (let i = 0; i < pieces.length; i++) {
            const piece = pieces[i];
            const token = numTokens[i];

            if (token + clause.numTokens > bucketSize) {
                clauses.push(clause);
                
                clause = {...emptyClause};
            }

            clause.text += piece + "\n";
            clause.numTokens += token;
        }

        if(clause.text != "")
            clauses.push(clause);
        
        return clauses;
    }

    protected splitString(str: string, N: number) {
        const arr = [];
      
        for (let i = 0; i < str.length; i += N) {
          arr.push(str.substring(i, i + N));
        }
      
        return arr;
    }

    protected async splitSentences(text: string): Promise<string[]> {
        if(!Parser.nltk){
            Parser.nltk = await python('nltk');
        }

        const sentences = (await Parser.nltk.tokenize.sent_tokenize(text)).valueOf() as string[];

        return sentences;
    }

    protected clean(pieces: string[]): string[] {
        pieces = pieces.filter(piece => piece.length > 0);

        pieces = pieces.map(piece => (piece[0] == "-" || piece[0] == "–") ? piece.substring(1) : piece);
        pieces = pieces.map(piece => piece.replace("_", ""));
        pieces = pieces.map(piece => piece.trim());
        pieces = pieces.map(piece => piece.replace(/^\([0-9]+\)/g, ""));
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
        pieces = pieces.map(piece => piece.replace("(…)", ""));
        pieces = pieces.map(piece => piece.trim());
        pieces = pieces.filter(piece => piece.length > 10);

        return pieces;
    }
}

export default Parser;