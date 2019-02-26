import { HttpHeaders } from '@angular/common/http';


export interface ColumnSetting {
    field: string;
    title: string;
    format?: string;
    type: 'text' | 'numeric' | 'boolean' | 'date';
    width?: string;
  }

// Example of Data as model, can be used for non updating data (exaple - names, task type and etc)
export class CommonData {
    public project_name: string = "Optipro Configurator";
    public adminDBName: string = "OPTIPROADMIN";
    public href: any = window.location.href;
    public application_path = this.get_current_url();

    public get_current_url() {
        let temp: any = this.href.substring(0, this.href.lastIndexOf('/'));
        if (temp.lastIndexOf('#') != '-1') {
            temp = temp.substring(0, temp.lastIndexOf('#'));
        }
        let sanitized = temp.replace(/^http\:\/\//, '').replace(/\/+/g, '/').replace(/\/+$/, '');
        temp = (window.location.protocol + '//' + sanitized);
        
        return temp;
    }

    public toast_config = {
        closeButton: true,
        progressBar: false,
        timeOut: 5000,
        positionClass: 'toast-bottom-right',
        iconClasses: {
            error: 'alert alert-danger',
            info: 'alert alert-info ',
            success: 'alert alert-success ',
            warning: 'alert alert-warning'
        }
    };

    //defining properties for the call 
    public httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    }

    public lookup_selected_value = '';

    public stringtypevalue: any = [
        { "value": 1, "Name": "String" },
        { "value": 2, "Name": "Number" }
    ];

    public opertions: any = [
        { "value": 1, "Name": "No Operation" },
        { "value": 2, "Name": "Increase" },
        { "value": 3, "Name": "Decrease" }
    ];

    public bom_type: any = [
        { "value": 1, "Name": "Feature" },
        { "value": 2, "Name": "Item" },
        { "value": 3, "Name": "Value" }
    ];

    public less_bom_type: any = [
        { "value": 2, "Name": "Item" }
       /*  , { "value": 3, "Name": "Value" } */
    ];

    public model_bom_type: any = [
        { "value": 1, "Name": "Feature" },
        { "value": 2, "Name": "Item" },
        { "value": 3, "Name": "Model" }
    ];

    public rule_seq_type: any = [
        { "value": '', "Name": "" },
        { "value": 1, "Name": "Feature" },
        { "value": 2, "Name": "Model" }
    ];

    public operator_type: any = [
        { "value": '', "Name": "" },
        { "value": 'or', "Name": "OR" },
        { "value": 'and', "Name": "AND" }
    ];

    public yes_no_option: any = [
        { "value": '', "Name": "" },
        { "value": 'n', "Name": "No" },
        { "value": 'y', "Name": "Yes" }
    ];

    public bracket_list = [
        { "value": '' },
        { "value": "[" },
        { "value": "{", },
        { "value": "(" },
        { "value": "]" },
        { "value": "}", },
        { "value": ")" },
    ];

    public express_conditions = [
        { "value": "=" },
        { "value": "<" },
        { "value": ">" },
        { "value": "<=" },
        { "value": ">=" },
        { "value": "Between" }
        /* , { "value": "In" }, */
    ];

    public document_type = [
        //{ "value": '', "Name": "" },
        { "value": 'draft', "Name": "Draft", "selected":"1" },
        { "value": 'sales_quote', "Name": "Sales Quote", "selected":"0" },
        { "value": 'sales_order', "Name": "Sales Order", "selected":"0" }
    ];


    // for common view
    public default_limits = ["10", "25", "50", "100"];
    public default_count = "10";

    blobToFile = (theBlob: Blob, fileName: string): File => {
        var b: any = theBlob;
        b.lastModifiedDate = new Date();
        b.name = fileName;
        return <File>theBlob;
    }

    checkSession() {
        let login_page = this.application_path + '/index.html#login';
        if (sessionStorage.getItem('isLoggedIn') == null) {
            window.location.href = login_page;
        }
    }

   
}