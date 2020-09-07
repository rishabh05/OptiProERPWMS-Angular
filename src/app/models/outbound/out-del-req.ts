import { PackingModel } from './PackingModel';

export class LoginParams {
    DiServerToken: string;
    CompanyDBId: string;
    WhsCode: string;
    UsernameForLic: string;
    GUID: string;
}

export class Shipments {
    ShipmentID: number;
}

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
    LoginParams: LoginParams[];
    Shipments: Shipments[];
}

export class RootObject {
    DeliveryToken: DeliveryToken;
}



