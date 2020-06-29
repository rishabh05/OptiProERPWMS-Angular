import { Component, OnInit } from '@angular/core';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { Router } from '@angular/router';
import { PickTaskService } from '../../services/picktask.service';
import { ToastrService } from 'ngx-toastr';
import { Commonservice } from '../../services/commonservice.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'app-picking-item-list',
  templateUrl: './picking-item-list.component.html',
  styleUrls: ['./picking-item-list.component.scss']
})
export class PickingItemListComponent implements OnInit {

  ShipDetail: any;
  shipmentno: string;
  PickTaskList: any[] = [];
  showLookupLoader: boolean = true;
  showLoader: boolean = false;
  customereName = "";
  PickTaskDetail: any;

  constructor(private picktaskService: PickTaskService, private commonservice: Commonservice, private router: Router, private toastr: ToastrService, private translate: TranslateService) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.ShipDetail = JSON.parse(localStorage.getItem("ShipDetail"));
      this.shipmentno = this.translate.instant("PickListCode") + ": " + this.ShipDetail.OPTM_PICKLIST_CODE;
    });
  }

  // GRID VAIRABLE         
  public gridView: any = [
    {
      "TaskId": "Task123",
      "TaskType": "Type 1",
      "ItemCode": "Item123",
      "Warehouse": "Warehouse123",
      "Quantity": 1,
      "PlanDate": "12-03-2020"
    },
    {
      "TaskId": "Task123",
      "TaskType": "Type 1",
      "ItemCode": "Item123",
      "Warehouse": "Warehouse123",
      "Quantity": 1,
      "PlanDate": "12-03-2020"
    },
    {
      "TaskId": "Task123",
      "TaskType": "Type 1",
      "ItemCode": "Item123",
      "Warehouse": "Warehouse123",
      "Quantity": 1,
      "PlanDate": "12-03-2020"
    },
    {
      "TaskId": "Task123",
      "TaskType": "Type 1",
      "ItemCode": "Item123",
      "Warehouse": "Warehouse123",
      "Quantity": 1,
      "PlanDate": "12-03-2020"
    }
  ];
  public items: any[] = [];
  public mySelection: number[] = [];
  public pageSize = 10;
  public pagable= false;
  public skip = 0;
  public mobileMedia = "(max-width: 767px)";
  public desktopMedia = "(min-width: 768px)";
  codeLabel: string = "Item Code";
  compId: string;
  // GRID VARIABLE


  ngOnInit() {
    this.picktaskService.clearLocaStorage();
    this.compId = localStorage.getItem("CompID");
    this.ShipDetail = JSON.parse(localStorage.getItem("ShipDetail"));
    this.shipmentno = this.translate.instant("PickListCode") + ": " + this.ShipDetail.OPTM_PICKLIST_CODE;
    this.getPickTaskList(this.ShipDetail.OPTM_TASK_CODE, this.ShipDetail.OPTM_PICKLIST_ID);
  }

  cellClickHandler(row) {
    localStorage.setItem("From", "tasklist");
    localStorage.setItem("PickItemIndex", row.rowIndex);
    localStorage.setItem("TaskDetail", JSON.stringify(this.PickTaskDetail));
    this.router.navigate(['home/picking/picking-item-details']);
  }

  onPrevClick(e) {
    this.router.navigate(['home/picking/picking-list']);
  }

  
  getPickTaskList(OPTM_TASK_CODE, OPTM_PICKLIST_ID) {
    this.showLoader = true;
    this.picktaskService.GetDataBasedOnPickList(OPTM_TASK_CODE, OPTM_PICKLIST_ID).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.showLookupLoader = false;
          this.PickTaskDetail = data;
          this.PickTaskList = data.OPTM_WHSTASKLIST;
          if (localStorage.getItem("PickType") == this.translate.instant("Container_Picking")) {
            for(var i=0; i<this.PickTaskList.length; i++){
              this.PickTaskList[i].CODE = data.OPTM_WHSTASK_DTL.find(e=>e.OPTM_TASKID == this.PickTaskList[i].OPTM_TASKID).OPTM_CONTCODE;
            }
            this.codeLabel = "Container Code";
          }else{
            this.codeLabel = "Item Code";
            for(var i=0; i<this.PickTaskList.length; i++){
              this.PickTaskList[i].CODE = this.PickTaskList[i].OPTM_ITEMCODE;
            }            
          }
          if(this.PickTaskList.length > this.pageSize){
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

  ngOnDestroy() {
    // this.commonservice.CancelPickListAPI(this.ShipDetail.OPTM_PICKLIST_ID, this.compId, this.translate);
  }
}
