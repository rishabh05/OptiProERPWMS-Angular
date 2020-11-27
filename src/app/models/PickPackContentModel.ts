export class PickPackContentModel {
    public CompanyDBId: string; 
    public OPTM_TASKID: number;
    public OPTM_CURR_PICK_SEQ: number;
    public OPTM_WHSE: string;
    public OPTM_BIN: string;
    public PickContType: number;    // 1- Tote, 2 - Packing Container, 3 - Prebuilt Container
    public OPTM_CONTAINERCODE: string;
    public OPTM_TOTE_NUMBER: string;
    public OPTM_ITEMCODE: string;
    public OPTM_Tracking: string;    
    public OPTM_BTCHSER: string;
    public OPTM_QTY: string;
    public OPTM_SHIPMENTID: number;
    public OPTM_CREATEDBY: string;
    public OPTM_STARTDATETIME: string;    
    public Source_Obj: string;
    
    constructor(OPTM_PickTaskId: number, intCurrPickSeq: number, OPTM_Whs: string, OPTM_Location: string, pickContType: number, 
        Container: string, toteValue, OPTM_ITEMCODE: string, OPTM_Tracking: string, OPTM_ContBtchSer: string,
        OPTM_Qty: string, OPTM_SHIPMENTID, OPTM_STARTDATETIME, Source_Obj: string ) {

        this.CompanyDBId = sessionStorage.getItem("CompID");
        this.OPTM_TASKID = OPTM_PickTaskId;
        this.OPTM_CURR_PICK_SEQ = intCurrPickSeq;
        this.OPTM_WHSE = OPTM_Whs;
        this.OPTM_BIN = OPTM_Location;
        this.PickContType = pickContType;
        this.OPTM_CONTAINERCODE = Container;
        this.OPTM_TOTE_NUMBER= toteValue;
        this.OPTM_Tracking = OPTM_Tracking;
        this.OPTM_ITEMCODE = OPTM_ITEMCODE;
        this.OPTM_BTCHSER = OPTM_ContBtchSer;
        this.OPTM_QTY = OPTM_Qty;    
        this.OPTM_SHIPMENTID = OPTM_SHIPMENTID;    
        this.OPTM_CREATEDBY = sessionStorage.getItem("UserId");
        this.OPTM_STARTDATETIME = OPTM_STARTDATETIME;
        this.Source_Obj = Source_Obj;
    }
}