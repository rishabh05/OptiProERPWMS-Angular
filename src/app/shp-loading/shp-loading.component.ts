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
  LoadLocation: string;
  LoadContainersList: any[] = [];
  LastStep = 2;
  showLoader: boolean = false;
  FirstCont: any;
  PickListSteps: any[] = [];
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
    this.commonservice.GetSelectedSteps("Loading");
    setTimeout(() => {
      this.setPickingSteps();
    }, 1000)
    
  }

  setPickingSteps() {
    this.PickListSteps = JSON.parse(localStorage.getItem("PickListSteps"));
    if (this.PickListSteps != undefined && this.PickListSteps.length > 0) {
      this.currentStep = this.getStepNo(this.PickListSteps[0].OPTM_STEP_CODE);
      this.maxStep = this.PickListSteps.length;
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

  onShipmentIDChange() {
    if (this.PT_ShipmentId == "" || this.PT_ShipmentId == undefined) {
      return;
    }
    this.showLoader = true;
    this.commonservice.onShipmentIDChange(this.PT_ShipmentId).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data.OPTM_SHPMNT_HDR.length > 0) {
            this.PT_ShipmentId = data.OPTM_SHPMNT_HDR[0].OPTM_SHIPMENT_CODE;
            this.LoadLocation = "D1";//data.OPTM_SHPMNT_HDR[0].OPTM_DOCKDOORID;
            this.LoadContainersList = data.OPTM_CONT_HDR;
            this.FirstCont = this.LoadContainersList[0];
          } else {
            this.toastr.error('', this.translate.instant("InvalidShipmentCode"));
            this.PT_ShipmentId = "";
            this.LoadLocation = "";
            this.LoadContainersList = [];
          }
        } else {
          this.toastr.error('', this.translate.instant("InvalidShipmentCode"));
          this.PT_ShipmentId = "";
          this.LoadLocation = "";
          this.LoadContainersList = [];
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

  onContainerChange() {
    if (this.ScanContainer == "" || this.ScanContainer == undefined) {
      return;
    }
    let result = this.LoadContainersList.find(element => element.OPTM_CONTCODE == this.ScanContainer)
    if (result != undefined) {
      if (this.containerData.length > 0) {
        let result = this.containerData.find(element => element.OPTM_CONTCODE == this.ScanContainer)
        if (result == undefined) {
          this.nextStep();
        } else {
          this.toastr.error('', this.translate.instant("DataAlreadySaved"));
          this.ScanContainer = "";
        }
      } else {
        this.nextStep();
      }
    } else {
      this.toastr.error('', this.translate.instant("InvalidContainerCode"));
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
      this.addScannedContainer(this.PT_ShipmentId, this.ScanContainer);
      this.prevStep();
      this.toastr.success('', this.translate.instant("contSaved"));
      this.ScanContainer = "";
      this.ScanLoadLocation = "";
      if (this.LoadContainersList.length == this.containerData.length) {
        this.toastr.success('', this.translate.instant("AllPickedCont"));
      }
    } else {
      this.toastr.error('', this.translate.instant("InvalidDD"));
      this.ScanLoadLocation = "";
    }
  }

  containerData: any[] = [];
  addScannedContainer(OPTM_SHIPMENT_CODE, OPTM_CONTCODE) {
    this.containerData.push({
      CompanyDBId: localStorage.getItem("CompID"),
      OPTM_SHIPMENT_CODE: OPTM_SHIPMENT_CODE,
      OPTM_CONTCODE: OPTM_CONTCODE
    });
  }

  onSubmitClick() {
    if (this.containerData.length <= 0) {
      this.toastr.error('', this.translate.instant("NoContSubmit"));
      return;
    } else if (this.LoadContainersList.length != this.containerData.length) {
      this.toastr.error('', this.translate.instant("AllContNotPicked"));
    }
    this.showLoader = true;
    this.commonservice.SaveLoadTaskInformation(this.containerData).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data[0].Successmsg == "SUCCESSFULLY") {
            this.toastr.success('', this.translate.instant("shploadedMsg"));
          } else {
            this.toastr.error('', data[0].ErrorMsg);
          }
          this.clearDataAfterSubmit();
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
    this.containerData = [];
    this.LoadContainersList = [];
    this.PT_ShipmentId = "";
    this.LoadLocation = "";
  }

  stepIndex = 0;
  maxStep = 0;
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
      // this.changeText(this.currentStep)
    }
  }

  prevStep() {
    this.stepIndex = this.stepIndex - 1;
    if (this.stepIndex >= 0 && this.stepIndex < this.PickListSteps.length) {
      this.currentStep = this.getStepNo(this.PickListSteps[this.stepIndex].OPTM_STEP_CODE);
    }
    if (this.currentStep >= 1) {
      // this.changeText(this.currentStep)
    }
  }

  OnCancelClick() {
    this.router.navigate(['home/dashboard']);
  }
}
