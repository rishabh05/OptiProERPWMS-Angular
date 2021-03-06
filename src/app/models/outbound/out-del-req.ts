import { PackingModel } from './PackingModel';


export class SOHEADER {
    DiServerToken: string;
    SONumber: number;
    CompanyDBId: string;
    LineNo: number;
    ShipQty: string;
    tShipQty: string;
    DocNum: number;
    OpenQty: string;
    WhsCode: string;
    Tracking: string;
    ItemCode: string;
    UOM: number;
    UOMName: string;
    Line: number;
    UsernameForLic: string;
    NumAtCard: string ="";
    TrackingNumber: string ="";
    DOCENTRY:string;
    SelectedShipmentID:string;
}

export class SODETAIL {
    Bin: string;
    LotNumber: string;
    LotQty: string;
    SysSerial: number;
    parentLine: number;
    GUID: string;
    UsernameForLic: string;
    DOCENTRY:string;
    TRACKING: string;
}

export class DeliveryToken {
    constructor() { }
    SOHEADER: SOHEADER[];
    SODETAIL: SODETAIL[];
    PackingData:PackingModel[];
    UDF: any[];
}

export class RootObject {
    DeliveryToken: DeliveryToken;
}



