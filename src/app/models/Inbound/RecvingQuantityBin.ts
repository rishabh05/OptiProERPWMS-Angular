export class RecvingQuantityBin{
    public Quantity: number;
    public Bin: string;

    constructor(qty:number, bin: string){
        this.Quantity = qty;
        this.Bin = bin;
    }
}