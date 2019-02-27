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
import { ColumnSetting } from 'src/app/models/CommonData';
import { OutboundData } from 'src/app/models/outbound/outbound-data';
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
  public table_head: ColumnSetting[] = [];
  dialogOpened: boolean = true;


  public close_kendo_dialog() {
    this.dialogOpened = false;
  }

  ngOnInit() {
    if (this.lookupfor == "toWhsList") {
      this.showToWhsList();
    }

    if (this.lookupfor == "out-customer") {
      this.showCustomerList();
    }

  }

  showToWhsList() {
    // this.popup_title = this.language.ModelBom;
    // this.LookupDataLoaded = false;
    // this.showLoader = true;
    // this.fill_input_id = 'featureNameId';
    // this.lookup_key = 'OPTM_FEATUREID';
    // this.table_head = [this.language.ModelId, this.language.code, this.language.Name];

    this.table_head = [
      {
        field: 'OPTM_FEATURECODE',
        title: 'this.language.code',
        type: 'text',
        width: '100'
      },
      {
        field: 'OPTM_DISPLAYNAME',
        title: 'this.language.Name',
        type: 'text',
        width: '100'
      },

    ];


    // this.table_head_hidden_elements = [true, false, false];
    // this.width_value = ((100 / this.table_head.length) + '%');

    // this.showLoader = false;
    // this.LookupDataLoaded = true;
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
        // $("#lookup_modal").modal('show');
      }
    }

  }


  showCustomerList() {


    this.table_head = [
      {
        field: 'CUSTOMER CODE',
        title: 'CUSTOMER CODE',
        type: 'text',
        width: '100'
      },
      {
        field: 'CUSTOMER NAME',
        title: 'CUSTOMER NAME',
        type: 'text',
        width: '100'
      }

    ];



    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
        // $("#lookup_modal").modal('show');
      }
    }

  }


  on_item_select(selectedValue: any) {
    if (this.lookupfor == "out-customer") {
      console.log("Selectde",selectedValue);
      let outbounddata = localStorage.getItem('outboundData')
      if(outbounddata==undefined){
        let outboundData:any=new OutboundData();
       // outboundData.CustomerData=selectedValue.SelectedItem[0];  
        localStorage.setItem("outboundData",outboundData);

      }



    }
    this.close_kendo_dialog();
  }
}
