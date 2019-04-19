

export class SOHEADER {
    DiServerToken: string;
    SONumber: number;
    CompanyDBId: string;
    LineNo: number;
    ShipQty: string;
    DocNum: number;
    OpenQty: string;
    WhsCode: string;
    Tracking: string;
    ItemCode: string;
    UOM: number;
    Line: number;
}

export class SODETAIL {
    Bin: string;
    LotNumber: string;
    LotQty: string;
    SysSerial: number;
    parentLine: number;
    GUID: string;
    UsernameForLic: string;
}

export class DeliveryToken {
    constructor() { }
    SOHEADER: SOHEADER[];
    SODETAIL: SODETAIL[];
    UDF: any[];
}

export class RootObject {
    DeliveryToken: DeliveryToken;
}



