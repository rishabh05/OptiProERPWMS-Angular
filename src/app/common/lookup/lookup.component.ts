import { Component, OnInit, setTestabilityGetter, Input, Output, EventEmitter, ElementRef, ViewChild, HostListener } from '@angular/core';
// import { CommonService } from '../../../services/common.service';
// import * as XLSX from 'ts-xlsx';
// import { FeaturemodelService } from '../../../services/featuremodel.service';
// import { ModelbomService } from '../../../services/modelbom.service';
// import { CommonData, ColumnSetting } from "../../../models/CommonData";
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import 'bootstrap';
import { ColumnSetting } from '../../models/CommonData';
import { OutboundData } from '../../models/outbound/outbound-data';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { GridComponent } from '@progress/kendo-angular-grid';
import { UIHelper } from '../../helpers/ui.helpers';
import { State } from '@progress/kendo-data-query';
import { CommonConstants } from 'src/app/const/common-constants';
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
  @Output() lookupkey = new EventEmitter();
  @Input() ruleselected: any;
  @ViewChild('myInput')
  myInputVariable: ElementRef;
  public table_head: ColumnSetting[] = [];
  dialogOpened: boolean = true;
  lookupTitle: string;
  pagable: boolean = false;
  pagesize: number;
  isMobile: boolean;
  isColumnFilter: boolean = false;
  isColumnGroup: boolean = false;
  gridHeight: number;
  showLoader: boolean = false;
  grid: any;
  showSelection: boolean = false;
  selectedValues: Array<any> = [];
  public mySelection: number[] = [];



  constructor(private toastr: ToastrService, private translate: TranslateService, private router: Router) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  close_kendo_dialog() {
    if (this.lookupfor == "PhyCntItemList") {
      this.router.navigate(['home/dashboard']);
    } else {
      this.dialogOpened = false;
    }
  }
  public state: State = {
    skip: 0,
    take: 5,

    // Initial filter descriptor
    filter: {
      logic: 'and',
      filters: []
    }
  };
  public clearFilters() {
    this.state.filter = {
      logic: 'and',
      filters: []
    };
  }
  onFilterChange(checkBox: any, grid: GridComponent) {
    if (checkBox.checked == false) {
      this.clearFilter(grid);
    }
  }
  clearFilter(grid: GridComponent) {
    this.clearFilters()
  }
  ngOnInit() {
  }

  async ngOnChanges(): Promise<void> {

    if (this.lookupfor == "toWhsList") {
      this.showToWhsList();
    } else if (this.lookupfor == "ItemsList") {
      this.showItemCodeList();
    } else if (this.lookupfor == "BatchNoList") {
      this.showBatchNoList();
    } else if (this.lookupfor == "NTrackFromBin") {
      this.showNTrackFromBinList();
    } else if (this.lookupfor == "SBTrackFromBin") {
      this.showSBTrackFromBinList();
    } else if (this.lookupfor == "toBinsList") {
      this.showSBTrackFromBinList();
    }
    else if (this.lookupfor == "RecvBinList") {
      this.showRecvBinList();
    }
    else if (this.lookupfor == "VendorList") {
      this.showVendorList();
    }
    else if (this.lookupfor == "POList") {
      this.showPOList();
    }
    else if (this.lookupfor == "POItemList") {
      this.showPOItemList();
    }
    else if (this.lookupfor == "out-customer") {
      this.showCustomerList();
    }
    else if (this.lookupfor == "out-items") {
      this.showAvaliableItems();
    }

    else if (this.lookupfor == 'out-order') {
      this.showOutSOList();
    }
    else if (this.lookupfor == "LotsList") {
      this.showLotsList();
    }
    else if (this.lookupfor == "FromBinList") {
      this.showBinList();
    }
    else if (this.lookupfor == "ToBinList") {
      this.showBinList();
    }
    else if (this.lookupfor == "OrderList") {
      this.orderList();
    } else if (this.lookupfor == "PhyCntItemList") {
      this.ShowPhyCntItemList();
    } else if (this.lookupfor == "showPhyCntItemsList") {
      this.ShowPhyCntInnerItemList();
    } else if (this.lookupfor == "ShowBatachSerList") {
      this.ShowBatachSerList();
    } else if(this.lookupfor = "PIOrderList"){
      this.orderList();
    }

    this.clearFilters();
    this.isColumnFilter = false
  }

  showToWhsList() {
    this.table_head = [
      {
        field: 'WHSCODE',
        title: this.translate.instant("WhseCode"),
        type: 'text',
        width: '100'
      },
      {
        field: 'WHSName',
        title: this.translate.instant("WhseName"),
        type: 'text',
        width: '100'
      },
    ];
    this.lookupTitle = this.translate.instant("WarehouseList");
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
      }
    }
  }

  showAvaliableItems() {
    this.pagesize = 5;
    if(this.serviceData.length>this.pagesize){
      this.pagable = true;
    }else{
      this.pagable = false;
    }
    
    
    this.showSelection = true;
    this.selectedValues = [];
    this.table_head = [

      {
        field: 'LOTNO',
        title: this.translate.instant("BatchSerial_No"),
        type: 'text',
        width: '100'
      },

      {
        field: 'BINNO',
        title: this.translate.instant("BinNo"),
        type: 'text',
        width: '100'
      },
      {
        field: 'TOTALQTY',
        headerClass: 'text-right',
        class: 'text-right',
        title: this.translate.instant("AvailableQty"),
        type: 'numeric',
        width: '100'
      }
    ];
    this.lookupTitle = this.translate.instant("AvaliableMeterial");
    if (this.serviceData !== undefined) {
      var len = this.serviceData.length;
      if (len > 0) {
        //  console.log('ServiceData', this.serviceData);
        var tempData: any;
        for(var i=0;i<len;i++){
          var qty = Number(this.serviceData[i].TOTALQTY).toFixed(Number(localStorage.getItem("DecimalPrecision")));
          this.serviceData[i].TOTALQTY = qty;
        }
        this.dialogOpened = true;
      }
    }
  }

  showBatchNoList() {
    this.table_head = [
      {
        field: 'LOTNO',
        title: this.translate.instant("BatchSerial_No"),
        type: 'text',
        width: '100'
      },
      {
        field: 'ITEMCODE',
        title: this.translate.instant("ItemCode"),
        type: 'text',
        width: '100'
      },
      {
        field: 'TOTALQTY',
        headerClass: 'text-right',
        class: 'text-right',
        title: this.translate.instant("TOTALQTY"),
        type: 'text',
        width: '100'
      },
      {
        field: 'BINNO',
        title: this.translate.instant("BinNo"),
        type: 'text',
        width: '100'
      },
      {
        field: 'ITEMNAME',
        title: this.translate.instant("ItemName"),
        type: 'text',
        width: '100'
      }
    ];
    this.lookupTitle = this.translate.instant("Palletmessage.Lot");
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
      }
    }
  }

  showNTrackFromBinList() {
    this.table_head = [
      {
        field: 'BINNO',
        title: this.translate.instant("BinNo"),
        type: 'text',
        width: '100',
        headerClass: '',
        class: '',
      },
      {
        field: 'TOTALQTY',
        headerClass: 'text-right',
        class: 'text-right',
        title: this.translate.instant("TOTALQTY"),
        type: 'text',
        width: '100',
      },
      {
        field: 'WHSCODE',
        title: this.translate.instant("WhseCode"),
        type: 'text',
        width: '100',
        headerClass: '',
        class: '',
      }
    ];
    this.lookupTitle = this.translate.instant("LookupTitle_BinNoList");
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
      }
    }
  }

  showSBTrackFromBinList() {
    this.table_head = [
      {
        field: 'BINNO',
        title: this.translate.instant("BinNo"),
        type: 'text',
        width: '100'
      },
      {
        field: 'WHSCODE',
        title: this.translate.instant("WhseCode"),
        type: 'text',
        width: '100'
      }
    ];
    this.lookupTitle = this.translate.instant("LookupTitle_BinNoList");
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
      }
    }
  }

  showToBinsList() {
    this.table_head = [
      {
        field: 'BINNO',
        title: this.translate.instant("BinNo"),
        type: 'text',
        width: '100'
      },
      {
        field: 'WHSCODE',
        title: this.translate.instant("WhseCode"),
        type: 'text',
        width: '100'
      }
    ];
    this.lookupTitle = this.translate.instant("LookupTitle_BinNoList");
  }

  showRecvBinList() {
    this.table_head = [
      {
        field: 'BINNO',
        title: this.translate.instant("BinNo"),
        type: 'text',
        width: '100'
      }
    ];
    this.lookupTitle = this.translate.instant("LookupTitle_BinNoList");
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
      }
    }
  }

  showCustomerList() {

    this.table_head = [
      {
        title: this.translate.instant("CustomerCode"),
        field: 'CUSTOMER CODE',
        type: 'text',
        width: '100'
      },

      {
        title: this.translate.instant("Outbound_CustomerName"),
        field: 'CUSTOMER NAME',
        type: 'text',
        width: '100'
      }

    ];

    this.lookupTitle = this.translate.instant("CustomerList");
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
      }
    }
  }

  showVendorList() {
    this.table_head = [
      {
        field: 'CARDCODE',
        title: this.translate.instant("VendorCode"),
        type: 'text',
        width: '100'
      },
      {
        field: 'CARDNAME',
        title: this.translate.instant("Inbound_VendorName"),
        type: 'text',
        width: '100'
      }
    ];
    this.lookupTitle = this.translate.instant("VendorList");
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
      }
    }
  }

  showPOItemList() {
    this.table_head = [
      {
        field: 'ItemCode',
        title: this.translate.instant("ItemCode"),
        type: 'text',
        width: '100'
      },
      {
        field: 'ItemName',
        title: this.translate.instant("ItemName"),
        type: 'text',
        width: '100'
      },
    ];
    this.lookupTitle = this.translate.instant("ItemsList");
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
      }
    }
  }

  showPOList() {
    this.table_head = [
      {
        field: 'DocNum',
        title: this.translate.instant("Inbound_PO#"),
        type: 'numeric',
        width: '100'
      },
      {
        field: 'DocDueDate',
        title: this.translate.instant("DelDate"),
        type: 'date',
        width: '100'
       }//,
      // {
      //   field: 'CardCode',
      //   title: this.translate.instant("VendorCode"),
      //   type: 'text',
      //   width: '100'
      // },
      // {
      //   field: 'CardName',
      //   title: this.translate.instant("VendorName"),
      //   type: 'text',
      //   width: '100'
      // }
    ];
    this.lookupTitle = this.translate.instant("Inbound_POList");
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
      }
    }
  }

  ShowPhyCntItemList() {
    this.table_head = [
      {
        field: 'DocNum',
        title: this.translate.instant("DocNum"),
        headerClass: 'text-right',
        class: 'text-right',
        type: 'numeric',
        width: '50'
      },
      {
        field: 'ItemCode',
        title: this.translate.instant("ItemCode"),
        type: 'text',
        width: '100'
      },
      {
        field: 'Bin',
        title: this.translate.instant("BinNo"),
        type: 'text',
        width: '180'
      },
      {
        field: 'InWhsQty',
        title: this.translate.instant("OnHandQty"),
        headerClass: 'text-right',
        class: 'text-right',
        type: 'numeric',
        width: '70'
      },
      {
        field: 'CountDate',
        title: this.translate.instant("CountDate"),
        type: 'text',
        width: '70'
      },
      {
        field: 'IsTeamCount',
        title: this.translate.instant("TeamCount"),
        type: 'text',
        width: '70'
      }
    ];
    this.lookupTitle = this.translate.instant("ItemsList");
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
      }
    }
  }

  ShowBatachSerList() {
    this.table_head = [
      {
        field: 'LOTNO',
        title: this.translate.instant("BatchSerial_No"),
        type: 'text'
      },
      {
        field: 'ITEMCODE',
        title: this.translate.instant("ItemCode"),
        type: 'text'
      },
      {
        field: 'TOTALQTY',
        title: this.translate.instant("TOTALQTY"),
        headerClass: 'text-right',
        class: 'text-right',
        type: 'numeric',
      },
      {
        field: 'BINNO',
        title: this.translate.instant("BinNo"),
        type: 'text'
      }
    ];
    this.lookupTitle = this.translate.instant("Palletmessage.Lot");
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
      }
    }
  }

  ShowPhyCntInnerItemList() {
    this.table_head = [
      {
        field: 'ItemCode',
        title: this.translate.instant("ItemCode"),
        type: 'text'
      },
      {
        field: 'BinCode',
        title: this.translate.instant("BinNo"),
        type: 'text'
      }
    ];
    this.lookupTitle = this.translate.instant("ItemsList");
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
      }
    }
  }

  showOutSOList() {
    this.table_head = [
      {
        field: 'DOCNUM',
        title: 'SO#',
        type: 'numeric',
        width: '100'
      },
      {
        field: 'DOCDUEDATE',
        title: 'Del. Date',
        type: 'date',
        width: '100'
      }
    ];

    this.lookupTitle = this.translate.instant("SalesOrderList");
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
      }
    }
  }

  on_item_select(selection) {
    if (!this.showSelection) {
      const lookup_key = selection.selectedRows[0].dataItem;
      //console.log("lookup_key - " + lookup_key);
      // console.log(lookup_key);
      this.lookupkey.emit(lookup_key);
      this.lookupvalue.emit(Object.values(lookup_key));
      //  console.log(selection);
      selection.selectedRows = [];
      selection.index = 0;
      selection.selected = false;
      this.serviceData = [];
      this.dialogOpened = false;
    }
  }

  showLotsList() {
    var titleValue = this.translate.instant("BatchNo");
    if (this.serviceData !== undefined && this.serviceData.length > 0) {
        if("S" == this.serviceData[0].TRACKING){
          titleValue = this.translate.instant("SerialNo");
        } else if("N" == this.serviceData[0].TRACKING){
          titleValue = this.serviceData[0].TRACKING;
        }
    }
    this.table_head = [
        {
          field: 'LOTNO',
          title: titleValue,
          type: 'text',
          width: '100'
        },
        {
          field: 'ITEMCODE',
          title: this.translate.instant("ItemCode"),
          type: 'text',
          width: '100'
        },
        {
          field: 'BINNO',
          title: this.translate.instant("BinNo"),
          type: 'text',
          width: '100'
        }
      ];
    
    if("N" == titleValue){
      this.table_head.splice(0, 1);
    }

    this.lookupTitle = this.translate.instant("BatchSrBinList");
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
      }
    }
  }

  showBinList() {
    this.table_head = [
      {
        field: 'BINNO',
        title: this.translate.instant("BinNo"),
        type: 'text',
        width: '100'
      }
    ];
    this.lookupTitle = this.translate.instant("LookupTitle_BinNoList");
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
      }
    }
  }

  orderList() {
    this.table_head = [
      {
        field: 'Order No',
        title: this.translate.instant("Outbound_OrderNo"),
        type: 'text',
        width: '100'
      },
      {
        field: 'Item',
        title: this.translate.instant("ItemCode"),
        type: 'text',
        width: '100'
      }
    ];
    this.lookupTitle = this.translate.instant("LookupTitle_OrderList");
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
      }
    }
  }

  showItemCodeList() {
    this.table_head = [
      {
        field: 'ITEMCODE',
        title: this.translate.instant("ItemCode"),
        type: 'text',
        width: '100'
      },
      {
        field: 'ITEMNAME',
        title: this.translate.instant("ItemName"),
        type: 'text',
        width: '100'
      },
    ];
    this.lookupTitle = this.translate.instant("ItemsList");
    if (this.serviceData !== undefined) {
      if (this.serviceData.length > 0) {
        this.dialogOpened = true;
      }
    }
  }


  onCheckboxClick(checked: any, index: number) {

    let servivceItem: any = this.serviceData[index];
    if (checked) {
      this.selectedValues.push(servivceItem);
    } 
    else {
      // let rixd: number= this.selectedValues.findIndex(i => i.LOTNO == servivceItem.LOTNO && i.LOTNO == servivceItem.BINNO)
      var temp = this.selectedValues.splice(index, 1);
     this.selectedValues = this.selectedValues;
     console.log("selectedValues.size", this.selectedValues.length);
    }
  }




  Done() {
    this.lookupkey.emit(this.selectedValues);
    this.dialogOpened = false; 
  }


}
