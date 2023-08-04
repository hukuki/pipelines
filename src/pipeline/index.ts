abstract class Pipeable<InputType, ReturnType> {

    private _next?: Pipeable<ReturnType, any>;

    public abstract run(prev?: InputType): Promise<any>;

    constructor(next?: Pipeable<ReturnType, any>) {
        this._next = next;
    }

    public set next(next: Pipeable<ReturnType, any> | undefined) {
        this._next = next;
    }

    public get next(): Pipeable<ReturnType, any> | undefined {
        return this._next;
    }

    public get name(): string {
        return this.constructor.name;
    }
}
type AnyFunc = (...arg: any) => any;

type LastFnReturnType<F extends Array<AnyFunc>, Else = never> = F extends [
  ...any[],
  (...arg: any) => infer R
]
  ? R
  : Else;


type PipeArgs<F extends Pipeable<any,any>[], Acc extends Pipeable<any,any>[] = []> = F extends [
        Pipeable<infer A,infer B>
  ]
    ? [...Acc, Pipeable<A,B>]
    : F extends [Pipeable<infer A, any>, ...infer Tail]
    ? Tail extends [Pipeable<infer B, any>, ...any[]]
      ? PipeArgs<Tail, [...Acc, Pipeable<A,B>]>
      : Acc
    : Acc;

function pipeline<F extends Pipeable<any, any>[]>(...nodes:  PipeArgs<F> extends F ? F : PipeArgs<F>) {
        const chain: Pipeable<any, any>[] = [];

        for(let node of nodes){
            if(chain.length !== 0)
                chain[chain.length - 1].next = node;
            
            chain.push(node);

            // The last node of the pipeline should point to the next node of the pipeline.
            // This is to allow different pipelines themselves to be connected.
        }

        return chain[0];
}

export default pipeline;
export { Pipeable };