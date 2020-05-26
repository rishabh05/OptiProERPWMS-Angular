export class PickTaskModel {

    public OPTM_PICKLIST_CODE: string;
    public OPTM_TASKID: string;
    public OPTM_WHSE: string;
    public OPTM_BIN: string;
    public OPTM_ContBtchSer: string;
    public OPTM_PICKED_QTY: number;
    public CompanyDBId: string;
    public OPTM_CONTCODE: string;
    public OPTM_USER: string;
    public OPTM_TOTE_NUMBER: string;
    public OPTM_ISCONT: string;
    public OPTM_IS_CONT_CREATED: boolean;
    public OPTM_RESID_ACT: string;
    public OPTM_STARTDATETIME: string;

    constructor(OPTM_ShipId: string, OPTM_PickTaskId: string, OPTM_Whs: string, OPTM_Location: string, OPTM_ContBtchSer: string, OPTM_Qty: number, Container, OPTM_USER, OPTM_ISCONT, toteValue, OPTM_IS_CONT_CREATED, OPTM_STARTDATETIME
    ) {
        this.CompanyDBId = localStorage.getItem("CompID");
        this.OPTM_PICKLIST_CODE = OPTM_ShipId;
        this.OPTM_TASKID = OPTM_PickTaskId;
        this.OPTM_WHSE = OPTM_Whs;
        this.OPTM_BIN = OPTM_Location;
        this.OPTM_ContBtchSer = OPTM_ContBtchSer;
        this.OPTM_PICKED_QTY = OPTM_Qty;
        this.OPTM_CONTCODE = Container;
        this.OPTM_USER = OPTM_USER;
        this.OPTM_TOTE_NUMBER= toteValue;
        this.OPTM_ISCONT = OPTM_ISCONT;
        this.OPTM_IS_CONT_CREATED = OPTM_IS_CONT_CREATED;
        this.OPTM_RESID_ACT = localStorage.getItem("CompID");
        this.OPTM_STARTDATETIME = OPTM_STARTDATETIME;
    }
}