
export class Item {
    DiServerToken:string;// "3439B306-4664-47E4-88D6-C298F5E2D744",
    CompanyDBId: string;//"QAS1129IR1",
    Transaction: string;// "ProductionIssue",
    RECUSERID: string;// "sarthak",
    ONLINEPOSTING: any;//null,
    BATCHNO:string;// "PO00000027",
    LineNo: number;// 0,
    ItemCode:any;// "C_bat",
    Tracking: any;// "B",
    DBIssuedQty: any;// 4,
    U_O_ACTISSQTY: any;// 1,
    U_O_ISSWH: any; // "01",
    U_O_PLNISSQTY:any;;// 5,
    U_O_BALQTY:any;// 1,
    DOCENTRY:any;// 27,
    RefLineNo: number;//0,
    RefDocEntry: string; //"24"
    LineId: number;// 1,
    LoginId:any;// "sarthak",
    FGWAREHOUSE:any;// "01",
    GUID:string;// "fa8d0205-110a-44b7-89a0-b2a243c89f33",
    UsernameForLic: string; //"sarthak"
    IssuedQty:string
}

export class Lot {

    Bin:string;// "01-SYSTEM-BIN-LOCATION",
    LineNo:number;//0,
    LotNumber: number;//"l",
    LotQty: string;//"1",
    LOTSIGMASTATUS :string;// "N",
    SYSNUMBER:number;// 4


    // Bin: string;
    // LotNumber: string;
    // LotQty: string;
    // SysSerial: number;
    // parentLine: number;
    // GUID: string;
    // UsernameForLic: string;
}

export class ProductionIssueModel {
    constructor() { }
    Items: Item[];
    Lots: Lot[];
    
}

export class RootObject {
    ProductionIssueModel: ProductionIssueModel;
}