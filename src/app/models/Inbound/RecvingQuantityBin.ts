export class RecvingQuantityBin{
    
    public MfrSerial: string;
    public searlNo: string;
    public Quantity: number;
    public Bin: string;
    public expiryDate: string;
    // public Bin: string;

    constructor(MfrSerial: string, serial: string, qty:number, bin: string, expiryDate: string){
        this.MfrSerial = MfrSerial;
        this.searlNo = serial;
        this.Quantity = qty;
        this.Bin = bin;
        this.expiryDate = expiryDate;
    }
}