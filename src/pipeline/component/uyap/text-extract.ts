import { CVBufferFile } from "../../interface";
import { Pipeable } from "../../index";
const { convert } = require('html-to-text');

class ExtractText extends Pipeable {

        public async run(prev: CVBufferFile): Promise<any> {
            
            const html = prev.content.toString();            
            
            let text : string = convert(html, {
                preserveNewlines: false,
                trimEmptyLines: true,
                wordwrap: false,
                selectors: [
                    /*{ 
                        selector: 'table', 
                        format: 'skip' 
                    },
                    {
                        selector: 'b',
                        format: 'skip'
                    },
                    {
                        selector: 'a',
                        format: 'skip'
                    },
                    {
                        selector: 'i',
                        format: 'skip'
                    },*/
                ]
            });

            let pieces = text.split(/\n+/);
            pieces = pieces.filter(piece => piece.length > 0);
            pieces = pieces.map(piece => (piece[0] == "-" || piece[0] == "–")  ? piece.substring(1) : piece);
            pieces = pieces.map(piece => piece.trim());
            pieces = pieces.map(piece => piece.replace("_", ""));
            pieces = pieces.filter(piece => piece.length > 0);

            console.log(prev.filename, pieces);

            await this.next?.run(text);
        }
}

export default ExtractText;