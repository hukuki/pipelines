import { CVBufferFile } from '../../interface';
import { Pipeable } from '../..';
const { convert } = require('html-to-text');

class HtmlToText extends Pipeable<CVBufferFile, CVBufferFile>{

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

            await this.next?.run({ 
                ...prev,
                content: Buffer.from(text)
            });
    }
}

export default HtmlToText;
