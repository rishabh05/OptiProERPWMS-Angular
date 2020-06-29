import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PickTaskService } from '../../services/picktask.service';
import { Commonservice } from '../../services/commonservice.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PickTaskModel } from '../../models/PickTaskModel';
import { BtchNoneModel } from '../../models/BtchNoneModel';

@Component({
  selector: 'app-picking-item-details',
  templateUrl: './picking-item-details.component.html',
  styleUrls: ['./picking-item-details.component.scss']
})
export class PickingItemDetailsComponent implements OnInit {

  PickTaskList: any[] = [];
  SubmitPickTaskData: any[] = [];
  BtchSerDtlData: any[] = [];
  showbtchser: any[] = [];
  hideLookup = true;
  lookupfor: string;
  serviceData: any[] = [];
  PickTaskDetail: any;
  showLookupLoader: boolean = true;
  showLoader: boolean = false;
  compId = "";
  threeSteps: boolean = true;
  IsContPicking: boolean = false;
  pickTaskName: string;
  openQty: number;
  totalpickQty: number = 0;
  pickQty: number = undefined;
  index = 0;
  PT_Enter_Location: string;
  PT_ItemCode: string;
  PT_Enter_ContBtchSer: string;
  ContBtchSerArray: string[] = [];
  BtchNoneArray: any[] = [];
  Location: string = "Location";
  locationValue: string = "";
  OPTM_Tracking: string = 'S';
  itemcodeLabel: string;
  itemcodeValue: string;
  showLocation: boolean = true;
  ShipmentList: any[] = [];
  PickListSteps: any[] = [];
  totalPickTaskCount: Number;
  completedTaskCount = 0;  
  dialogOpened: boolean = false;
  // steps Start
  LOCATION_STEP = 1;
  ITEM_STEP = 2;
  CONT_BTCH_SER_STEP = 3;
  QTY_STEP = 4;
  CONFIRM_CONTAINER_STEP = 5;
  LastStep = 0;
  addItemtoCont: boolean = false;
  ContainerTotePlaceHolder: string;
  ContainerToteTitle: string;
  containercreated: boolean = false;
  containerAlreadyCreated: boolean = false;
  ScannedContOrTote: string = "";
  CreatedContOrTote: string;
  PickDropBinLabel: string = "Drop Bin";
  PlannedPickDropBin: string
  stepIndex = 0;
  whsCode: string;
  UserGrp: string;
  BatchSerDetail: any;
  pickedAllDty = false;
  countOfPickedTasks: number = 0;
  iterateSteps = false;
  stepIncrementValue = 1;
  ContainerCodePlaceholderValue: string;
  OPTM_STARTDATETIME: Date;
  Type: string;

  @ViewChild('focusOnSerNo') focusOnSerNo;
  @ViewChild('focusOnItemCode') focusOnItemCode;
  @ViewChild('focusOnLocation') focusOnLocation;
  @ViewChild('focusOnQty') focusOnQty;
  @ViewChild('focusOnScanCont') focusOnScanCont;


  constructor(private picktaskService: PickTaskService, private commonservice: Commonservice, private router: Router, private toastr: ToastrService, private translate: TranslateService) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  // GRID VAIRABLE
  public currentStepText = "";
  public currentStep: any = 1;
  public maxStep = 3;
  PickOperationList: any[] = [];
  CurrentTaskSteps: any[] = [];
  // GRID VARIABLE

  ngOnInit() {
    var intPicklistID: number = 0;
    this.clearScanningFields();
    this.countOfPickedTasks = 0;
    this.ShipmentList[0] = JSON.parse(localStorage.getItem("ShipDetail"));
    this.PlannedPickDropBin = this.ShipmentList[0].OPTM_PICK_DROP_BIN;
    this.PickListSteps = JSON.parse(localStorage.getItem("PickListSteps"));
    this.compId = localStorage.getItem("CompID");
    this.PickOperationList = ["", "Pick_To_Tote", "Pick_To_Container", ""];
    if (localStorage.getItem("TaskDetail") != undefined && localStorage.getItem("TaskDetail") != "" && localStorage.getItem("TaskDetail") != "null") {
      this.index = Number(localStorage.getItem("PickItemIndex"));
    }
    //this.getPickTaskList(this.ShipmentList[0].OPTM_TASK_CODE, this.ShipmentList[0].OPTM_PICKLIST_ID);
    intPicklistID = this.ShipmentList[0].OPTM_PICKLIST_ID;    
    this.GetNextPickList(intPicklistID, true);
  }

  cellClickHandler(row) {
    var intPicklistID: number = 0;
    this.completedTaskCount = 0;
    this.dialogOpened = false;
    this.index = Number(row.rowIndex);
    intPicklistID = this.ShipmentList[0].OPTM_PICKLIST_ID;    
    this.GetNextPickList(intPicklistID, true);
    //this.getPickTaskList(this.ShipmentList[0].OPTM_TASK_CODE, this.ShipmentList[0].OPTM_PICKLIST_ID);
  }

  setPickingSteps(OPTM_MSTR_TRANS_TYPE, PickOperationIndex) {
    //this.CurrentTaskSteps = this.PickListSteps.filter(element => (element.OPTM_MSTR_TRANS_TYPE == OPTM_MSTR_TRANS_TYPE && element.OPTM_APPLCBLE_IN_OPN == this.PickOperationList[Number(PickOperationIndex)]) || (element.OPTM_MSTR_TRANS_TYPE == OPTM_MSTR_TRANS_TYPE && element.OPTM_APPLCBLE_IN_OPN == this.PickOperationList[3]));
    this.CurrentTaskSteps = this.PickListSteps.filter(element => (((element.OPTM_MSTR_TRANS_TYPE == OPTM_MSTR_TRANS_TYPE && element.OPTM_APPLCBLE_IN_OPN == this.PickOperationList[Number(PickOperationIndex)]) || (element.OPTM_MSTR_TRANS_TYPE == OPTM_MSTR_TRANS_TYPE && element.OPTM_APPLCBLE_IN_OPN == this.PickOperationList[3])) && element.OPTM_APPLICABLE_BO == 2));
    if (this.CurrentTaskSteps != undefined && this.CurrentTaskSteps.length > 0) {
      this.currentStep = this.getStepNo(this.CurrentTaskSteps[0].OPTM_STEP_CODE);
      if (this.currentStep == "0") {
        this.CurrentTaskSteps.splice(0, 1);
        this.currentStep = this.getStepNo(this.CurrentTaskSteps[0].OPTM_STEP_CODE);
        this.addItemtoCont = true;
      } else {
        this.addItemtoCont = false;
      }
      this.maxStep = this.CurrentTaskSteps.length;
    }
  }

