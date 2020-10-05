import { Component, OnInit, ViewChild } from '@angular/core';
import { Commonservice } from '../services/commonservice.service';
import { Router } from '../../../node_modules/@angular/router';
import { LangChangeEvent, TranslateService } from '../../../node_modules/@ngx-translate/core';
import { ToastrService } from '../../../node_modules/ngx-toastr';
import { PickTaskService } from '../services/picktask.service';

@Component({
  selector: 'app-packing',
  templateUrl: './packing.component.html',
  styleUrls: ['./packing.component.scss']
})
export class PackingComponent implements OnInit {
  
  ToteValue: String = "";
  currentStep = 1;
  ScanContainer: string;
  BinCodeValue: string;
  ShipmentId: string;
  ShipmentCode: string;
  ContainerCode: string;
  LastStep = 2;
  showLoader: boolean = false;
  FirstCont: any;
  PickListSteps: any[] = [];
  stepIndex = 0;
  maxStep = 0;
  dialogOpened = false;

  @ViewChild('focusOnItemCode') focusOnItemCode;
  @ViewChild('focusOnBtchSer') focusOnBtchSer;
  @ViewChild('focusOnCont') focusOnCont;
  @ViewChild('focusOnQty') focusOnQty;

  constructor(private commonservice: Commonservice, private router: Router, private toastr: ToastrService, private translate: TranslateService, private packservice: PickTaskService) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  ngOnInit() {
    this.commonservice.GetSelectedSteps("Packing");
    setTimeout(() => {
      this.setPickingSteps();
    }, 1000)
    this.showFields = true;
  }

  setPickingSteps() {
    this.PickListSteps = JSON.parse(localStorage.getItem("PickListSteps"));
    if (this.PickListSteps != undefined && this.PickListSteps.length > 0) {
      this.currentStep = this.getStepNo(this.PickListSteps[0].OPTM_STEP_CODE);
      this.maxStep = this.PickListSteps.length;
      this.changeText(this.currentStep)
    }
  }

  getStepNo(OPTM_STEP_CODE): any {
    switch (OPTM_STEP_CODE) {
      case "Confirm_Item_Picked":
        return 1;
      case "Confirm_Batch_Picked":
        return 2;
      case "Confirm_Picked_Quantity":
        return 3;
      case "Confirm_Picked_To_Container":
        return 4;
      default:
        return 1;
    }
  }

  clearFields() {
    this.ShipmentId = "";
  }

  onContainerChange() {
    if (this.ContainerCode == "" || this.ContainerCode == undefined) {
      return;
    }
    let result = undefined//this.LoadContainersList.find(element => element.OPTM_CONTCODE == this.ScanContainer)
    if (result != undefined) {
     
    } else {
      this.toastr.error('', this.translate.instant("InvalidContainerCode"));
      this.ScanContainer = "";
    }
  }

  setfocus() {
    if (this.currentStep == 1) {
      setTimeout(() => {
        this.focusOnItemCode.nativeElement.focus();
      }, 500)
    } else if (this.currentStep == 2) {
      setTimeout(() => {
        this.focusOnBtchSer.nativeElement.focus();
      }, 500)
    } else if (this.currentStep == 3) {
      setTimeout(() => {
        this.focusOnQty.nativeElement.focus();
      }, 500)
    } else if (this.currentStep == 4) {
      setTimeout(() => {
        this.focusOnCont.nativeElement.focus();
      }, 500)
    }
  }

  showFields: boolean = true;
  // addScannedContainer(OPTM_SHIPMENT_CODE, OPTM_CONTCODE) {
  //   this.containerData.push({
  //     CompanyDBId: sessionStorage.getItem("CompID"),
  //     OPTM_SHIPMENT_CODE: OPTM_SHIPMENT_CODE,
  //     OPTM_CONTCODE: OPTM_CONTCODE
  //   });
  //   this.toastr.success('', this.translate.instant("contSaved"));
  //   this.ScanContainer = "";
  //   this.ScanLoadLocation = "";
  //   if (this.LoadContainersList.length == this.containerData.length) {
  //     this.showFields = false
  //     this.toastr.success('', this.translate.instant("AllPickedCont"));
  //   } else {
  //     this.stepIndex = -1;
  //     this.nextSteptoIterate();
  //   }
  // }

  onSubmitClick() {
    this.SavePackingContainerAndUpdateShipment();
  }

  clearDataAfterSubmit() {
    this.ShipmentId = "";
    this.currentStep = 1;
    this.stepIndex = 0;
  }

