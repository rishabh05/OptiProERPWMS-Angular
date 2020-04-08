export class PickTaskModel {

    public OPTM_PICKLIST_CODE: string;
    public OPTM_TASKID: string;
    public OPTM_Whs: string;
    public OPTM_Location: string;
    public OPTM_ContBtchSer: string;
    public OPTM_PICKED_QTY: number;
    public CompanyDBId: string;
    public Container: string;

    constructor(OPTM_ShipId: string, OPTM_PickTaskId: string, OPTM_Whs: string, OPTM_Location: string, OPTM_ContBtchSer: string, OPTM_Qty: number, Container
    ) {
        this.CompanyDBId = localStorage.getItem("CompID");
        this.OPTM_PICKLIST_CODE = OPTM_ShipId;
        this.OPTM_TASKID = OPTM_PickTaskId;
        this.OPTM_Whs = OPTM_Whs;
        this.OPTM_Location = OPTM_Location;
        this.OPTM_ContBtchSer = OPTM_ContBtchSer;
        this.OPTM_PICKED_QTY = OPTM_Qty;
        this.Container = Container;
    }
}