import { Pipeable } from "..";
import fs from 'fs';
import { InputType } from 'zlib';

abstract class Checkpointable<InputType, OutputType> extends Pipeable<InputType, OutputType> {
    private last: number;
    private filename: string;

    constructor(next?: Pipeable<OutputType, any>) {
        super(next);

        fs.mkdirSync(".pipeline", { recursive: true });

        this.filename = ".pipeline/" + this.constructor.name + ".checkpoint";

        if (!fs.existsSync(this.filename))
            fs.writeFileSync(this.filename, `1`);

        const content = fs.readFileSync(this.filename, { encoding: "utf-8" });
        const checkpoint = parseInt(content);

        this.last = checkpoint;
    }

    public checkpoint(): number {
        this.last++;
        fs.writeFileSync(this.filename, `${this.last}`);
        return this.last;
    }
}

export default Checkpointable;