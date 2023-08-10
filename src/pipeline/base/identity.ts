import { Pipeable } from '..';

class Identity<I> extends Pipeable<I,I> {
    public async run(prev: I): Promise<any> {
        await this.next?.run(prev);
    }
}

export default Identity;