  iterateSteps = false;
  nextSteptoIterate() {
    this.iterateSteps = true;
    if (this.stepIndex < this.maxStep - 1) {
      this.stepIndex = this.stepIndex + 1;
      if (this.stepIndex >= 0 && this.stepIndex < this.PickListSteps.length) {
        if (this.PickListSteps[this.stepIndex].OPTM_ITERATE == "Y") {
          this.currentStep = this.getStepNo(this.PickListSteps[this.stepIndex].OPTM_STEP_CODE);
          if (this.stepIndex == this.PickListSteps.length - 1) {
            this.LastStep = this.currentStep;
          }
        } else {
          if (this.stepIndex == this.PickListSteps.length - 1) {
            this.LastStep = this.currentStep;
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
      if (this.stepIndex >= 0 && this.stepIndex < this.PickListSteps.length) {
        this.currentStep = this.getStepNo(this.PickListSteps[this.stepIndex].OPTM_STEP_CODE);
        if (this.stepIndex == this.PickListSteps.length - 1) {
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
      this.currentStepText = this.translate.instant("Ph_ScanItemCode");
    } else if (step == 2) {
      this.currentStepText = this.translate.instant("ScanBatch");
    } else if (step == 3) {
      this.currentStepText = this.translate.instant("EnterQty");
    } else if (step == 4) {
      this.currentStepText = this.translate.instant("ScanCont");
    }
  }

  prevStep() {
    this.stepIndex = this.stepIndex - 1;
    if (this.stepIndex >= 0 && this.stepIndex < this.PickListSteps.length) {
      this.currentStep = this.getStepNo(this.PickListSteps[this.stepIndex].OPTM_STEP_CODE);
    }
    if (this.currentStep >= 1) {
      this.changeText(this.currentStep)
    }
  }

  OnCancelClick() {
    this.router.navigate(['home/dashboard']);
  }

  GetDroppedToteList() {
    if(this.BinCodeValue == "" || this.BinCodeValue == undefined){
      this.toastr.error('', this.translate.instant("Please select bin first."));
      return;
    }

    this.packservice.GetDroppedToteList(this.BinCodeValue).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if(data.length > 0){
            this.showLookup = true;
            this.serviceData = data;
            this.lookupfor = "ToteList";
          }else{
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
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

  GetToteShipments() {
    if (this.ToteValue == "" || this.ToteValue == undefined) {
      this.toastr.error('', this.translate.instant("ToteBlankMsg"))
      return;
    }

    this.packservice.GetToteShipments(this.ToteValue).subscribe(
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
  }

  GetToteItemBtchSer() {
    this.packservice.GetToteItemBtchSer("", "", "").subscribe(
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
  }

  ValidateSelectedToteForPacking() {
    this.packservice.ValidateSelectedToteForPacking(this.ToteValue).subscribe(
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
  }

  ValidateSelectedShipmentForPacking() {
    this.packservice.ValidateSelectedShipmentForPacking(this.ToteValue, this.ShipmentCode).subscribe(
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
  }

  showLookup = false;
  serviceData = [];
  lookupfor = "";
  GetPackingBinsForWarehouse(){
    this.packservice.GetPackingBinsForWarehouse().subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if(data.length > 0){
            this.showLookup = true;
            this.serviceData = data;
            this.lookupfor = "PackBinList";
          }else{
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
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

  getLookupValue(event){
    if (this.lookupfor == "PackBinList"){
      this.BinCodeValue = event.OPTM_SORT_PACK_BIN;
    }else if(this.lookupfor == "ToteList"){
      this.ToteValue = event.OPTM_CODE;
    }
  }

  GetToteShipmentItems() {
    this.packservice.GetToteShipmentItems(this.ToteValue, this.ShipmentCode).subscribe(
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
  }

  SavePackingContainerAndUpdateShipment() {
    var packingContainerDtl = this.PrearePackingContModel("", "", "");
    this.packservice.SavePackingContainerAndUpdateShipment(packingContainerDtl).subscribe(
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
  }


  PrearePackingContModel(ItemCode, BtchSer, Quantity, ) {
    var packingContainerDtl: any = {};
    packingContainerDtl.BtchSerDtlData = [];
    packingContainerDtl.BtchSerDtlData.push({
      COMPANYDBNAME: sessionStorage.getItem("CompID"),
      TOTE_NUMBER: this.ToteValue,
      OPTM_SHIPMENTID: this.ShipmentId,
      OPTM_CONTAINERCODE: this.ContainerCode,
      OPTM_ITEMCODE: ItemCode,
      OPTM_BTCHSER: BtchSer,
      OPTM_QTY: Quantity,
      OPTM_WHSE: sessionStorage.getItem("whseId"),
      OPTM_BIN: "",
      OPTM_CREATEDBY: sessionStorage.getItem("UserId"),
      Source_Obj: "Packing" //"PickList', 'Packing', 'Shipment'
    })
    return packingContainerDtl;
  }

  onSaveClick() {

  }
}
