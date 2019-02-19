import { Component, OnInit, setTestabilityGetter, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
// import { CommonService } from '../../../services/common.service';
// import * as XLSX from 'ts-xlsx';
// import { FeaturemodelService } from '../../../services/featuremodel.service';
// import { ModelbomService } from '../../../services/modelbom.service';
// import { CommonData, ColumnSetting } from "../../../models/CommonData";
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import 'bootstrap';
// import { UIHelper } from '../../../helpers/ui.helpers';
// import { Http, ResponseContentType } from '@angular/http';

@Component({
  selector: 'app-lookup',
  templateUrl: './lookup.component.html',
  styleUrls: ['./lookup.component.scss']
})
export class LookupComponent implements OnInit {
  @ViewChild("lookupsearch") _el: ElementRef;
  // input and output emitters
  @Input() serviceData: any;
  @Input() lookupfor: any;
  @Input() fillLookupArray: any;
  @Input() selectedImage: any
  @Output() lookupvalue = new EventEmitter();
  @Input() ruleselected: any;
  @ViewChild('myInput')
  myInputVariable: ElementRef;
  private skip: number = 0;
  // @ViewChild(searchlookupfield, { read: ElementRef }) lookup_search: ElementRef;

  public commonData ;//= new CommonData();
  language = JSON.parse(sessionStorage.getItem('current_lang'));
  popup_title = this.language.title;
  constructor(private toastr: ToastrService, private router: Router) { }
  public table_head_hidden_elements = [];
  public defaultCurrency = sessionStorage.defaultCurrency;

  // mandatory variables
  public dataBind: any = [];
  public columns: any = [];
  public checked_rules = [];
  public showLoader: boolean = false;
  public showruleOutputLoader: boolean = false;
  public LookupDataLoaded: boolean = false;
  public RuleOutputLookupDataLoaded: boolean = false;
  public click_operation;
  public service_Data;
  // look up columns - thats needs to be shown 
  public fill_input_id = '';
  public item_code_columns;
  public model_template_item_columns;
  public table_head;//: ColumnSetting[] = [];
  public rule_output_table_head = [];
  public rule_output_table_head_hidden_elements = [];
  public lookup_key = "";
  public width_value = '100%';
  public selectedFile: any = "";
  public xls_dataset;
  public outputServiceData: any = [];
  companyName: string;
  // intital Javascript object class 
  Object = Object;
  public preview_image = "";
  public isRuleChecked = false;
  username: string;
  public fileType = "";
  public template_path = "";
  public print_item_list_array: any = [];
  //Print Data variables
  public report_type;
  public showCustDetailsSec: boolean = false;
  public showPaymentDetails: boolean = false;
  public showGeneralDetails: boolean = false;
  public showProdDetailsTable: boolean = false;
  public showProdGrandDetails: boolean = false;
  public customer_details: any = [];
  public refrence_doc_details: any = [];
  public verify_final_data_sel_details: any = [];
  public product_grand_details: any = [];
  public downLoadfileName = this.language.quatation + '.pdf';
  public template_type = "";
  isMobile: boolean = false;
  isIpad: boolean = false;
  isDesktop: boolean = true;
  isPerfectSCrollBar: boolean = false;
  public search_string = "";
  public logo_path = this.commonData.get_current_url() + "/assets/images/logo_configurator/icon/128_icon.png";
  public company_name: any = "N/A";
  public company_address: any = "N/A";
  public dialogOpened = false;
  public load_print_report: boolean = false;
  public popup_lookupfor = "";
  public close_kendo_dialog() {
    this.dialogOpened = false;
  }

  detectDevice() {
    let getDevice ;//= UIHelper.isDevice();
    this.isMobile = getDevice[0];
    this.isIpad = getDevice[1];
    this.isDesktop = getDevice[2];
    if (this.isMobile == true) {
      this.isPerfectSCrollBar = true;
    } else if (this.isIpad == true) {
      this.isPerfectSCrollBar = false;
    } else {
      this.isPerfectSCrollBar = false;
    }
  }

  ngOnInit() {
    this.detectDevice();
    this.username = sessionStorage.getItem('loggedInUser');
    this.companyName = sessionStorage.getItem('selectedComp');
    this.template_type = "model";
    this.skip = 0;
    this.template_path = this.commonData.application_path + "/assets/data/json/ModelMaster.xlsx";
    this.dialogOpened = false;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async ngOnChanges(): Promise<void> {
    this.popup_lookupfor = this.lookupfor;
    this.showLoader = true;
    this.LookupDataLoaded = false;
    this.showruleOutputLoader = true;
    this.RuleOutputLookupDataLoaded = false;
    this.lookup_key = '';
    this.item_code_columns = [];
    this.model_template_item_columns = [];
    this.fill_input_id = '';
    this.preview_image = '';
    this.dataBind = [];
    this.outputServiceData = [];
    this.skip = 0;
    this.dialogOpened = false;
    //this.test_model();
    console.log("this.lookupfor " + this.popup_lookupfor);
    this.search_string = "";
    if (this.popup_lookupfor == "output_invoice_print") {
    await this.sleep(400);
    }

    if (this.popup_lookupfor != "") {
      if (this.popup_lookupfor == "model_template") {
        this.model_template_lookup();
        return;
      }
      if (this.popup_lookupfor == "model_item_generation") {
        this.model_item_generation_lookup();
        return;
      }

      if (this.popup_lookupfor == "feature_lookup") {
        this.get_features_lookup();
        return;
      }

      if (this.popup_lookupfor == "feature_Detail_lookup") {
        this.get_features_lookup();
        return;
      }

      if (this.popup_lookupfor == "Item_Detail_lookup") {
        this.get_Item_lookup();
        return;
      }

      // open poup for import 
      if (this.popup_lookupfor == "import_popup") {
        this.import_popup();
        return;
      }

      if (this.popup_lookupfor == "ModelBom_lookup" || this.popup_lookupfor == "ModelBom_Detail_lookup") {
        this.get_Model_lookup();
        return;
      }

      if (this.popup_lookupfor == "large_image_view") {
        this.showImage();
        return;
      }
      if (this.popup_lookupfor == "Price_lookup") {
        this.get_Price_lookup();
        return;
      }
      if (this.popup_lookupfor == "rule_section_lookup") {
        this.ruleSelection();
        return;
      }
 
      if (this.popup_lookupfor == "tree_view__model_bom_lookup") {
        this.showModelBOMTreeView();
        return;
      }

      if (this.popup_lookupfor == "associated_BOM") {
        this.showAssociatedBOMs();
        return;
      }
      if (this.popup_lookupfor == "feature_Detail_Output_lookup") {
        this.get_features_Output_lookup();
        return;
      }

      if (this.popup_lookupfor == "output_customer") {
        this.customer_lookup();
        return;
      }

      if (this.popup_lookupfor == "operand_feature_lookup") {
        this.get_operand_lookup();
        return;
      }

      if (this.popup_lookupfor == "operand_model_lookup") {
        this.get_Model_lookup();
        return;
      }

      if (this.popup_lookupfor == "configure_list_lookup") {
        this.configure_list_lookup();
        return;
      }
      if (this.popup_lookupfor == "ModelBomForWizard_lookup") {
        this.get_ModelWizard_lookup();
        return;
      }

      if (this.popup_lookupfor == "output_invoice_print") {
        this.output_invoice_print();
        return;
      }
     // this.lookupfor = "";
    }
  }

  /*  ngAfterViewChecked() {
     
   } */

  log(val) {
    console.log(val);
  }

  on_template_type_change() {
    if (this.template_type === "model") {
      this.template_path = this.commonData.application_path + "/assets/data/json/ModelMaster.xlsx";
    }
    else if (this.template_type === "feature") {
      this.template_path = this.commonData.application_path + "/assets/data/json/FeatureMaster.xlsx";
    }
  }
  on_item_select(selection) {
    const lookup_key = selection.selectedRows[0].dataItem;
    console.log("lookup_key - " + lookup_key);
    console.log(lookup_key);


    this.lookupvalue.emit(Object.values(lookup_key));
    //   $("#lookup_modal").modal('hide');
    console.log(selection);
    selection.selectedRows = [];
    selection.index = 0;
    selection.selected = false;
    this.serviceData = [];
    this.skip = 0;
    this.dialogOpened = false;
  }

  configure_list_lookup() {
    this.popup_title = this.language.list_configuration;
    this.LookupDataLoaded = false;
    this.showLoader = true;
    this.fill_input_id = 'modify_duplicate_lookup';
    // this.table_head = [this.language.log_id, this.language.description, this.language.customer, this.language.contact_person, this.language.model, this.language.quantity];
    console.log(this.serviceData);

    this.table_head = [
      {
        field: 'OPTM_LOGID',
        title: this.language.log_id,
        type: 'text',
        width: '100'
      },
      {
        field: 'OPTM_DESC',
        title: this.language.description,
        type: 'text',
        width: '100'
      },
      {
        field: 'OPTM_BPCODE',
        title: this.language.customer,
        type: 'text',
        width: '100'
      },
      {
        field: 'OPTM_CONTACTPERSON',
        title: this.language.contact_person,
        type: 'text',
        width: '100'
      }
      /* ,
      {
        field: 'OPTM_FGITEM',
        title: this.language.model,
        type: 'text',
        width: '100'
      },
      {
        field: 'OPTM_QUANTITY',
        title: this.language.quantity,
        type: 'text',
        width: '100'
      }, */
    ];

    //this.table_head_hidden_elements = [false, false];
    this.lookup_key = 'OPTM_DESC';

    this.width_value = ((100 / this.table_head.length) + '%');


    this.showLoader = false;
    this.LookupDataLoaded = true;
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
        // $("#lookup_modal").modal('show');
      }
    }
  }

  model_template_lookup() {
    this.popup_title = this.language.model_template;
    this.LookupDataLoaded = false;
    this.showLoader = true;
    this.fill_input_id = 'featureItemName';
    this.table_head = [this.language.code, this.language.Name];

    this.table_head = [
      {
        field: 'Code',
        title: this.language.code,
        type: 'text',
        width: '100'
      },
      {
        field: 'Name',
        title: this.language.Name,
        type: 'text',
        width: '100'
      },

    ];


    this.table_head_hidden_elements = [false, false];
    this.lookup_key = 'Name';

    this.width_value = ((100 / this.table_head.length) + '%');


    this.showLoader = false;
    this.LookupDataLoaded = true;
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
        // $("#lookup_modal").modal('show');
      }
    }

  }

  model_item_generation_lookup() {
    this.popup_title = this.language.Model_Ref;
    this.LookupDataLoaded = false;
    this.showLoader = true;
    this.fill_input_id = 'featureItemCode';
    // this.table_head = [this.language.code];

    this.table_head = [
      {
        field: 'OPTM_CODE',
        title: this.language.code,
        type: 'text',
        width: '100'
      },

    ];

    this.table_head_hidden_elements = [false];
    this.lookup_key = 'OPTM_CODE';
    this.width_value = ((100 / this.table_head.length) + '%');

    this.showLoader = false;
    this.LookupDataLoaded = true;
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
        // $("#lookup_modal").modal('show');
      }
    }
  }

  get_operand_lookup() {


    this.popup_title = this.language.Bom_FeatureId;
    this.LookupDataLoaded = false;
    this.showLoader = true;
    this.fill_input_id = 'featureNameId';
    this.lookup_key = 'OPTM_FEATUREID';
    // this.table_head = [this.language.Id, this.language.code, this.language.Name];

    this.table_head = [
      {
        field: 'feature_code',
        title: this.language.code,
        type: 'text',
        width: '100'
      },
      {
        field: 'OPTM_DISPLAYNAME',
        title: this.language.Name,
        type: 'text',
        width: '100'
      },

    ];

    this.table_head_hidden_elements = [true, false, false];
    this.width_value = ((100 / this.table_head.length) + '%');

    this.showLoader = false;
    this.LookupDataLoaded = true;
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
        // $("#lookup_modal").modal('show');
      }
    }

  }

  get_features_lookup() {


    this.popup_title = this.language.Bom_FeatureId;
    this.LookupDataLoaded = false;
    this.showLoader = true;
    this.fill_input_id = 'featureNameId';
    this.lookup_key = 'OPTM_FEATUREID';
    // this.table_head = [this.language.Id, this.language.code, this.language.Name];

    this.table_head = [
      {
        field: 'OPTM_FEATURECODE',
        title: this.language.code,
        type: 'text',
        width: '100'
      },
      {
        field: 'OPTM_DISPLAYNAME',
        title: this.language.Name,
        type: 'text',
        width: '100'
      },

    ];

    this.table_head_hidden_elements = [true, false, false];
    this.width_value = ((100 / this.table_head.length) + '%');

    this.showLoader = false;
    this.LookupDataLoaded = true;
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
        // $("#lookup_modal").modal('show');
      }
    }

  }

  close_lookup(lookup_id) {
   this.log("lookup id - " + lookup_id);
    $("#" + lookup_id).modal('hide');

    //clear arrays after close button clicked on print model 
    if (this.popup_lookupfor == 'output_invoice_print') {
      this.cleanup_print_arrays();

      // popup_lookupfor  = "";
      setTimeout(() => {
        this.popup_lookupfor = "";
      });
    }

  }

  get_Model_lookup() {


    this.popup_title = this.language.ModelBom;
    this.LookupDataLoaded = false;
    this.showLoader = true;
    this.fill_input_id = 'featureNameId';
    this.lookup_key = 'OPTM_FEATUREID';
    // this.table_head = [this.language.ModelId, this.language.code, this.language.Name];

    this.table_head = [
      {
        field: 'OPTM_FEATURECODE',
        title: this.language.code,
        type: 'text',
        width: '100'
      },
      {
        field: 'OPTM_DISPLAYNAME',
        title: this.language.Name,
        type: 'text',
        width: '100'
      },

    ];


    this.table_head_hidden_elements = [true, false, false];
    this.width_value = ((100 / this.table_head.length) + '%');

    this.showLoader = false;
    this.LookupDataLoaded = true;
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
        // $("#lookup_modal").modal('show');
      }
    }

  }

  get_ModelWizard_lookup() {


    this.popup_title = this.language.ModelBom;
    this.LookupDataLoaded = false;
    this.showLoader = true;
    this.fill_input_id = 'featureNameId';
    this.lookup_key = 'OPTM_FEATUREID';
    // this.table_head = [this.language.ModelId, this.language.code, this.language.Name, this.language.templateid, this.language.ItemCodeGenkey];

    console.log(this.serviceData);
    this.table_head = [

      {
        field: 'OPTM_FEATURECODE',
        title: this.language.code,
        type: 'text',
        width: '100'
      },
      {
        field: 'OPTM_DISPLAYNAME',
        title: this.language.Name,
        type: 'text',
        width: '100'
      },

    ];

    this.table_head_hidden_elements = [true, false, false, true, true];
    this.width_value = ((100 / this.table_head.length) + '%');

    this.showLoader = false;
    this.LookupDataLoaded = true;
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
        // $("#lookup_modal").modal('show');
      }
    }

  }

  get_Item_lookup() {


    this.popup_title = this.language.ItemLookupTitle;
    this.LookupDataLoaded = false;
    this.showLoader = true;
    this.fill_input_id = 'type_value';
    this.lookup_key = 'ItemKey';
    // this.table_head = [this.language.itemkey, this.language.Name];

    this.table_head = [
      {
        field: 'ItemKey',
        title: this.language.itemkey,
        type: 'text',
        width: '100'
      },
      {
        field: 'Description',
        title: this.language.Name,
        type: 'text',
        width: '100'
      },
    ];

    this.table_head_hidden_elements = [false, false];
    this.width_value = ((100 / this.table_head.length) + '%');

    this.showLoader = false;
    this.LookupDataLoaded = true;
    this.log('this.serviceData');
    this.log(this.serviceData);
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
        // $("#lookup_modal").modal('show');
      }
    }

  }

  import_popup() {
    this.popup_title = this.language.import_features;
    this.showLoader = false;
    this.LookupDataLoaded = true;
    this.fileType = "excel";
    $("#import_modal").modal('show');

  }

  get_Price_lookup() {
    this.popup_title = this.language.price_source;
    this.LookupDataLoaded = false;
    this.showLoader = true;
    this.fill_input_id = 'price_source';
    this.lookup_key = 'PriceListID';
    // this.table_head = [this.language.price_source, this.language.price_list_name];

    console.log(this.serviceData);
    this.table_head = [
      {
        field: 'PriceListID',
        title: this.language.price_source,
        type: 'text',
        width: '100'
      },
      {
        field: 'ListName',
        title: this.language.price_list_name,
        type: 'text',
        width: '100'
      },

    ];
    this.table_head_hidden_elements = [false];
    this.width_value = ((100 / this.table_head.length) + '%');

    this.showLoader = false;
    this.LookupDataLoaded = true;
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
        // $("#lookup_modal").modal('show');
      }
    }
  }

  get_features_Output_lookup() {


    this.popup_title = this.language.Bom_FeatureId;
    this.LookupDataLoaded = false;
    this.showLoader = true;
    this.fill_input_id = 'featureNameId';
    this.lookup_key = 'OPTM_FEATUREID';
    // this.table_head = [this.language.Id, this.language.code, this.language.Name, this.language.Model_Accessory];

    this.table_head = [

      {
        field: 'OPTM_FEATURECODE',
        title: this.language.code,
        type: 'text',
        width: '100'
      },
      {
        field: 'OPTM_DISPLAYNAME',
        title: this.language.Name,
        type: 'text',
        width: '100'
      },

    ];
    this.table_head_hidden_elements = [true, false, false, true];
    this.width_value = ((100 / this.table_head.length) + '%');

    this.showLoader = false;
    this.LookupDataLoaded = true;
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
        // $("#lookup_modal").modal('show');
      }
    }

  }

  ruleSelection() {
    this.popup_title = this.language.rule_selection;
    this.LookupDataLoaded = false;
    this.showLoader = true;
    this.lookup_key = 'code';
    this.table_head = [this.language.select, this.language.rule, this.language.description];
    console.log(this.serviceData);
    // this.table_head = [
    //   {
    //     field: 'OPTM_LOGID',
    //     title: this.language.select,
    //     type: 'text',
    //     width: '100'
    //   },      
    //   {
    //     field: 'OPTM_LOGID',
    //     title: this.language.rule,
    //     type: 'text',
    //     width: '100'
    //   },
    //   {
    //     field: 'OPTM_DESC',
    //     title: this.language.description,
    //     type: 'text',
    //     width: '100'
    //   },

    // ];

    this.table_head_hidden_elements = [false, false, false];
    this.width_value = ((100 / this.table_head.length) + '%');

    this.showLoader = false;
    this.LookupDataLoaded = true;
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.checked_rules = [];
        //console.log(this.serviceData);
        for (var i = 0; i < this.serviceData.length; i++) {
          if (this.serviceData[i].Selected == "Y") {
            this.serviceData[i].Selected = true;
            this.checked_rules.push(this.serviceData[i]);
          }
          else {
            this.serviceData[i].Selected = false;
          }

        }

        $("#rule_selection").modal('show');
      }
    }
  }

  get_rule_output(rule_id, seq_id) {
    console.log("  rule_id " + rule_id);
    console.log("  seq_id " + seq_id);
    this.showruleOutputLoader = true;
    this.RuleOutputLookupDataLoaded = false;
    this.rule_output_table_head = ['#', this.language.feature, this.language.description];
    this.rule_output_table_head_hidden_elements = [false, false, false];
    $("#rule_output_table_lookup").modal('show');
    // $("#rule_selection").css("opacity", "0");
    $(".modal-backdrop:first").addClass("z-index_1050");
    // this.outputServiceData = [
    //   { "id": "2", "key": "123", "value": "test 1" },
    //   { "id": "2", "key": "431", "value": "test 2" },
    //   { "id": "4", "key": "555", "value": "test 3" },
    // ];

    let obj = this;
    // this.mbom.getRuleOutput(rule_id, seq_id).subscribe(
    //   data => {
    //     console.log(data);
    //     if (data !== '' && data !== undefined && data !== null) {
    //       obj.outputServiceData = data
    //       // this.close_lookup();
    //     } else {
    //       this.toastr.error('', this.language.incorrectfile, this.commonData.toast_config);
    //       // this.close_lookup();
    //     }

    //     //$(".modal-backdrop").hasClass("show").removeClass("show").addClass('hide');
    //   })

    this.showruleOutputLoader = false;
    this.RuleOutputLookupDataLoaded = true;

  }
  close_rule_model(id) {
    $("#rule_output_table_lookup").modal('hide');
    $(".modal-backdrop:first").removeClass("z-index_1050");
    // $("#rule_selection").css("opacity", "1");
  }


  on_checkbox_checked(checkedvalue, row_data) {
    console.log("checkedvalue " + checkedvalue);
    console.log(row_data);

    if (checkedvalue == true) {
      row_data.Selected = true;
      this.checked_rules.push(row_data);
    }
    else {
      let i = this.checked_rules.indexOf(row_data);
      row_data.Selected = false;
      this.checked_rules.splice(i, 1)
    }
    console.log(this.checked_rules);

  }

  rule_select_ok() {
    this.lookupvalue.emit(this.checked_rules);
    $("#rule_selection").modal('hide');
  }

  file_input($event) {
    var obj = this;
    var proceed = true;
    this.selectedFile = $event.target.files[0];
    let file_name_array = this.selectedFile.name.split(".");
    var index = file_name_array.length - 1;
    var file_extension = file_name_array[index];
    if (this.fileType == "excel" && (file_extension == "xlsx" || file_extension == "xls")) {
      proceed = true;
    }
    else if (this.fileType == "csv" && file_extension == "csv") {
      proceed = true;
    }
    else {
      this.toastr.error('', this.language.incorrectfile, this.commonData.toast_config);
      this.selectedFile = "";
      this.reset();
      return;
    }
    var reader = new FileReader();
    var XLS_DATA = '';
    reader.onload = function (loadEvent) {
      // @ts-ignore: Unreachable code error
      var data = loadEvent.target.result;
      var workbook ;//= XLSX.read(data, { type: 'binary' });
      workbook.SheetNames.forEach(function (sheetName) {
        // Here is your object
        // @ts-ignore: Unreachable code error
        XLS_DATA = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
        obj.xls_dataset = XLS_DATA;
      })

    }
    reader.readAsBinaryString($event.target.files[0]);
  }

  importclick() {
    console.log(this.selectedFile);
    if (this.selectedFile == "" || this.selectedFile == null) {
      this.toastr.error('', this.language.nofileattach, this.commonData.toast_config);
      return;
    }

    var xls_data = this.xls_dataset;
    var objData: any = {}
    objData.ExcelData = [];
    objData.Common = [];
    objData.ExcelData = xls_data;
    objData.Common.push({
      CompanyDBId: this.companyName,
      CreatedUser: this.username
    });
    console.log('objData');
    console.log(objData);
    // this.fms.importData(objData).subscribe(
    //   data => {
    //     console.log(data);
    //     if (data !== '' && data !== undefined && data !== null) {
    //       this.toastr.warning('', data, this.commonData.toast_config);
    //       // this.close_lookup();
    //     } else {
    //       this.toastr.error('', this.language.incorrectfile, this.commonData.toast_config);
    //       // this.close_lookup();
    //     }
    //     $("#import_modal").modal('hide');
    //     //$(".modal-backdrop").hasClass("show").removeClass("show").addClass('hide');
    //   })

  }

  showImage() {
    this.popup_title = this.language.feature_image;
    this.showLoader = true;
    this.LookupDataLoaded = false;
    this.preview_image = this.selectedImage;
    this.showLoader = false;
    this.LookupDataLoaded = true;
  }

  output_invoice_print() {
    this.company_name = "Optipro Product Configuration";
    this.company_address = "255 Street, Washington DC, USA ";
    this.popup_title = this.language.print_quote;
    this.load_print_report = true;
    console.log(" output_invoice_print - " + this.load_print_report);
    //   this.common_service.GetCompanyDetails(this.companyName).subscribe(
    //    data => {
    //      if (data != null || data != undefined) {
    //        if (data.length > 0) {
    //          if (data[0].LogoImage != ""){
    //            this.logo_path = "data:image/jpeg;base64," + data[0].LogoImage;
    //          }
    //          this.company_name = data[0].CompanyName;
    //          this.company_address = data[0].CompanyAddress;
             
    //        }
    //      }
    //    },
    //    error => {
    //      this.toastr.error('', this.language.FailedToReadCurrency, this.commonData.toast_config);
    //    }
    //  ) 

    //Print Criteria
    //Summary --> Customer + COM + Qty + Acces.
    //Details --> BOM + Feat. + Item + Acces.

    if (this.serviceData.print_types != undefined) {
      this.report_type = this.serviceData.print_types[0].selected_print_type;
      //1 for summary and 2 for detail
    }

    //customer details
    if (this.serviceData.customer_and_doc_details != undefined) {
      this.showCustDetailsSec = true;
      this.showGeneralDetails = true;
      this.customer_details.order_type = (this.serviceData.customer_and_doc_details.document == "sales_quote") ? this.language.SalesQuote : this.language.SalesOrder;
      this.customer_details.customer_name = this.serviceData.customer_and_doc_details.customer_name;
      this.customer_details.person_name = this.serviceData.customer_and_doc_details.person_name;
      this.customer_details.ship_to = this.serviceData.customer_and_doc_details.ship_to;
      this.customer_details.ship_to_address = this.serviceData.customer_and_doc_details.ship_to_address;
      this.customer_details.bill_to = this.serviceData.customer_and_doc_details.bill_to;
      this.customer_details.bill_to_address = this.serviceData.customer_and_doc_details.bill_to_address;
      this.customer_details.contact_person = this.serviceData.customer_and_doc_details.remark;
      this.customer_details.remark = this.serviceData.customer_and_doc_details.remark;

      this.customer_details.posting_date = this.serviceData.customer_and_doc_details.posting_date;
      this.customer_details.delivery_until = this.serviceData.customer_and_doc_details.delivery_until;

      if (this.serviceData.customer_and_doc_details.document == "sales_quote") {
        this.customer_details.doc_type_date_label = this.language.valid_date;
      } else {
        this.customer_details.doc_type_date_label = this.language.delivery_date;
      }

    }
    else {
      this.showCustDetailsSec = false;
      this.showGeneralDetails = false;
    }
    //payment details
    if (this.serviceData.payment_details != undefined) {
      this.showPaymentDetails = true;
    }
    else {
      this.showPaymentDetails = false;
    }
    //ref doc details
    if (this.serviceData.ref_doc_details != undefined && this.serviceData.ref_doc_details.length > 0) {
      this.refrence_doc_details.ref_doc_no = this.serviceData.ref_doc_details[0].ref_doc_no;
      this.refrence_doc_details.ref_doc_entry = this.serviceData.ref_doc_details[0].ref_doc_entry;
      this.refrence_doc_details.conf_id = this.serviceData.ref_doc_details[0].conf_id;
      this.refrence_doc_details.conf_desc = this.serviceData.ref_doc_details[0].conf_desc;
    }
    //item details
    if (this.serviceData.verify_final_data_sel_details != undefined && this.serviceData.verify_final_data_sel_details.length) {
      this.showProdDetailsTable = true;
      this.verify_final_data_sel_details = this.serviceData.verify_final_data_sel_details;
    }
    else {
      this.showProdDetailsTable = false;
    }

    let row_count = 0;
    if (this.serviceData.verify_final_data_sel_details != undefined && this.serviceData.verify_final_data_sel_details.length) {
      for (let mcount = 0; mcount < this.serviceData.verify_final_data_sel_details.length; mcount++) {
        var row = this.serviceData.verify_final_data_sel_details[mcount];
        row_count++;
        //pushing item data
        this.prepareFinalItemArray(row_count, row.item, row.desc, row.quantity, row.price, row.price_ext, row.feature_discount_percent, row.discounted_price, true);

        let detailed_discount;
        let discounted_detailed_price;
        //If report type is details then only we will show features
        for (let fcount = 0; fcount < row['feature'].length; fcount++) {
          let featureRow = row['feature'][fcount];
          row_count++;

          if (this.report_type == "2") {
            let itemFeatureName = featureRow.featureName;
            if (featureRow.featureName == "" || featureRow.featureName == null) {
              itemFeatureName = featureRow.Item;
            }

            if (featureRow.Item == "" || featureRow.Item == null) {
              itemFeatureName = featureRow.featureName;
            }

            detailed_discount = 0;
            discounted_detailed_price = featureRow.pricextn;
            if (featureRow.is_accessory == "Y") {
              detailed_discount = row.accessory_discount_percent
            }
            else {
              detailed_discount = row.feature_discount_percent
            }

            if (detailed_discount != 0) {
              discounted_detailed_price = (featureRow.pricextn - (featureRow.pricextn * (detailed_discount / 100)));
            }



            this.prepareFinalItemArray(row_count, itemFeatureName, featureRow.Description, Number(featureRow.quantity), Number(featureRow.Actualprice), Number(featureRow.pricextn), Number(detailed_discount), Number(discounted_detailed_price), false);
          }
          else {
            //As discussed with Meenesh & Pulkit
            //For Summary report will not show sub models,show Accessories in Summary
            if (featureRow.is_accessory == "Y" && featureRow.OPTM_ITEMTYPE != 1) {
              this.prepareFinalItemArray(row_count, featureRow.featureName, featureRow.Description, Number(featureRow.quantity), Number(featureRow.Actualprice), Number(featureRow.pricextn), Number(row.accessory_discount_percent), Number((featureRow.pricextn - (featureRow.pricextn * (row.accessory_discount_percent / 100)))), false);
            }
            else {
              row_count--;
            }
          }
        }

      }
    }

    //product grand details
    if (this.serviceData.product_grand_details != undefined && this.serviceData.product_grand_details.length > 0) {
      this.showProdGrandDetails = true;
      this.product_grand_details.step4_final_prod_total = parseFloat(this.serviceData.product_grand_details[0].step4_final_prod_total).toFixed(3);
      this.product_grand_details.step4_final_acc_total = parseFloat(this.serviceData.product_grand_details[0].step4_final_acc_total).toFixed(3);
      this.product_grand_details.step4_final_grand_total = parseFloat(this.serviceData.product_grand_details[0].step4_final_grand_total).toFixed(3);
      this.product_grand_details.prod_discount_log = parseFloat(this.serviceData.product_grand_details[0].prod_discount_log).toFixed(3);
      this.product_grand_details.access_dis_amount_log = parseFloat(this.serviceData.product_grand_details[0].access_dis_amount_log).toFixed(3);
    }
    else {
      this.showProdGrandDetails = false;
    }

    console.log(" invoice_modal show  - " + this.load_print_report);
    $("#invoice_modal").modal('show');
    //   this.lookupfor = "";
  }

  public tree_data_json: any = '';
  @Input() component;

  prepareFinalItemArray(index, itemCode, itemDesc, quantity, price, price_ext, feature_discount_percent, discounted_price, isFG) {
    // if (this.report_type == "2" && isFG == true) {
    //   price = "";
    //   quantity = "";
    //   price_ext = "";
    // }
    this.print_item_list_array.push({
      "sl_no": index,
      "item": itemCode,
      "item_desc": itemDesc,
      "quantity": parseFloat(quantity).toFixed(3),
      "price": parseFloat(price).toFixed(3),
      "price_ext": parseFloat(price_ext).toFixed(3),
      "feature_discount_percent": parseFloat(feature_discount_percent).toFixed(3),
      "discounted_price": parseFloat(discounted_price).toFixed(3),
      "isFG": isFG
    });
  }

  showAssociatedBOMs() {

    this.popup_title = this.language.associated_BOM;
    this.LookupDataLoaded = false;
    this.showLoader = true;

    console.log(this.serviceData);
    // this.table_head = [this.language.ModelId, this.language.Model_ModelName, this.language.Model_ModelDesc];
    this.table_head = [

      {
        field: 'OPTM_DISPLAYNAME',
        title: this.language.Model_ModelName,
        type: 'text',
        width: '100'
      },
      {
        field: 'OPTM_FEATUREDESC',
        title: this.language.Model_ModelDesc,
        type: 'text',
        width: '100'
      },
    ];
    this.table_head_hidden_elements = [true, false, false];
    this.width_value = ((100 / this.table_head.length) + '%');

    this.showLoader = false;
    this.LookupDataLoaded = true;
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        $("#simple_table_modal").modal('show');
      }
    }

  }

  showModelBOMTreeView() {
    this.popup_title = this.language.explode;
    this.showLoader = true;
    this.LookupDataLoaded = false;
    //this.tree_data_json = this.dummy_json();
    this.showLoader = false;
    this.LookupDataLoaded = true;
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        // this.tree_data_json =  this.dummy_json();
        this.tree_data_json = this.serviceData;

        // setTimeout(function(){
        $("#tree_view").modal('show');
        //}, 5000);
      }
    }

  }

  customer_lookup() {
    this.popup_title = this.language.model_template;
    this.LookupDataLoaded = false;
    this.showLoader = true;
    this.fill_input_id = 'featureItemName';
    // this.table_head = [this.language.customer_code, this.language.Name];
    console.log(this.serviceData);
    this.table_head = [
      {
        field: 'CustID',
        title: this.language.customer_code,
        type: 'text',
        width: '100'
      },
      {
        field: 'Name',
        title: this.language.Name,
        type: 'text',
        width: '100'
      },

    ];
    this.table_head_hidden_elements = [false, false];
    this.lookup_key = 'Name';

    this.width_value = ((100 / this.table_head.length) + '%');


    this.showLoader = false;
    this.LookupDataLoaded = true;
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
        // $("#lookup_modal").modal('show');
      }
    }

  }

  reset() {
    this.myInputVariable.nativeElement.value = "";
  }

  filtered_feature_list(verify_final_data_sel_details) {
    console.log(verify_final_data_sel_details);
    verify_final_data_sel_details = verify_final_data_sel_details.filter(function (obj) {

      obj['OPTM_LEVEL'] = 0;
      return verify_final_data_sel_details.feature;
    })
  }

  cleanup_print_arrays() {
    this.product_grand_details.length = 0;
    this.print_item_list_array.length = 0;
  }


  // gridUserSelectionChange(gridUser, selection) {sdgvxfvx
  //   // let selectedData = gridUser.data.data[selection.index];
  //   const selectedData = selection.selectedRows[0].dataItem;
  //   console.log(selectedData);
  //   alert(selectedData.Name);
  // }


  /*downloadFile() {
    return this.http
      .get('https://jslim.net/path/to/file/download', {
        responseType: ResponseContentType.Blob
      })
      .map(res => {
        return {
          filename: 'filename.pdf',
          data: res.blob()
        };
      })
      .subscribe(res => {
          console.log('start download:',res);
          var url = window.URL.createObjectURL(res.data);
          var a = document.createElement('a');
          document.body.appendChild(a);
          a.setAttribute('style', 'display: none');
          a.href = url;
          a.download = res.filename;
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove(); // remove the element
        }, error => {
          console.log('download error:', JSON.stringify(error));
        }, () => {
          console.log('Completed file download.')
        });
  }*/

  // dummy_json(){
  //   return [
  //     { "sequence" : "1",    "component"  :  "F1",        "level"  : "0",    "parent": ""   },
  //     { "sequence" : "2",    "component"  :  "F2",        "level"  : "1",    "parent": "F1" },
  //     { "sequence" : "3",    "component"  :  "F3",        "level"  : "1",    "parent": "F1" },
  //     { "sequence" : "4",    "component"  :  "Item0001",  "level"  : "2",    "parent": "F2" },
  //     { "sequence" : "5",    "component"  :  "Item0002",  "level"  : "2",    "parent": "F2" },
  //     { "sequence" : "6",    "component"  :  "F4",        "level"  : "2",    "parent": "F3" },
  //     { "sequence" : "7",    "component"  :  "F5",        "level"  : "2",    "parent": "F3" },
  //     { "sequence" : "7",    "component"  :  "F6",        "level"  : "3",    "parent": "F4" },
  //     { "sequence" : "8",    "component"  :  "Item0003",  "level"  : "3",    "parent": "F5" },
  //     { "sequence" : "9",    "component"  :  "Item0004",  "level"  : "3",    "parent": "F5" },
  //     { "sequence" : "10",   "component"  :  "Item0005",  "level"  : "4",    "parent": "F6" },
  //     { "sequence" : "11",   "component"  :  "Item0006",  "level"  : "4",    "parent": "F6" },
  //     { "sequence" : "13",   "component"  :  "Item0002",  "level"  : "1",    "parent": "F1" },
  //     { "sequence" : "14",   "component"  :  "Item0011",  "level"  : "0",    "parent": ""   }
  //   ];
  // }

  dummy_json() {
    return [
      { "sequence": 1, "parentId": "", "component": "29", "level": "0" },
      { "sequence": 2, "parentId": "29", "component": "19", "level": "1" },
      { "sequence": 3, "parentId": "29", "component": "8", "level": "1" },
      { "sequence": 4, "parentId": "29", "component": "Wind Sensor", "level": "1" },
      { "sequence": 5, "parentId": "29", "component": "WMT70BIRDKIT", "level": "1" },
      { "sequence": 6, "parentId": "19", "component": "21", "level": "2" },
      { "sequence": 7, "parentId": "19", "component": "20", "level": "2" },
      { "sequence": 8, "parentId": "8", "component": "Item02", "level": "2" },
      { "sequence": 9, "parentId": "8", "component": "VALUE", "level": "2" },
      { "sequence": 10, "parentId": "19", "component": "Wind Sensor", "level": "2" },
      { "sequence": 11, "parentId": "20", "component": "22", "level": "3" },
      { "sequence": 12, "parentId": "20", "component": "21", "level": "3" },
      { "sequence": 13, "parentId": "22", "component": "26", "level": "4" },
      { "sequence": 14, "parentId": "22", "component": "23", "level": "4" },

      //    {"sequence":15,"parentId":"23","component":"19","level":"5"},
      { "sequence": 16, "parentId": "19", "component": "21", "level": "6" },
      { "sequence": 17, "parentId": "19", "component": "20", "level": "6" },
      { "sequence": 18, "parentId": "19", "component": "Wind Sensor", "level": "6" },

    ]
  }
}