  CreateContainerOrTote() {
    if (this.CreatedContOrTote == "" || this.CreatedContOrTote == null || this.CreatedContOrTote == undefined) {
      if (this.ShipmentList[0].OPTM_PICK_OPER == "2") {
        this.toastr.error("", this.translate.instant("CCBlankMsg"))
      } else {
        this.toastr.error("", this.translate.instant("ToteBlankMsg"))
      }
      return;
    }
    if (this.ShipmentList[0].OPTM_PICK_OPER == "2") {
      this.toastr.success("", this.translate.instant("CCCreated"))
    } else {
      this.toastr.success("", this.translate.instant("ToteCreated"))
    }
    this.containercreated = true;
  }

  getStepNo(OPTM_STEP_CODE): any {
    switch (OPTM_STEP_CODE) {
      case "Associate_Container_To_Pick_List":
      case "Associate_Tote_To_Pick_List":
        return 0;
      case "Confirm_Pick_From_Bin":
        return 1;
      case "Confirm_Item_Picked":
        return 2;
      case "Confirm_Container_Picked":
      case "Confirm_Batch_Picked":
      case "Confirm_Serial_Picked":
        return 3;
      case "Confirm_Picked_Quantity":
        return 4;
      case "Confirm_Picked_To_Container":
      case "Confirm_Picked_To_Tote":
        return 5;
      case "Confirm_Pick_Drop_Location":
        return 6;
      case "Confirm_Pick_Drop_Event":
        return 7;
      default:
        return 1;
    }
  }

  hideShowFields(customizationDetail) {
    this.showLocation = customizationDetail.PickTaskLocation;
    if (!this.showLocation) {
      this.nextStep();
    }
  }

  displayPickListData(data: any) {
    this.PickTaskList = data.OPTM_WHSTASKLIST;
    //Set Picklist Status after fetching from database
    this.PickListStatus = data.OPTM_WHSTASKLIST[0].PICKLIST_STATUS
    this.PickTaskDetail = data;
    if (this.PickTaskList.length == 0) {
      this.toastr.error('', "No task available for this picklist");
      this.onBackClick();
      return;
    }
    this.setValues(this.index);
    // console.log("4  " + new Date().toLocaleTimeString());
  }

