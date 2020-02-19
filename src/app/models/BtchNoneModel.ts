export class BtchNoneModel {

    public OPTM_Location: string;
    public OPTM_ContBtchSer: string;
    public OPTM_Qty: number;

    constructor(OPTM_Location: string, OPTM_ContBtchSer: string, OPTM_Qty: number
    ) {
        this.OPTM_Location = OPTM_Location;
        this.OPTM_ContBtchSer = OPTM_ContBtchSer;
        this.OPTM_Qty = OPTM_Qty;
    }
}