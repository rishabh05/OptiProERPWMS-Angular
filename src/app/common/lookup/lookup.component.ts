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
  public logo_path = this.commonData.get_current_url() +
   "/assets/images/logo_configurator/icon/128_icon.png";
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
      // if (this.popup_lookupfor == "model_template") {
      //   this.model_template_lookup();
      //   return;
      // }
      // if (this.popup_lookupfor == "model_item_generation") {
      //   this.model_item_generation_lookup();
      //   return;
      // }

      // if (this.popup_lookupfor == "feature_lookup") {
      //   this.get_features_lookup();
      //   return;
      // }

      // if (this.popup_lookupfor == "feature_Detail_lookup") {
      //   this.get_features_lookup();
      //   return;
      // }

      // if (this.popup_lookupfor == "Item_Detail_lookup") {
      //   this.get_Item_lookup();
      //   return;
      // }

      // // open poup for import 
      // if (this.popup_lookupfor == "import_popup") {
      //   this.import_popup();
      //   return;
      // }

      // if (this.popup_lookupfor == "ModelBom_lookup" || this.popup_lookupfor == "ModelBom_Detail_lookup") {
      //   this.get_Model_lookup();
      //   return;
      // }

      // if (this.popup_lookupfor == "large_image_view") {
      //   this.showImage();
      //   return;
      // }
      // if (this.popup_lookupfor == "Price_lookup") {
      //   this.get_Price_lookup();
      //   return;
      // }
      // if (this.popup_lookupfor == "rule_section_lookup") {
      //   this.ruleSelection();
      //   return;
      // }
 
      // if (this.popup_lookupfor == "tree_view__model_bom_lookup") {
      //   this.showModelBOMTreeView();
      //   return;
      // }

      // if (this.popup_lookupfor == "associated_BOM") {
      //   this.showAssociatedBOMs();
      //   return;
      // }
      // if (this.popup_lookupfor == "feature_Detail_Output_lookup") {
      //   this.get_features_Output_lookup();
      //   return;
      // }

      // if (this.popup_lookupfor == "output_customer") {
      //   this.customer_lookup();
      //   return;
      // }

      // if (this.popup_lookupfor == "operand_feature_lookup") {
      //   this.get_operand_lookup();
      //   return;
      // }

      // if (this.popup_lookupfor == "operand_model_lookup") {
      //   this.get_Model_lookup();
      //   return;
      // }

      if (this.popup_lookupfor == "configure_list_lookup") {
        this.configure_list_lookup();
        return;
      }
      // if (this.popup_lookupfor == "ModelBomForWizard_lookup") {
      //   this.get_ModelWizard_lookup();
      //   return;
      // }

      // if (this.popup_lookupfor == "output_invoice_print") {
      //   this.output_invoice_print();
      //   return;
      // }
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

  
  
}