  getPickTaskList(OPTM_TASK_CODE, OPTM_PICKLIST_ID) {
    this.showLoader = true;
    // console.log("2  " + new Date().toLocaleTimeString());
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
          this.displayPickListData (data);
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

  setValues(index) {
    this.pickTaskName = this.PickTaskList[index].OPTM_TASKID;
    this.openQty = this.PickTaskList[index].OPTM_TASK_QTY;
    if (this.openQty == 0) {
      this.toastr.error('', "No task available for this picklist");
      this.onBackClick();
      return;
    }
    this.OPTM_Tracking = this.PickTaskList[index].OPTM_TRACKING;
    this.locationValue = this.PickTaskList[index].OPTM_SRC_BIN;
    this.OPTM_STARTDATETIME = new Date();
    this.itemcodeLabel = "Code";
    if (localStorage.getItem("PickType") == this.translate.instant("Container_Picking")) {
      this.Type = "Container"
      // this.itemcodeLabel = "Code";//this.translate.instant("ContainerId");
      this.totalPickTaskCount = this.PickTaskList.length;
      this.itemcodeValue = this.PickTaskList[index].OPTM_ITEMCODE = this.PickTaskDetail.OPTM_WHSTASK_DTL.find(e => e.OPTM_TASKID == this.pickTaskName).OPTM_CONTCODE;
      for (var i = 0; i < this.PickTaskList.length; i++) {
        this.PickTaskList[i].OPTM_ITEMCODE = this.PickTaskDetail.OPTM_WHSTASK_DTL.find(e => e.OPTM_TASKID == this.PickTaskList[i].OPTM_TASKID).OPTM_CONTCODE;//[i].OPTM_CONTCODE;
      }
      this.IsContPicking = false;
      this.setPickingSteps(localStorage.getItem("PickTypeKey"), this.ShipmentList[0].OPTM_PICK_OPER);
    } else {
      // this.itemcodeLabel = "Code";//this.translate.instant("ItemCode");
      this.itemcodeValue = this.PickTaskList[index].OPTM_ITEMCODE;
      this.IsContPicking = false;
      let OPTM_MSTR_TRANS_TYPE = "";
      if (this.OPTM_Tracking == 'S') {
        OPTM_MSTR_TRANS_TYPE = "Serial_Picking"
        this.Type = "Serial"
      } else if (this.OPTM_Tracking == 'B') {
        OPTM_MSTR_TRANS_TYPE = "Batch_Picking";
        this.Type = "Batch"
      } else {
        OPTM_MSTR_TRANS_TYPE = "Item_Picking";
        this.IsContPicking = true;
        this.Type = "Item"
      }
      if ((this.PickTaskDetail.OPTM_WHSTASK_BTCHSER.length <= 0) || this.PickTaskDetail.OPTM_WHSTASK_BTCHSER.find(e => e.OPTM_ITEMCODE == this.itemcodeValue) == undefined) {
        this.IsContPicking = true;
      }
      this.setPickingSteps(OPTM_MSTR_TRANS_TYPE, this.ShipmentList[0].OPTM_PICK_OPER);
    }

    if (this.ShipmentList[0].OPTM_PICK_OPER == "1") {
      this.addItemtoCont = true;
      this.ContainerTotePlaceHolder = this.translate.instant("EnterTote");
      this.ContainerToteTitle = this.translate.instant("Tote");
      this.ContainerCodePlaceholderValue = this.translate.instant("TotePlaceholder");
      if (this.ShipmentList[0].OPTM_CONTCODE != "" && this.ShipmentList[0].OPTM_CONTCODE != null) {
        this.CreatedContOrTote = this.ShipmentList[0].OPTM_CONTCODE
        this.containerAlreadyCreated = this.containercreated = true;
      } else {
        this.containerAlreadyCreated = false;
      }
    } else if (this.ShipmentList[0].OPTM_PICK_OPER == "2") {
      this.addItemtoCont = true;
      this.ContainerTotePlaceHolder = this.translate.instant("ContainerCodePlaceholder");
      this.ContainerToteTitle = this.translate.instant("ContainerCode");
      this.ContainerCodePlaceholderValue = this.translate.instant("ContainerCodePlaceholder");
      if (this.ShipmentList[0].OPTM_CONTCODE != "" && this.ShipmentList[0].OPTM_CONTCODE != null) {
        this.CreatedContOrTote = this.ShipmentList[0].OPTM_CONTCODE
        this.containerAlreadyCreated = this.containercreated = true;
      } else {
        this.containerAlreadyCreated = false;
      }
    } else {
      this.addItemtoCont = false;
    }

    if (this.OPTM_Tracking == 'S' || localStorage.getItem("PickType") == this.translate.instant("Container_Picking")) {
      this.threeSteps = false;
    } else {
      this.threeSteps = true;
    }
    this.setfocus();
    this.totalPickTaskCount = this.PickTaskList.length;
    if (this.completedTaskCount == this.totalPickTaskCount) {
      this.completedTaskCount = 0;
    }
    this.completedTaskCount = this.completedTaskCount + 1;
    this.changeText(this.currentStep);
    this.whsCode = this.PickTaskList[this.index].OPTM_SRC_WHSE;
    this.UserGrp = this.PickTaskList[this.index].OPTM_USER_GRP;
  }

  prevStep() {
    this.stepIndex = this.stepIndex - 1;
    if (this.stepIndex >= 0 && this.stepIndex < this.CurrentTaskSteps.length) {
      let step = this.getStepNo(this.CurrentTaskSteps[this.stepIndex].OPTM_STEP_CODE);
      this.stepIncrementValue = step - this.currentStep;
      this.currentStep = step;
    }
    if (this.currentStep >= 1) {
      this.changeText(this.currentStep)
    }
  }

  preRequisite(): boolean {
    if (this.CreatedContOrTote == "" || this.CreatedContOrTote == null || this.CreatedContOrTote == undefined) {
      if (this.ShipmentList[0].OPTM_PICK_OPER == "2") {
        this.toastr.error("", this.translate.instant("CCBlankMsg"))
      } else if (this.ShipmentList[0].OPTM_PICK_OPER == "1") {
        this.toastr.error("", this.translate.instant("ToteBlankMsg"))
      } else {
        return true;
      }
      return false;
    }
    return true;
  }

  clearStepsFields() {
    this.stepIndex = -1;
    this.stepIncrementValue = 1;
  }

  nextStepRunning = false;
  handlenextStep(){
    if (this.currentStep == this.ITEM_STEP) {
      this.onItemChange();
    } else if (this.currentStep == this.CONT_BTCH_SER_STEP) {
      this.onLotChange();
    } else if (this.currentStep == this.QTY_STEP) {
      this.onQtyChange();
    }
    else if (this.currentStep == this.CONFIRM_CONTAINER_STEP) {
     this.ConfirmContainerOrTote();
    } else if (this.currentStep == this.LOCATION_STEP) {
     this.onLocationChange();
    }
  }

  nextStep() {
    if (this.nextStepRunning) {
      // this.nextStepRunning = false;
      return;
    }
    this.nextStepRunning = true;
    this.iterateSteps = false;
    if (!this.preRequisite()) {
      this.nextStepRunning = false;
      return;
    }
    if (this.stepIndex < this.maxStep) {
      if (this.currentStep == this.LOCATION_STEP && (this.PT_Enter_Location == undefined || this.PT_Enter_Location == "")) {
        this.toastr.error('', this.translate.instant("PT_Location_blank"));
        this.nextStepRunning = false;
        return;
      }
      else if (this.currentStep == this.ITEM_STEP && (this.PT_ItemCode == undefined || this.PT_ItemCode == "")) {
        this.nextStepRunning = false;
        return;
      } else if (this.currentStep == this.CONT_BTCH_SER_STEP && (this.PT_Enter_ContBtchSer == undefined || this.PT_Enter_ContBtchSer == "")) {
        this.nextStepRunning = false;
        return;
      } else if (this.currentStep == this.QTY_STEP && (this.pickQty == undefined || Number(this.pickQty) <= 0)) {
        this.nextStepRunning = false;
        return;
      }
      this.stepIndex = this.stepIndex + 1;
      if (this.stepIndex >= 0 && this.stepIndex < this.CurrentTaskSteps.length) {
        let step = this.getStepNo(this.CurrentTaskSteps[this.stepIndex].OPTM_STEP_CODE);
        this.stepIncrementValue = step - this.currentStep;
        this.currentStep = step;
        if (this.stepIndex == this.CurrentTaskSteps.length - 1) {
          this.LastStep = this.currentStep;
        }
        if (this.currentStep == "4") {
          // this.DisplayBalQty();
        }
      }
      this.setStepfocus();
      this.changeText(this.currentStep)
    }
    this.nextStepRunning = false;
  }

  nextSteptoIterate() {
    if (this.nextStepRunning) {
      // this.nextStepRunning = false;
      return;
    }
    this.nextStepRunning = true;
    this.iterateSteps = true;
    if (!this.preRequisite()) {
      this.nextStepRunning = false;
      return;
    }
    if (this.stepIndex < this.maxStep - 1) {
      if (this.currentStep == this.LOCATION_STEP && (this.PT_Enter_Location == undefined || this.PT_Enter_Location == "")) {
        this.nextStepRunning = false;
        this.toastr.error('', this.translate.instant("PT_Location_blank"));
        return;
      }
      else if (this.currentStep == this.ITEM_STEP && (this.PT_ItemCode == undefined || this.PT_ItemCode == "")) {
        this.nextStepRunning = false;
        return;
      } else if (this.currentStep == this.CONT_BTCH_SER_STEP && (this.PT_Enter_ContBtchSer == undefined || this.PT_Enter_ContBtchSer == "")) {
        this.nextStepRunning = false;
        return;
      } else if (this.currentStep == this.QTY_STEP && (this.pickQty == undefined || Number(this.pickQty) <= 0)) {
        this.nextStepRunning = false;
        return;
      }

      this.stepIndex = this.stepIndex + 1;
      if (this.stepIndex >= 0 && this.stepIndex < this.CurrentTaskSteps.length) {
        if (this.CurrentTaskSteps[this.stepIndex].OPTM_ITERATE == "Y") {
          let step = this.getStepNo(this.CurrentTaskSteps[this.stepIndex].OPTM_STEP_CODE);
          this.stepIncrementValue = step - this.currentStep;
          this.currentStep = step;
          if (this.stepIndex == this.CurrentTaskSteps.length - 1) {
            this.LastStep = this.currentStep;
          }
          if (this.currentStep == "4") {
            // this.DisplayBalQty();
          }
        } else {
          if (this.stepIndex == this.CurrentTaskSteps.length - 1) {
            this.LastStep = this.currentStep;
            this.checkIfQtyFullFiled()
          } else {
            this.nextSteptoIterate();
          }
        }
      }
      this.setStepfocus();
      this.changeText(this.currentStep)
    }
    this.nextStepRunning = false;
  }

  DisplayBalQty() {
    if (this.OPTM_Tracking == 'N') {
      let sum = 0;
      for (var i = 0; i < this.BtchNoneArray.length; i++) {
        sum = sum + this.BtchNoneArray[i].OPTM_Qty;
      }
      this.totalpickQty = sum;
      this.pickQty = this.openQty - sum;
    }
    else if (this.OPTM_Tracking == 'B') {
      if (this.PickTaskDetail.OPTM_WHSTASK_BTCHSER.length > 0) {
        let BtchSerDtl = this.PickTaskDetail.OPTM_WHSTASK_BTCHSER.find(e => e.OPTM_BTCHSER == this.PT_Enter_ContBtchSer && e.OPTM_TASKID == this.pickTaskName && e.OPTM_ITEMCODE == this.itemcodeValue);
        if (BtchSerDtl == undefined) {
          let sum = 0;
          for (var i = 0; i < this.BtchNoneArray.length; i++) {
            sum = sum + this.BtchNoneArray[i].OPTM_Qty;
          }
          this.pickQty = this.openQty - sum;
        } else {
          let result = this.BtchNoneArray.find(element => element.OPTM_ContBtchSer == this.PT_Enter_ContBtchSer);
          if (result == undefined) {
            this.pickQty = Number(BtchSerDtl.OPTM_Qty);
          } else {
            this.pickQty = Number(BtchSerDtl.OPTM_Qty) - Number(result.OPTM_Qty);
          }
        }
      }
    }    
  }

  setStepfocus() {
    if (this.currentStep == this.ITEM_STEP) {
      setTimeout(() => {
        this.focusOnItemCode.nativeElement.focus();
      }, 500)
    } else if (this.currentStep == this.CONT_BTCH_SER_STEP) {
      setTimeout(() => {
        this.focusOnSerNo.nativeElement.focus();
      }, 500)
    } else if (this.currentStep == this.QTY_STEP) {
      setTimeout(() => {
        this.focusOnQty.nativeElement.focus();
      }, 500)
    }
    else if (this.currentStep == this.CONFIRM_CONTAINER_STEP) {
      setTimeout(() => {
        this.focusOnScanCont.nativeElement.focus();
      }, 500)
    } else if (this.currentStep == this.LOCATION_STEP) {
      setTimeout(() => {
        this.focusOnLocation.nativeElement.focus();
      }, 500)
    }
  }

  setfocus() {
    if (this.currentStep == this.ITEM_STEP) {
      this.PT_ItemCode = "";
      setTimeout(() => {
        this.focusOnItemCode.nativeElement.focus();
      }, 500)
    } else if (this.currentStep == this.CONT_BTCH_SER_STEP) {
      this.PT_Enter_ContBtchSer = "";
      setTimeout(() => {
        this.focusOnSerNo.nativeElement.focus();
      }, 500)
    } else if (this.currentStep == this.QTY_STEP) {
     // this.pickQty = undefined;
      setTimeout(() => {
        this.focusOnQty.nativeElement.focus();
      }, 500)
    } else if (this.currentStep == this.CONFIRM_CONTAINER_STEP) {
      this.ScannedContOrTote = "";
      setTimeout(() => {
        this.focusOnScanCont.nativeElement.focus();
      }, 500)
    } else if (this.currentStep == this.LOCATION_STEP) {
      this.PT_Enter_Location = "";
      setTimeout(() => {
        this.focusOnLocation.nativeElement.focus();
      }, 500)
    }
  }

  ConfirmContainerOrTote() {
    if (this.ScannedContOrTote == undefined || this.ScannedContOrTote == "") {
      return;
    }
    if (this.ScannedContOrTote === this.CreatedContOrTote) {
      this.checkIfQtyFullFiled();
    } else {
      this.ScannedContOrTote = "";
      if (this.ShipmentList[0].OPTM_PICK_OPER == "2") {
        this.toastr.error('', this.translate.instant("CCDoesntMatch"));
      } else {
        this.toastr.error('', this.translate.instant("ToteDoesntMatch"));
      }
      this.setfocus();
    }
  }

  cycleIndex = 0;
  onLocationChange() {
    if (this.PT_Enter_Location == undefined || this.PT_Enter_Location == "") {
      return;
    }
    if (this.PT_Enter_Location === this.PickTaskList[this.index].OPTM_SRC_BIN) {// location

      if (this.iterateSteps) {
        this.nextSteptoIterate();
      } else {
        this.nextStep();
      }
    } else {
      this.toastr.error('', this.translate.instant("PT_Location_not_match"));
      this.PT_Enter_Location = "";
      this.setfocus();
    }
  }

  onItemChange() {
    if (this.PT_ItemCode == undefined || this.PT_ItemCode == "") {
      return;
    }
    if (this.PT_ItemCode === this.PickTaskList[this.index].OPTM_ITEMCODE) {
      if (this.iterateSteps) {
        this.nextSteptoIterate();
      } else {
        this.nextStep();
      }
    } else {
      this.toastr.error('', this.translate.instant("InvalidItemCode"));
      this.PT_ItemCode = "";
      this.setfocus();
    }
  }

  skipPickTask() {
    this.clearFields();
    this.pickedAllDty = false;
    this.index = this.index + 1;
    if (this.index == this.PickTaskList.length) {
      this.index = 0;
    }
    this.setValues(this.index);
  }

  onLotChange() {
    if (this.PT_Enter_ContBtchSer == undefined || this.PT_Enter_ContBtchSer == "") {
      return;
    }
    let batserAdded = false;
    if (localStorage.getItem("PickType") == this.translate.instant("Container_Picking")) {
      for (var i = 0; i < this.PickTaskDetail.OPTM_WHSTASK_DTL.length; i++) {
        if (this.PickTaskDetail.OPTM_WHSTASK_DTL[i].OPTM_TASKID == this.PickTaskList[this.index].OPTM_TASKID) {
          if (this.PT_Enter_ContBtchSer === this.PickTaskDetail.OPTM_WHSTASK_DTL[i].OPTM_CONTCODE) {
            batserAdded = true;
            let result = this.ContBtchSerArray.find(element => element == this.PT_Enter_ContBtchSer);
            if (result == undefined) {
              this.ContBtchSerArray.push(this.PT_Enter_ContBtchSer);
              this.totalpickQty = this.totalpickQty + 1;
              this.toastr.success('', this.translate.instant("Cont_Accepted"));
              if (Number(this.totalpickQty) == Number(this.openQty)) {
                this.checkIfQtyFullFiled();
              } else {
                this.PT_Enter_ContBtchSer = "";
                this.clearStepsFields();
                this.nextSteptoIterate();
              }
            } else {
              this.toastr.error('', this.translate.instant("DataAlreadySaved"));
              this.PT_Enter_ContBtchSer = "";
            }
            break;
          }
        }
      }
    } else {
      if (this.PickTaskDetail.OPTM_WHSTASK_BTCHSER != undefined && this.PickTaskDetail.OPTM_WHSTASK_BTCHSER.length > 0 && this.PickTaskDetail.OPTM_WHSTASK_BTCHSER.find(e => e.OPTM_ITEMCODE == this.itemcodeValue && e.OPTM_BTCHSER != '') != undefined) {
        for (var i = 0; i < this.PickTaskDetail.OPTM_WHSTASK_BTCHSER.length; i++) {
          if (this.PickTaskDetail.OPTM_WHSTASK_BTCHSER[i].OPTM_TASKID == this.PickTaskList[this.index].OPTM_TASKID) {
            if (this.PT_Enter_ContBtchSer === this.PickTaskDetail.OPTM_WHSTASK_BTCHSER[i].OPTM_BTCHSER) {
              batserAdded = true;
              this.addBatchSerials();
              // if (!this.threeSteps) {
              //   this.PT_Enter_ContBtchSer = "";
              // }
              break;
            }
          }
        }
      } else {
        batserAdded = true;
        this.IsValidBatchSerial();
      }
    }
    if (!batserAdded) {
      this.toastr.error('', this.translate.instant("PT_ContBtchSer_not_match"));
      this.PT_Enter_ContBtchSer = "";
    }
    this.setfocus();
  }

  addBatchSerials() {
    if (this.OPTM_Tracking == 'S') {
      let result = this.ContBtchSerArray.find(element => element == this.PT_Enter_ContBtchSer);
      if (result == undefined) {
        // if (this.OPTM_Tracking == 'S') {
        this.ContBtchSerArray.push(this.PT_Enter_ContBtchSer);
        this.totalpickQty = this.totalpickQty + 1;
        this.ItemDetail.push({
          OPTM_TASKID: this.PickTaskList[this.index].OPTM_TASKID,
          OPTM_ITEMCODE: this.itemcodeValue,
          OPTM_ACTUAL_QTY: 1,
          OPTM_BTCHSER: this.PT_Enter_ContBtchSer,
          OPTM_RESID_ACT: localStorage.getItem("UserId"),
          OPTM_STARTDATETIME: this.OPTM_STARTDATETIME.toLocaleDateString()
        });
        // }
        if (this.currentStep == this.LastStep) {
          this.checkIfQtyFullFiled();
        } else {
          if (this.iterateSteps) {
            this.nextSteptoIterate();
          } else {
            this.nextStep();
          }
        }
      } else {
        this.toastr.error('', this.translate.instant("DataAlreadySaved"));
        this.PT_Enter_ContBtchSer = "";
      }
    }
    else {
      if (this.OPTM_Tracking == 'B') {
        let result = this.BtchNoneArray.find(element => element.OPTM_ContBtchSer == this.PT_Enter_ContBtchSer);
        if (result == undefined) {
          if (this.iterateSteps) {
            this.nextSteptoIterate();
          } else {
            this.nextStep();
          }
        } else {
          let btchDetail = this.PickTaskDetail.OPTM_WHSTASK_BTCHSER.find(e => e.OPTM_BTCHSER == this.PT_Enter_ContBtchSer && e.OPTM_TASKID == this.pickTaskName && e.OPTM_ITEMCODE == this.itemcodeValue);
          if (Number(result.OPTM_Qty) > Number(btchDetail.OPTM_PLANNED_QTY)) {
            this.toastr.error('', this.translate.instant("AlreadyPickQty"))
          } else {
            if (this.iterateSteps) {
              this.nextSteptoIterate();
            } else {
              this.nextStep();
            }
          }
        }
      }
    }
  }

  IsValidBatchSerial() {
    if (this.PT_Enter_ContBtchSer == "" || this.PT_Enter_ContBtchSer == undefined) {
      return;
    }
    this.BatchSerDetail = "";
    this.showLoader = true;
    this.picktaskService.IsValidBatchSerial(this.itemcodeValue, this.PT_Enter_ContBtchSer, this.PT_Enter_Location).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.showLookupLoader = false;
          if (data.Table.length > 0) {
            this.PT_Enter_ContBtchSer = data.Table[0].LOTNO;
            this.BatchSerDetail = data.Table[0];
            this.addBatchSerials();
            if (this.OPTM_Tracking == 'S' && this.PT_Enter_ContBtchSer != "") {
              this.BtchSerDtlData.push({
                OPTM_TASKID: this.PickTaskList[this.index].OPTM_TASKID,
                OPTM_ITEMCODE: this.itemcodeValue,
                OPTM_BIN: this.PT_Enter_Location,
                OPTM_CONTAINER_ID: "",
                OPTM_QTY: 1,
                OPTM_BTCHSER: this.PT_Enter_ContBtchSer,
                OPTM_CREATEDBY: localStorage.getItem("UserId"),
                OPTM_STARTDATETIME: this.OPTM_STARTDATETIME.toLocaleDateString()
              });
            }
          } else {
            this.PT_Enter_ContBtchSer = "";
            this.toastr.error('', this.translate.instant("ProdReceipt_InvalidBatchSerial"));
          }
        } else {
          this.PT_Enter_ContBtchSer = "";
          this.toastr.error('', this.translate.instant("ProdReceipt_InvalidBatchSerial"));
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



  onQtyChange() {
    if (this.pickQty == undefined || Number(this.pickQty) <= 0) {
      return;
    }

    // Manage qty with Batch
    if (this.OPTM_Tracking == 'B') {
      if (this.PickTaskDetail.OPTM_WHSTASK_BTCHSER.length > 0) {
        let BtchSerDtl = this.PickTaskDetail.OPTM_WHSTASK_BTCHSER.find(e => e.OPTM_BTCHSER == this.PT_Enter_ContBtchSer && e.OPTM_TASKID == this.pickTaskName && e.OPTM_ITEMCODE == this.itemcodeValue);
        if (BtchSerDtl == undefined) {

        } else {
          let result = this.BtchNoneArray.find(element => element.OPTM_ContBtchSer == this.PT_Enter_ContBtchSer);
          if (result == undefined) {
            if (Number(this.pickQty) > Number(BtchSerDtl.OPTM_PLANNED_QTY)) {
              this.toastr.error('', this.translate.instant("QtyExceed"));
              this.pickQty = undefined
              this.setfocus();
              return;
            }
          } else {
            if ((Number(this.pickQty) + Number(result.OPTM_Qty)) > Number(BtchSerDtl.OPTM_PLANNED_QTY)) {
              this.toastr.error('', this.translate.instant("QtyExceed"));
              this.pickQty = undefined
              this.setfocus();
              return;
            }
          }
        }
      } else {
        if (Number(this.pickQty) > Number(this.BatchSerDetail.TOTALQTY)) {
          this.toastr.error('', this.translate.instant("QtyExceed"));
          this.pickQty = undefined
          this.setfocus();
          return;
        }
      }
    }

    let sum = 0;
    for (var i = 0; i < this.BtchNoneArray.length; i++) {
      sum = sum + this.BtchNoneArray[i].OPTM_Qty;
    }
    if ((sum + this.pickQty) <= this.openQty) {
      this.totalpickQty = sum + this.pickQty;
    } else {
      this.toastr.error('', this.translate.instant("Inbound_NoOpenQuantityValid"));
      this.pickQty = undefined;
      this.setfocus();
      return;
    }

    if (this.currentStep == this.LastStep) {
      this.checkIfQtyFullFiled();
    } else {
      if (this.iterateSteps) {
        this.nextSteptoIterate();
      } else {
        this.nextStep();
      }
    }

  }



  setDatatoServerArray() {
    let result1 = this.PickTaskDetail.OPTM_WHSTASK_BTCHSER.find(e => e.OPTM_ITEMCODE == this.itemcodeValue && e.OPTM_BTCHSER == this.PT_Enter_ContBtchSer);
    if (result1 == undefined) {
      this.BtchSerDtlData.push({
        OPTM_TASKID: this.PickTaskList[this.index].OPTM_TASKID,
        OPTM_ITEMCODE: this.itemcodeValue,
        OPTM_BIN: this.PT_Enter_Location,
        OPTM_CONTAINER_ID: "",
        OPTM_QTY: this.pickQty,
        OPTM_BTCHSER: this.PT_Enter_ContBtchSer,
        OPTM_CREATEDBY: localStorage.getItem("UserId"),
        OPTM_STARTDATETIME: this.OPTM_STARTDATETIME.toLocaleDateString()
      });
    } else {
      this.ItemDetail.push({
        OPTM_TASKID: this.PickTaskList[this.index].OPTM_TASKID,
        OPTM_ITEMCODE: this.itemcodeValue,
        OPTM_ACTUAL_QTY: this.pickQty,
        OPTM_BTCHSER: this.PT_Enter_ContBtchSer,
        OPTM_RESID_ACT: localStorage.getItem("UserId"),
        OPTM_STARTDATETIME: this.OPTM_STARTDATETIME.toLocaleDateString()
      });
    }
  }

  checkIfQtyFullFiled() {
    if (this.PT_Enter_Location == "" || this.PT_Enter_Location == undefined) {
      this.PT_Enter_Location = this.locationValue;
    }
    if (this.PickListStatus == 2) { // Change picklist status 2(released) - 4(selected)
      this.updatePicklistStatus(2, 4);
    }
    if (localStorage.getItem("PickType") != this.translate.instant("Container_Picking")) {
      if (this.OPTM_Tracking == 'B') {
        let result = this.BtchNoneArray.findIndex(element => element.OPTM_ContBtchSer == this.PT_Enter_ContBtchSer);
        if (result == -1) {
          this.BtchNoneArray.push(new BtchNoneModel(this.PT_Enter_Location, this.PT_Enter_ContBtchSer, this.pickQty, this.ScannedContOrTote));
          this.setDatatoServerArray();
        } else {
          this.BtchNoneArray[result].OPTM_Qty = Number(this.pickQty) + Number(this.BtchNoneArray[result].OPTM_Qty);
          this.setDatatoServerArray();
          return;
        }
      } else if (this.OPTM_Tracking == 'N') {
        
        this.BtchNoneArray.push(new BtchNoneModel(this.PT_Enter_Location, this.PT_Enter_ContBtchSer, this.pickQty, this.ScannedContOrTote));
        this.ItemDetail.push({
          OPTM_TASKID: this.PickTaskList[this.index].OPTM_TASKID,
          OPTM_ITEMCODE: this.itemcodeValue,
          OPTM_ACTUAL_QTY: this.pickQty,
          OPTM_BTCHSER: "",
          OPTM_RESID_ACT: localStorage.getItem("UserId"),
          OPTM_STARTDATETIME: this.OPTM_STARTDATETIME.toLocaleDateString()
        });
      }
    }

    if (Number(this.totalpickQty) != Number(this.openQty)) {
      this.clearStepsFields();
      this.clearScanningFields();
      this.nextSteptoIterate();
      return;
    } else {
      if (this.stepIndex == this.CurrentTaskSteps.length - 1) {
        this.LastStep = this.currentStep;
        this.pickedAllDty = true;
      }
      this.toastr.success('', this.translate.instant("AllQtyPickedMsg"));
    }
  }

  clearScanningFields() {
    this.PT_Enter_Location = "";
    this.PT_ItemCode = "";
    this.PT_Enter_ContBtchSer = "";
    this.pickQty = undefined;
    this.ScannedContOrTote = "";
  }

  onSaveClick() {
    this.pickedAllDty = false;
    if (Number(this.totalpickQty) != Number(this.openQty)) {
      this.toastr.error('', this.translate.instant("QtyNotFullFillMsg"));
      return;
    }

    if (localStorage.getItem("PickType") != this.translate.instant("Container_Picking")) {
      if (this.currentStep == this.CONFIRM_CONTAINER_STEP && (this.ScannedContOrTote == "" || this.ScannedContOrTote == undefined)) {
        this.toastr.error('', this.translate.instant("CCBlankMsg"));
        return;
      }
    }

    if (this.completedTaskCount == this.totalPickTaskCount) {            
      //Srini. Call function to show Drop BIN and its confirmation
      if (this.PickListStatus == 6) {

      }
    }

    if (this.PickListStatus == 2) { // Change picklist status 2(released) - 4(selected)
      this.updatePicklistStatus(2, 4);
    }

    this.preparePickTaskData();
    this.clearStepsFields();
    // this.clearScanningFields();
    // this.nextStep();
    this.whsCode = this.PickTaskList[this.index].OPTM_SRC_WHSE;
    this.UserGrp = this.PickTaskList[this.index].OPTM_USER_GRP;
    this.onSubmitClick();
  }

  ItemDetail = [];
  onSubmitClick() {
    if (this.SubmitPickTaskData.length > 0) {
      var oSubmitPOLotsObj: any = {};
      oSubmitPOLotsObj.SubmitPickTaskData = [];
      oSubmitPOLotsObj.BtchSerDtlData = [];
      oSubmitPOLotsObj.ItemDetail = [];
      oSubmitPOLotsObj.SubmitPickTaskData = this.SubmitPickTaskData;
      if (this.BtchSerDtlData.length > 0) {
        oSubmitPOLotsObj.BtchSerDtlData = this.BtchSerDtlData;
      }
      if (this.ItemDetail.length > 0) {
        oSubmitPOLotsObj.ItemDetail = this.ItemDetail;
      }
      // this.showLoader = true;
      this.SubmitPickList(oSubmitPOLotsObj);
    } else {
      this.toastr.error('', this.translate.instant("NoRecord"));
    }
  }

  SubmitPickList(oSubmitPOLotsObj) {
    this.showLoader = true;
    this.picktaskService.SubmitPickList(oSubmitPOLotsObj).subscribe(
      (data: any) => {
        this.showLoader = false;
        this.SubmitPickTaskData = [];
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.showLookupLoader = false;
          if (data.OUTPUT[0].Successmsg == "SUCCESSFULLY") {
            this.countOfPickedTasks = this.countOfPickedTasks + 1;
            this.clearScanningFields();
            this.toastr.success('', this.translate.instant("PickSubmitMsg"));
            if (this.completedTaskCount == this.totalPickTaskCount) {              
              this.ShipmentList[0].OPTM_PICKLIST_CODE = "";
              this.GetNextPickList(this.ShipmentList[0].OPTM_PICKLIST_ID, false);
            } else {
              this.completedTaskCount = 0;
              this.index = 0;
              this.containercreated = false;
              this.clearFields();
              //Srini 28-Jun-2020. Commented and fetched in this call return
              //this.getPickTaskList(this.ShipmentList[0].OPTM_TASK_CODE, this.ShipmentList[0].OPTM_PICKLIST_ID);
              this.displayPickListData(data);
            }
          } else {
            this.toastr.error('', data[0].ErrorMsg);
          }
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

  getNextPick() {
    this.CancelPickList();
    this.GetNextPickList(this.ShipmentList[0].OPTM_PICKLIST_ID, false);
  }

  GetNextPickList(picklistID, currentPickListFlg: boolean) {
    this.showLoader = true;
    this.picktaskService.GetNextPickList(localStorage.getItem("PickTypeIndex"),  picklistID, currentPickListFlg).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data.OPTM_PICKLIST != undefined && data.OPTM_PICKLIST.length > 0) {
            this.completedTaskCount = 0;
            this.countOfPickedTasks = 0;
            this.index = 0;
            this.CreatedContOrTote = "";
            this.PlannedPickDropBin = data.OPTM_PICKLIST[0].OPTM_PICK_DROP_BIN;
            this.containercreated = false;
            this.clearFields();
            this.clearScanningFields();
            this.ShipmentList[0] = data.OPTM_PICKLIST[0];
            //No need to fetch Task Details again. They are available as PArt of the Picklist data
            this.displayPickListData(data);
            //this.getPickTaskList(data.OPTM_PICKLIST[0].OPTM_TASK_CODE, data.OPTM_PICKLIST[0].OPTM_PICKLIST_ID);
          } else {
            this.toastr.error('', this.translate.instant("NoNextPick"));
            this.onBackClick();
          }
        } else {
          this.toastr.error('', this.translate.instant("NoNextPick"));
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

  clearFields() {
    this.ContBtchSerArray = [];
    this.BtchNoneArray = [];
    this.ItemDetail = [];
    this.SubmitPickTaskData = [];
    this.BtchSerDtlData = [];
    this.PT_Enter_ContBtchSer = "";
    this.PT_Enter_Location = "";
    this.pickQty = undefined;
    this.totalpickQty = 0;
  }

  changeText(step) {
    if (step == this.LOCATION_STEP) {
      this.currentStepText = this.translate.instant("PT_Scan_To_Location");
    }
    else if (step == this.ITEM_STEP) {
      this.currentStepText = this.translate.instant("PT_ItemCode");
    }
    else if (step == this.CONT_BTCH_SER_STEP) {
      if (localStorage.getItem("PickType") == this.translate.instant("Container_Picking")) {
        this.currentStepText = this.translate.instant("ContainerCodePlaceholder");
      } else {
        this.currentStepText = this.translate.instant("PT_ScantoLotNumber");
      }
    }
    else if (step == this.QTY_STEP) {
      this.currentStepText = this.translate.instant("PT_EnterQty");
    }
    else if (step == this.CONFIRM_CONTAINER_STEP) {
      if (this.ShipmentList[0].OPTM_PICK_OPER == "2") {
        this.currentStepText = this.translate.instant("ScanCont");
      } else {
        this.currentStepText = this.translate.instant("ScanTote");
      }
    }
  }

  public onBackClick() {
    this.clearFields();
    if (localStorage.getItem("Param") == "Auto") {
      localStorage.setItem("PickType", "");
    }
    if (localStorage.getItem("From") == "shiplist") {
      this.router.navigate(['home/picking/picking-list'])
    } else {
      this.router.navigate(['home/picking/picking-item-list'])
    }
    // this.CancelPickList();
  }

  ngOnDestroy() {
    this.CancelPickList();
  }

  CancelPickList() {
    // if (this.PickListStatus == 4 || this.PickListStatus == 0) {
    //   this.commonservice.CancelPickListAPI(this.ShipmentList[0].OPTM_PICKLIST_ID, this.compId, this.translate);
    // }
    if (this.PickListStatus == 4 || this.PickListStatus == 0) {
      this.updatePicklistStatus(4, 2);
    }

    // if (this.ShipmentList[0].OPTM_PICKLIST_ID == "" || this.ShipmentList[0].OPTM_PICKLIST_ID == undefined) {
    //   return;
    // }
    // this.showLoader = true;
    // this.commonservice.CancelPickList(this.ShipmentList[0].OPTM_PICKLIST_ID, this.compId).subscribe(
    //   (data: any) => {
    //     this.showLoader = false;
    //     if (data != undefined) {
    //       if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
    //         this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
    //           this.translate.instant("CommonSessionExpireMsg"));
    //         return;
    //       }
    //     }
    //   },
    //   error => {
    //     this.showLoader = false;
    //     if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
    //       this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
    //     }
    //     else {
    //       this.toastr.error('', error);
    //     }
    //   }
    // );
  }


  preparePickTaskData(): any {
    if (this.PT_Enter_Location == "" || this.PT_Enter_Location == undefined) {
      this.PT_Enter_Location = this.locationValue;
    }

    let contValue = "", toteValue = "";
    if (this.ShipmentList[0].OPTM_PICK_OPER == "1") {
      toteValue = this.ScannedContOrTote
    } else if (this.ShipmentList[0].OPTM_PICK_OPER == "2") {
      contValue = this.ScannedContOrTote
    }

    if ((this.OPTM_Tracking == 'B' || this.OPTM_Tracking == 'N') && localStorage.getItem("PickType") != this.translate.instant("Container_Picking")) {
      for (var i = 0; i < this.BtchNoneArray.length; i++) {
        this.SubmitPickTaskData.push(new PickTaskModel(this.ShipmentList[0].OPTM_PICKLIST_ID, this.ShipmentList[0].OPTM_PICKLIST_CODE, this.PickTaskList[this.index].OPTM_TASKID, localStorage.getItem("whseId"), this.BtchNoneArray[i].OPTM_Location, this.BtchNoneArray[i].OPTM_ContBtchSer, this.BtchNoneArray[i].OPTM_Qty, contValue, localStorage.getItem("UserId"), "N", toteValue, this.containerAlreadyCreated, this.OPTM_STARTDATETIME.toLocaleDateString(),localStorage.getItem("PickTypeIndex"),this.UserGrp));
      }
    } else {
      for (var i = 0; i < this.ContBtchSerArray.length; i++) {
        let result = this.PickListSteps.find(element => element.OPTM_TASKID == this.PickTaskList[this.index].OPTM_TASKID);
        if (result == undefined) {
          if (localStorage.getItem("PickType") == this.translate.instant("Container_Picking")) {
            this.SubmitPickTaskData.push(new PickTaskModel(this.ShipmentList[0].OPTM_PICKLIST_ID,this.ShipmentList[0].OPTM_PICKLIST_CODE, this.PickTaskList[this.index].OPTM_TASKID, localStorage.getItem("whseId"), this.PT_Enter_Location, this.ContBtchSerArray[i], 1, contValue, localStorage.getItem("UserId"), "Y", toteValue, this.containerAlreadyCreated, this.OPTM_STARTDATETIME.toLocaleDateString(),localStorage.getItem("PickTypeIndex"),this.UserGrp));
          } else {
            this.SubmitPickTaskData.push(new PickTaskModel(this.ShipmentList[0].OPTM_PICKLIST_ID,this.ShipmentList[0].OPTM_PICKLIST_CODE, this.PickTaskList[this.index].OPTM_TASKID, localStorage.getItem("whseId"), this.PT_Enter_Location, this.ContBtchSerArray[i], 1, contValue, localStorage.getItem("UserId"), "N", toteValue, this.containerAlreadyCreated, this.OPTM_STARTDATETIME.toLocaleDateString(),localStorage.getItem("PickTypeIndex"),this.UserGrp));
          }
        } else {
          this.toastr.error('', this.translate.instant("DataAlreadySaved"));
        }
      }
    }
  }

  ShowBatchSerials(): any {
    if (localStorage.getItem("PickType") == this.translate.instant("Container_Picking")) {
      this.showbtchser = [];
      for (var i = 0; i < this.PickTaskDetail.OPTM_WHSTASK_DTL.length; i++) {
        if (this.PickTaskDetail.OPTM_WHSTASK_DTL[i].OPTM_TASKID == this.pickTaskName && this.PickTaskDetail.OPTM_WHSTASK_DTL[i].OPTM_BTCHSER == "") {
          this.PickTaskDetail.OPTM_WHSTASK_DTL[i].OPTM_PLANNED_QTY = Number(this.PickTaskDetail.OPTM_WHSTASK_DTL[i].OPTM_PLANNED_QTY).toFixed(Number(localStorage.getItem("DecimalPrecision")));
          this.showbtchser.push(this.PickTaskDetail.OPTM_WHSTASK_DTL[i]);
        }
      }
      if (this.showbtchser.length > 0) {
        this.hideLookup = false;
        this.serviceData = this.showbtchser;
        this.lookupfor = "ContainerList";
      } else {
        this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
      }

    } else {
      this.showbtchser = [];
      for (var i = 0; i < this.PickTaskDetail.OPTM_WHSTASK_BTCHSER.length; i++) {
        if (this.PickTaskDetail.OPTM_WHSTASK_BTCHSER[i].OPTM_TASKID == this.pickTaskName) {
          this.PickTaskDetail.OPTM_WHSTASK_BTCHSER[i].OPTM_PLANNED_QTY = Number(this.PickTaskDetail.OPTM_WHSTASK_BTCHSER[i].OPTM_PLANNED_QTY).toFixed(Number(localStorage.getItem("DecimalPrecision")));
          this.showbtchser.push(this.PickTaskDetail.OPTM_WHSTASK_BTCHSER[i]);
        }
      }
      if (this.showbtchser.length > 0) {
        this.hideLookup = false;
        this.serviceData = this.showbtchser;
        this.lookupfor = "PickItemBtchSer";
      } else {
        this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
      }
    }
  }

  showPickTaskList(row) {
    this.dialogOpened = true;
  }

  close_kendo_dialog() {
    this.dialogOpened = false;
  }

  PickListStatus: number = 0;
  updatePicklistStatus(fromStatus, toStatus) {
    this.picktaskService.UpdatePickListStatusBasedOnSelected(toStatus, this.ShipmentList[0].OPTM_PICKLIST_ID, fromStatus).subscribe(
      (data: any) => {
        // this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data[0].Successmsg == "SUCCESSFULLY") {
            this.PickListStatus = 4;
          } else {
            // this.toastr.error('', "Picklist already selected by another user.");
            // this.onBackClick();
          }
        } else {
          // this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
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
