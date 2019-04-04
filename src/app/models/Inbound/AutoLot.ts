export class AutoLot {
    AUTOLOT: string;
    ItemCode: string;
    LINEID: string;
    OPERATION: string;
    OPRTYPE: string;
    STRING: string;

    public constructor (AUTOLOT, ItemCode, LineId, OPERATION, OPRTYPE, STRING) {
        this.AUTOLOT = AUTOLOT;
        this.ItemCode = ItemCode;
        this.LINEID = LineId;
        this.OPERATION = OPERATION;
        this.OPRTYPE = OPRTYPE;
        this.STRING = STRING;
    }
}