import { Pipeable } from '..';

class ConsoleLog<InputType> extends Pipeable<InputType, InputType> {

    public async run(prev: InputType): Promise<any> {
        console.log(prev);
        this.next?.run(prev);
    }
}

export default ConsoleLog;