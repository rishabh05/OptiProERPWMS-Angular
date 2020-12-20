import { Component, OnInit, ViewChild } from '@angular/core';
import { Commonservice } from '../services/commonservice.service';
import { Router } from '../../../node_modules/@angular/router';
import { ToastrService } from '../../../node_modules/ngx-toastr';
import { TranslateService, LangChangeEvent } from '../../../node_modules/@ngx-translate/core';

@Component({
  selector: 'app-shp-loading',
  templateUrl: './shp-loading.component.html',
  styleUrls: ['./shp-loading.component.scss']
})
export class ShpLoadingComponent implements OnInit {

  currentStep = 1;
  ScanContainer: string;
  ScanLoadLocation: string;
  PT_ShipmentId: string;
  shipmentCode: string;
  shipmentID: number = 0
  shipmentStatus: string;
  shpStatusVal: number = 0
  LoadLocation: string;
  OPTM_WHSCODE: string;
  OPTM_BINCODE: string;
  LoadContainersList: any[] = [];  
  LastStep = 2;
  showLoader: boolean = false;
  FirstCont: any;
  ShpLoadingSteps: any[] = [];
  LoadedcontainerData: any[] = [];
  stepIndex = 0;
  maxStep = 0;
  dialogOpened = false;
  unloadCont: boolean = false;
  showLookup: boolean = false;
  serviceData: any = [];
  lookupfor: string = '';
  dialogTitle: string = '';
  disableSubmit: boolean = true;

  @ViewChild('focusOnCont') focusOnCont;
  @ViewChild('focusOnDockDoor') focusOnDockDoor;

  constructor(private commonservice: Commonservice, private router: Router, private toastr: ToastrService, private translate: TranslateService) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  ngOnInit() {
    this.commonservice.GetSelectedSteps("Shp_Loading");
    setTimeout(() => {
      this.setShpLoadingSteps();
    }, 1000)
    this.showFields = false;
  }

  setShpLoadingSteps() {
    this.ShpLoadingSteps = JSON.parse(sessionStorage.getItem("ShpLoadingSteps"));
    if (this.ShpLoadingSteps != undefined && this.ShpLoadingSteps.length > 0) {
      this.currentStep = this.getStepNo(this.ShpLoadingSteps[0].OPTM_STEP_CODE);
      this.maxStep = this.ShpLoadingSteps.length;
      this.changeText(this.currentStep)
    }
  }

  getStepNo(OPTM_STEP_CODE): any {
    switch (OPTM_STEP_CODE) {
      case "Confirm_Container_To_Load":
        return 1;
      case "Confirm_Location_Where_Loaded":
        return 2;
      default:
        return 1;
    }
  }

  getLookupValue(event) {
    if (event.CLOSED != undefined && event.CLOSED) {
      this.showLookup = false;
      return;
    }
    if (this.lookupfor == "LoadedContList") {
      this.showLookup = false;
      return;
    }
  }

