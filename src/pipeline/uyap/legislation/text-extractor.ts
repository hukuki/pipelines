import { CVBufferFile } from "../../interface";
import { Pipeable } from "../..";
const { convert } = require('html-to-text');

class TextExtractor extends Pipeable<CVBufferFile, CVBufferFile> {

        public async run(prev: CVBufferFile): Promise<any> {
            
            const html = prev.content.toString();            
            
            let text : string = convert(html, {
                preserveNewlines: false,
                trimEmptyLines: true,
                wordwrap: false,
                selectors: [
                    { 
                        selector: 'table', 
                        format: 'skip' 
                    },
                    {
                        selector: 'b',
                        format: 'skip',
                    },
                    {
                        selector: 'a',
                        format: 'skip'
                    },
                    {
                        selector: 'i',
                        format: 'skip'
                    },
                    {
                        selector: 'img',
                        format: 'skip'
                    }
                ]
            });

            /**
             *  Next lines might be shortened later.
             */

            let pieces = text.split(/\n+/);
            pieces = pieces.filter(piece => piece.length > 0);
            pieces = pieces.map(piece => (piece[0] == "-" || piece[0] == "–")  ? piece.substring(1) : piece);
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
            pieces = pieces.map(piece => piece.trim());
            
            pieces = pieces.filter(piece => piece.length > 10);

            if(pieces.length === 0) return;
            
            text = pieces.join("\n");
            const content = Buffer.from(text);

            const path = prev.filename.split("/");
            const filename = path[path.length - 1];

            await this.next?.run({
                filename,
                content
            });
        }
}

export default TextExtractor;