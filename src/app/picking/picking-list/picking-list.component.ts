import { Component, OnInit } from '@angular/core';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { Router } from '@angular/router';
import { PickTaskService } from '../../services/picktask.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Commonservice } from '../../services/commonservice.service';

@Component({
  selector: 'app-picking-list',
  templateUrl: './picking-list.component.html',
  styleUrls: ['./picking-list.component.scss']
})
export class PickingListComponent implements OnInit {

  showLookupLoader: boolean = true;
  ShipmentList: any[];
  showLoader: boolean = false;
  PackTypeList: any[] = [];
  PackTypeKeyList: any[] = [];
  Pick_Type: string;
  pickTypeIndex: any = 1;
  showGrid: boolean = false;
  confiParams: any[] = [];

  constructor(private picktaskService: PickTaskService, private commonservice: Commonservice, private router: Router, private toastr: ToastrService, private translate: TranslateService) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.initialize();
    });
  }

  // GRID VAIRABLE
  public gridView: any = [
    {
      "OPTM_DOCENTRY": "Ship123",
      "OPTM_BPCODE": "BatchMaster Pvt. Ltd",
      "OPTM_SHIPTO": "Indore",
      "OPTM_WHSCODE": "Warehouse123"
    }, {
      "OPTM_DOCENTRY": "Ship123",
      "OPTM_BPCODE": "BatchMaster Pvt. Ltd",
      "OPTM_SHIPTO": "Indore",
      "OPTM_WHSCODE": "Warehouse123"
    },
    {
      "OPTM_DOCENTRY": "Ship123",
      "OPTM_BPCODE": "BatchMaster Pvt. Ltd",
      "OPTM_SHIPTO": "Indore",
      "OPTM_WHSCODE": "Warehouse123"
    },
    {
      "OPTM_DOCENTRY": "Ship123",
      "OPTM_BPCODE": "BatchMaster Pvt. Ltd",
      "OPTM_SHIPTO": "Indore",
      "OPTM_WHSCODE": "Warehouse123"
    },
  ];
  public items: any[] = [];
  public mySelection: number[] = [];
  public pageSize = 10;
  public pagable = false;
  public skip = 0;
  public mobileMedia = "(max-width: 767px)";
  public desktopMedia = "(min-width: 768px)";
  pickListSteps: any[] = [];
  // GRID VARIABLE

  ngOnInit() {
    this.picktaskService.clearLocaStorage();
    this.initialize();

    // this.GetPicklist(this.pickTypeIndex)
    // this.commonservice.setCustomizeInfo();
  }

  initialize() {
    this.PackTypeList = [this.translate.instant("Batch_Picking"),
    this.translate.instant("Cluster_Picking"), this.translate.instant("Container_Picking"),
    this.translate.instant("Discreate_Picking"), this.translate.instant("Zone_Picking")];

    this.PackTypeKeyList = ["Batch_Picking", "Cluster_Picking", "Container_Picking", "Discrete_Picking", "Zone_Picking"];

    this.commonservice.GetSelectedSteps("Picking");

    if (localStorage.getItem("PickType") != "") {
      this.Pick_Type = localStorage.getItem("PickType");
      this.pickTypeIndex = this.PackTypeList.indexOf(this.Pick_Type);
      localStorage.setItem("PickTypeKey", this.PackTypeKeyList[this.pickTypeIndex]);
      this.pickTypeIndex = this.pickTypeIndex + 1;
      if (this.pickTypeIndex > 0) {
        localStorage.setItem("PickTypeIndex", this.pickTypeIndex);
        this.GetPicklist(this.pickTypeIndex);
      }
    }
  }

  onShipmentSelection(row) {
    localStorage.setItem("ShipDetail", JSON.stringify(row.dataItem));
    localStorage.setItem("From", "shiplist");
    localStorage.setItem("TaskDetail", "");
    this.router.navigate(['home/picking/picking-item-details']);
  }

  checkIfPickProcessAuto(dataItem) {
    this.confiParams = JSON.parse(localStorage.getItem('ConfigurationParam'));
    let result = this.confiParams.find(e => e.OPTM_PARAM_NAME == "Param_Picking_Process" && e.OPTM_PARAM_VALUE == "Push-Automatic")
    if (result != undefined) {
      // localStorage.setItem("ShipDetail", JSON.stringify(dataItem));
      // localStorage.setItem("From", "shiplist");
      // localStorage.setItem("TaskDetail", "");
      // localStorage.setItem("Param", "Auto");
      // this.router.navigate(['home/picking/picking-item-details']);
    }else{
      localStorage.setItem("Param", "");
    }
  }

  showPickTaskList(row) {
    //OPTM_PICKLIST_ID
    localStorage.setItem("ShipDetail", JSON.stringify(row));
    this.router.navigate(['home/picking/picking-item-list']);
  }

  GetPicklist(OPTM_PICK_TYPE) {
    this.showLoader = true;
    this.picktaskService.GetPicklist(OPTM_PICK_TYPE).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.showLookupLoader = false;
          this.ShipmentList = data.Table;
          if (this.ShipmentList.length > 0) {
            this.showGrid = true;
            this.checkIfPickProcessAuto(this.ShipmentList[0]);
          } else {
            this.showGrid = false;
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
          }
          if (this.ShipmentList.length > this.pageSize) {
            this.pagable = true;
          }
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        this.showLoader = false;
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }




  ShowBatchSerials() {

  }


  onPickTypeChange(event) {
    this.pickTypeIndex = this.PackTypeList.indexOf(event);
    localStorage.setItem("PickTypeKey", this.PackTypeKeyList[this.pickTypeIndex]);
    this.pickTypeIndex = this.pickTypeIndex + 1;
    if (event == this.PackTypeList[2]) {
    }
    this.GetPicklist(this.pickTypeIndex);
    localStorage.setItem("PickType", event);
    localStorage.setItem("PickTypeIndex", this.pickTypeIndex);

  }
}
