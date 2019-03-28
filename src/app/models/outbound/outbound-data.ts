export class OutboundData {
    CustomerData: any;
    OrderData: any;
    SelectedItem: any;
    SelectedMeterials: any;
    TempSavedData: Array<any> = [];
    DeleiveryCollection: Array<any> = []
}

export class CurrentOutBoundData {
    public static CustomerData:CurrentCustomerData=null;
}
export class CurrentCustomerData {
    public static OrderData: CurrentOrderData=[];
}
export class CurrentOrderData {
    public static SelectedItem: CurrentSelectedItem=null;
}
export class CurrentSelectedItem { 
    public static SelectedMeterials: CurrentSelectedMeterials=[];
}

export class CurrentSelectedMeterials { }

