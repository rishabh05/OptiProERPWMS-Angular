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
  public skip = 0;
  public mobileMedia = "(max-width: 767px)";
  public desktopMedia = "(min-width: 768px)";
  // GRID VARIABLE


  ngOnInit() {
    this.picktaskService.clearLocaStorage();
    this.ShipDetail = JSON.parse(localStorage.getItem("ShipDetail"));
    this.shipmentno = this.translate.instant("PickListCode") + ": " + this.ShipDetail.OPTM_PICKLIST_CODE;
    this.getPickTaskList(this.ShipDetail.OPTM_TASK_CODE);
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

  getPickTaskList(OPTM_TASK_CODE) {
    this.showLoader = true;
    this.picktaskService.GetDataBasedOnPickList(OPTM_TASK_CODE).subscribe(
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
}