  onShipmentIDChange() {
    if (this.shipmentCode == "" || this.shipmentCode == undefined) {
      return;
    }
    this.showLoader = true;
    this.commonservice.onShipmentIDChange(this.shipmentCode).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data.OPTM_SHPMNT_HDR.length > 0) {
            this.clearFields();
            this.clearDataAfterSubmit();
            this.shipmentCode = data.OPTM_SHPMNT_HDR[0].OPTM_SHIPMENT_CODE;
            this.PT_ShipmentId = data.OPTM_SHPMNT_HDR[0].OPTM_SHIPMENTID;
            this.LoadLocation = data.OPTM_SHPMNT_HDR[0].OPTM_DOCKDOORID;
            this.OPTM_WHSCODE = data.OPTM_SHPMNT_HDR[0].OPTM_WHSCODE;
            this.OPTM_BINCODE = data.OPTM_SHPMNT_HDR[0].OPTM_BINCODE;
            this.shipmentID = data.OPTM_SHPMNT_HDR[0].OPTM_SHIPMENTID;            
            this.LoadContainersList = data.OPTM_CONT_HDR;
            //Below is the array that saves container data loaded on truck
            this.LoadedcontainerData = data.LOADED_CONT;
            this.FirstCont = this.LoadContainersList[0];
            if(this.LoadContainersList.length == 0 && this.LoadedcontainerData.length == 0){
              this.dialogTitle = this.translate.instant("ScanContAssignShp");
              this.dialogOpened = true;
            } 
            this.setShipmentStatus(data.OPTM_SHPMNT_HDR[0].OPTM_STATUS);                      
          } else {
            this.toastr.error('', this.translate.instant("InvalidShipmentCode"));
            this.clearFields();
          }
        } else {
          this.toastr.error('', this.translate.instant("InvalidShipmentCode"));
          this.clearFields();
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

  setShipmentStatus(shpStatusVal: number) {
    if (shpStatusVal == 9) {
      this.shipmentStatus = this.translate.instant("Loaded");
      this.showFields = false;
    } else if (shpStatusVal == 15 || shpStatusVal == 16 || shpStatusVal == 7){
      if (shpStatusVal == 7) {
        this.shipmentStatus = this.translate.instant("Staged");
      } else if (shpStatusVal == 15) {
        this.shipmentStatus = this.translate.instant("Loading");
      } else if (shpStatusVal == 16) {
        this.shipmentStatus = this.translate.instant("Unloaded");
      }
      this.showFields = true;
    } 

  }
  
  onLoadedContClick() {
    this.showLookup = true;
    this.lookupfor = "LoadedContList"
    this.serviceData = this.LoadedcontainerData
    
  }

  onUnloadContainerClick() {
    this.dialogTitle = this.translate.instant("ScanContUnload");
    this.unloadCont = true;
    this.dialogOpened = true;
  }

  OnSelectContainer() {
    if(this.containerCode == "" || this.containerCode == undefined || this.containerCode == null){
      this.toastr.error('', this.translate.instant("ContainerCodeBlankMsg"))
      return;
    }
    if (this.unloadCont) {
      this.onConfirmClick();
      this.UnloadContainer();
      this.containerCode = '';
    } else {
      //this.generateContainer();
    }
  }

  UnloadContainer() {   

    let index = this.LoadedcontainerData.findIndex(element => element.OPTM_CONTCODE == this.containerCode)
    if (index > -1) {
      this.ResetAfterSubmitOrUnload();
      if (this.LoadedcontainerData[index].DB_FLG == 0) {
        // Record is still not updated to database. Remove from local collection
        this.LoadedcontainerData.splice(index, 1);
        let result = this.LoadedcontainerData.filter(element => element.DB_FLG == 0)
        if (result == undefined || result == null) {
          //Not found any containers to save.
          this.disableSubmit = true;
        }
        return;
      } else if (this.LoadedcontainerData[index].DB_FLG == 1) {
        //Container being deleted from Database
        //If there are unsaved containers, let user save the loaded containers before Unloading one
        let result = this.LoadedcontainerData.filter(element => element.DB_FLG == 0)
        if (result != undefined && result.length > 0) {
          this.toastr.error('', this.translate.instant("SaveUnsavedData"));
          this.showFields = false;      
          this.disableSubmit = false;
          return;
        }
      }
    } else {
      this.toastr.error('', this.translate.instant("ContainerNotLoaded"));
      return;
    }
    //Container is found and has been saved to database earlier. Delete from Db
    this.showLoader = true;
    this.commonservice.UnloadContainer(this.shipmentCode, this.containerCode).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.setShipmentStatus(data.OPTM_SHPMNT_HDR[0].OPTM_STATUS);
          if (data.OPTM_CONT_HDR.length > 0 || data.LOADED_CONT.length > 0) {
            this.toastr.success('', this.translate.instant("ContUnloaded"));
            this.LoadContainersList = data.OPTM_CONT_HDR;
            //Below is the array that saves container data loaded on truck
            this.LoadedcontainerData = data.LOADED_CONT;
            this.disableSubmit = true;
            this.FirstCont = this.LoadContainersList[0];
          } else {
            this.toastr.error('', data[0].ErrorMsg);
          }
        } else {
          this.toastr.error('', this.translate.instant("InvalidContCode"));
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
    this.PT_ShipmentId = "";
    this.shipmentCode = "";
    this.shipmentStatus = '';
    this.LoadLocation = "";
    this.LoadContainersList = [];
    this.FirstCont = {OPTM_CONTCODE: ''};
  }

  onContainerChange() {
    if (this.ScanContainer == "" || this.ScanContainer == undefined) {
      return;
    }
    let result = this.LoadContainersList.find(element => element.OPTM_CONTCODE == this.ScanContainer)
    if (result != undefined) {
      if (this.LoadedcontainerData != undefined && this.LoadedcontainerData.length > 0) {
        let result = this.LoadedcontainerData.find(element => element.OPTM_CONTCODE == this.ScanContainer)
        if (result == undefined) {
          if (this.iterateSteps) {
            this.nextSteptoIterate();
          } else {
            this.nextStep();
          }
        } else {
          this.toastr.error('', this.translate.instant("DataAlreadySaved"));
          this.ScanContainer = "";
        }
      } else {
        if (this.iterateSteps) {
          this.nextSteptoIterate();
        } else {
          this.nextStep();
        }
      }
    } else {
      let result = this.LoadedcontainerData.find(element => element.OPTM_CONTCODE == this.ScanContainer)
      if (result != undefined) {
        this.toastr.error('', this.translate.instant("DataAlreadySaved"));
      } else {
        this.toastr.error('', this.translate.instant("InvalidContainerCode"));
      }
      this.ScanContainer = "";
    }
  }

  setfocus() {
    if (this.currentStep == 1) {
      setTimeout(() => {
        this.focusOnCont.nativeElement.focus();
      }, 500)
    } else if (this.currentStep == 2) {
      setTimeout(() => {
        this.focusOnDockDoor.nativeElement.focus();
      }, 500)
    }
  }

  onLoadLocationChange() {
    if (this.ScanLoadLocation == "" || this.ScanLoadLocation == undefined) {
      return;
    }
    if (this.ScanLoadLocation === this.LoadLocation) {
      this.addScannedContainer(this.shipmentCode, this.ScanContainer);
      
    } else {
      this.toastr.error('', this.translate.instant("InvalidDD"));
      this.ScanLoadLocation = "";
    }
  }

  showFields: boolean = true;
  addScannedContainer(OPTM_SHIPMENT_CODE, OPTM_CONTCODE) {
    this.LoadedcontainerData.push({
      CompanyDBId: sessionStorage.getItem("CompID"),
      OPTM_SHIPMENT_CODE: OPTM_SHIPMENT_CODE,
      OPTM_WHSCODE: sessionStorage.getItem("whseId"),
      OPTM_CONTCODE: OPTM_CONTCODE,
      DB_FLG: 0
    });
    this.disableSubmit = false;
    this.toastr.success('', this.translate.instant("contSaved"));
    this.ScanContainer = "";
    this.ScanLoadLocation = "";
    let result = this.LoadedcontainerData.filter(element => element.DB_FLG == 0)
    if (result != undefined) {
      if (this.LoadContainersList.length == result.length) {
        this.showFields = false;
        this.toastr.success('', this.translate.instant("AllPickedCont"));
      } else {
        this.stepIndex = -1;
        this.nextSteptoIterate();
      }
    }   
  }

  onSubmitClick() {
    if (this.LoadedcontainerData.length <= 0) {
      this.toastr.error('', this.translate.instant("NoContSubmit"));
      return;
    }
    this.showLoader = true;
    this.commonservice.SaveLoadTaskInformation(this.LoadedcontainerData).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data.OUTPUT[0].Successmsg == "SUCCESSFULLY") {
            this.toastr.success('', this.translate.instant("shploadedMsg"));
            this.LoadContainersList = [];
          } else {
            this.toastr.error('', data.OUTPUT[0].ErrorMsg);
          }
          this.LoadContainersList = data.OPTM_CONT_HDR;
          this.setShipmentStatus(data.OPTM_SHPMNT_HDR[0].OPTM_STATUS);
          if (this.LoadContainersList.length > 0) {
            //Below is the array that saves container data loaded on truck
            this.LoadedcontainerData = data.LOADED_CONT;
            this.FirstCont = this.LoadContainersList[0];            
            this.ResetAfterSubmitOrUnload();
          } else {
            this.clearDataAfterSubmit();
          }
        } else {
          this.toastr.error('', this.translate.instant("InvalidShipmentCode"));
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

  clearDataAfterSubmit() {
    this.LoadedcontainerData = [];
    this.LoadContainersList = [];
    this.PT_ShipmentId = "";
    this.shipmentCode = "";
    this.shipmentStatus = '';
    this.LoadLocation = "";
    this.currentStep = 1;
    this.stepIndex = 0;
  }

  ResetAfterSubmitOrUnload() {
    this.currentStep = 1;
    this.stepIndex = 0;
    this.showFields = true;
  }

  iterateSteps = false;
  nextSteptoIterate() {
    this.iterateSteps = true;
    if (this.stepIndex < this.maxStep - 1) {
      this.stepIndex = this.stepIndex + 1;
      if (this.stepIndex >= 0 && this.stepIndex < this.ShpLoadingSteps.length) {
        if (this.ShpLoadingSteps[this.stepIndex].OPTM_ITERATE == "Y") {
          this.currentStep = this.getStepNo(this.ShpLoadingSteps[this.stepIndex].OPTM_STEP_CODE);
          if (this.stepIndex == this.ShpLoadingSteps.length - 1) {
            this.LastStep = this.currentStep;
          }
        } else {
          if (this.stepIndex == this.ShpLoadingSteps.length - 1) {
            this.LastStep = this.currentStep;
            this.addScannedContainer(this.shipmentCode, this.ScanContainer);
          } else {
            this.nextSteptoIterate();
          }
        }
      }
      this.setfocus();
      // this.changeText(this.currentStep)
    }
  }

  checkIfQtyFullFiled() {

  }

  nextStep() {
    if (this.stepIndex < this.maxStep) {
      this.stepIndex = this.stepIndex + 1;
      if (this.stepIndex >= 0 && this.stepIndex < this.ShpLoadingSteps.length) {
        this.currentStep = this.getStepNo(this.ShpLoadingSteps[this.stepIndex].OPTM_STEP_CODE);
        if (this.stepIndex == this.ShpLoadingSteps.length - 1) {
          this.LastStep = this.currentStep;
        }
      }
      this.setfocus();
      this.changeText(this.currentStep)
    }
  }

  currentStepText = "";
  changeText(step) {
    if (step == 1) {
      this.currentStepText = this.translate.instant("ScanContainer");
    }
    else if (step == 2) {
      this.currentStepText = this.translate.instant("ScanLoadLoc");
    }
  }

  prevStep() {
    this.stepIndex = this.stepIndex - 1;
    if (this.stepIndex >= 0 && this.stepIndex < this.ShpLoadingSteps.length) {
      this.currentStep = this.getStepNo(this.ShpLoadingSteps[this.stepIndex].OPTM_STEP_CODE);
    }
    if (this.currentStep >= 1) {
      this.changeText(this.currentStep)
    }
  }

  OnCancelClick() {
    this.router.navigate(['home/dashboard']);
  }

  onConfirmClick(){
    if(this.containerCode == "" || this.containerCode == undefined || this.containerCode == null){
      this.toastr.error('', this.translate.instant("ContainerCodeBlankMsg"))
      return;
    }
    this.close_kendo_dialog();
  }

  close_kendo_dialog() {
    this.dialogOpened = false;
    this.unloadCont = false;
  }


  containerCode: string;
  /*
  generateContainer() {    
    //this.PrepareModelAndCreateCont(this.containerCode);
  }

  PrepareModelAndCreateCont(containerCode: any) {
    var oSaveModel: any = {};
    oSaveModel.HeaderTableBindingData = [];
    oSaveModel.OtherItemsDTL = [];
    oSaveModel.OtherBtchSerDTL = [];

    //Push data of header table into BatchSerial model
    oSaveModel.HeaderTableBindingData.push({
      OPTM_SHIPMENTID: this.PT_ShipmentId,
      OPTM_SONO: "",
      OPTM_CONTAINERID: "",
      OPTM_CONTTYPE: "Manual",
      OPTM_CONTAINERCODE: "" + containerCode,
      OPTM_WEIGHT: "",
      OPTM_AUTOCLOSE_ONFULL: "Y",
      OPTM_AUTORULEID: "Manual",
      OPTM_WHSE: this.OPTM_WHSCODE,
      OPTM_BIN: this.OPTM_BINCODE,
      OPTM_CREATEDBY: sessionStorage.getItem("UserId"),
      OPTM_MODIFIEDBY: '',
      Length: length,
      Width: "",
      Height: "",
      ItemCode: "",
      NoOfPacks: "1",
      OPTM_TASKID: 0, //changed
      CompanyDBId: sessionStorage.getItem("CompID"),
      Username: sessionStorage.getItem("UserId"),
      UserId: sessionStorage.getItem("UserId"),
      GUID: sessionStorage.getItem("GUID"),
      Action: "N",
      OPTM_PARENTCODE: "",
      OPTM_GROUP_CODE: 0,
      OPTM_CREATEMODE: "3",
      OPTM_PURPOSE: "Y",
      OPTM_FUNCTION: "Shipping",
      OPTM_OBJECT: "Container",
      OPTM_WONUMBER: 0,
      OPTM_TASKHDID: 0,
      OPTM_OPERATION: "",
      OPTM_QUANTITY: 1,
      OPTM_SOURCE: 4,
      OPTM_ParentContainerType: "",
      OPTM_ParentPerQty: "",
      IsWIPCont: false
    });

    oSaveModel.OtherItemsDTL.push({
      OPTM_ITEMCODE: "",
      OPTM_QUANTITY: "",
      OPTM_CONTAINER: "",
      OPTM_AVLQUANTITY: 0,
      OPTM_INVQUANTITY: 0,
      OPTM_BIN: '',
      OPTM_CONTAINERID: "",
      OPTM_TRACKING: "",
      OPTM_WEIGHT: ""
    });

    oSaveModel.OtherBtchSerDTL.push({
      OPTM_BTCHSER: "",
      OPTM_QUANTITY: "",
      OPTM_ITEMCODE: ""
    });
    
    this.commonservice.CreateContainerForPacking(oSaveModel).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data.OUTPUT[0].RESULT == "Data Saved") {
            this.toastr.success('', this.translate.instant("ContainerCreatedSuccessMsg"));
            this.containerCode = "";
            this.onShipmentIDChange();
          } else {
            this.toastr.error('', data.OUTPUT[0].RESULT);
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
  }*/

}
