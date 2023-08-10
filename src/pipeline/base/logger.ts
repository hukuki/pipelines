import { Pipeable } from '..';

class Logger<T> extends Pipeable<T, T>{

    public async run(prev: T): Promise<any> {
        console.log(prev);
        await this.next?.run(prev);
    }
}

export default Logger;