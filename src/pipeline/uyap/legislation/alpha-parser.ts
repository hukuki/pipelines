import { Pipeable } from '../..';
import { CVBufferFile } from '../../interface';
import Parser from './parser';

class AlphaParser extends Parser{

    public async run(prev: CVBufferFile): Promise<any> {
        const text = prev.content.toString();
        
        let pieces = text.split(/\n+/);
        
        // Initial cleaning

        pieces = pieces.filter(piece => piece.length > 0);
        pieces = pieces.map(piece => (piece[0] == "-" || piece[0] == "–")  ? piece.substring(1) : piece);
        pieces = pieces.map(piece => piece.replace("_", ""));
        pieces = pieces.map(piece => piece.trim());
        pieces = pieces.filter(piece => piece.length > 10);

        if(pieces.length === 0) 
            this.error();
        
        const firstPiece = pieces[0];

        if(!(/^\([0-9]+\)/g.test(firstPiece)))
            this.error("Expected (1)");

        let index = 0;
        let clauses = [];
        
        for(let i = 1; i < pieces.length; i++){
            const piece = pieces[i];
            
            if(/^\([0-9]+\)/g.test(piece)){
                clauses.push(pieces.slice(index, i));
                index = i;
            }
        }

        if(index == 0 || index + 1 != pieces.length)
            clauses.push(pieces.slice(index, pieces.length));
        
        clauses = clauses.map(this.clean);

        if(clauses.length === 0) 
            this.error();

        clauses = clauses.map(clause => clause.join("\n"));
        clauses = await Promise.all(clauses.map(this.splitSentences));
        clauses = await Promise.all(clauses.map(this.splitClauses));
        
        console.log(JSON.stringify(clauses, null, 4));
        
        /*
        text = pieces.join("\n");
        const content =  Buffer.from(text);

        const path = prev.filename.split("/");
        const filename = path[path.length - 1];
        */

        await this.next?.run([

        ]);
    }

    private error(msg?: string){
        throw new Error("Text does not obey the specification : "+ msg);
    }
}

export default AlphaParser;