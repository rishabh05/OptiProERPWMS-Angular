export class BtchNoneModel {

    public OPTM_Location: string;
    public OPTM_ContBtchSer: string;
    public OPTM_Qty: number;
    public Container: string

    constructor(OPTM_Location: string, OPTM_ContBtchSer: string, OPTM_Qty: number, Container
    ) {
        this.OPTM_Location = OPTM_Location;
        this.OPTM_ContBtchSer = OPTM_ContBtchSer;
        this.OPTM_Qty = OPTM_Qty;
        this.Container = Container;
    }
}