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
                        format: 'skip',
                    },
                    {
                        selector: 'b',
                        format: 'skip',
                    },
                    {
                        selector: 'strong',
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
                    },
                    {
                        selector: 'h1',
                        options: {
                            uppercase: false,
                        },
                    },
                     {
                        selector: 'h2',
                        options: {
                            uppercase: false,
                        },
                    },
                     {
                        selector: 'h3',
                        options: {
                            uppercase: false,
                        },
                    },
                     {
                        selector: 'h4',
                        options: {
                            uppercase: false,
                        },
                    },
                     {
                        selector: 'h5',
                        options: {
                            uppercase: false,
                        },
                    },
                     {
                        selector: 'h6',
                        options: {
                            uppercase: false,
                        },
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
