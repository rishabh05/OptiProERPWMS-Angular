import { Component, OnInit, ViewChild } from '@angular/core';
import { Commonservice } from '../../services/commonservice.service';
import { PickTaskService } from '../../services/picktask.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'app-drop',
  templateUrl: './drop.component.html',
  styleUrls: ['./drop.component.scss']
})
export class DropComponent implements OnInit {

  DropOptionArray = [];
  showLoader: boolean = false;
  DropOption = "";
  dropLocation: string = "";
  dropValue: string = "";
  processStep: boolean = true;
  selectedDropOption: string = "";
  currentStepText = "";
  DropSteps: any[] = [];
  currentStep = 1;
  LastStep = 1;
  scannedDropOption: string = "";
  scannedDropLoc: string = "";
  currentMstStepNo: number = 0;
  currentStepCode: string = "";
  blnPickDropAllowedInAnyBin: boolean = false;
  //DropField_lbl = "";
  //DropField_lbl = this.translate.instant("DropOptionLbl");

  @ViewChild('focusOnDropLoc') focusOnDropLoc;
  @ViewChild('focusOnConfirmDropOption') focusOnConfirmDropOption;

  constructor(private picktaskService: PickTaskService, private commonservice: Commonservice, private router: Router, private toastr: ToastrService, private translate: TranslateService) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.DropOptionArray = [
        //this.translate.instant("PickList"),
        this.translate.instant("Tote"),
        this.translate.instant("Container")];
    });
    //this.DropField_lbl = this.translate.instant("Drop") + " " + this.DropOption;    
  }

  ngOnInit() {
    this.DropOptionArray = [
      //this.translate.instant("PickList"),
      this.translate.instant("Tote"),
      this.translate.instant("Container")];
    this.DropOption = this.DropOptionArray[0];
    this.commonservice.GetSelectedSteps("Drop");
    setTimeout(() => {
      this.setDropSteps();
    }, 500)
    this.processStep = true;
    this.blnPickDropAllowedInAnyBin = this.picktaskService.checkIfPickDropAllowedInAnyBin();
    //this.DropField_lbl = this.translate.instant("Drop") + " " + this.DropOption;
  }

  setDropSteps() {
    this.DropSteps = JSON.parse(sessionStorage.getItem("DropSteps"));
    if (this.DropSteps == undefined || this.DropSteps.length == 0) {
      this.toastr.error('', this.translate.instant("NoTransactionSteps"));
      return;
    } 
    this.SetStepsToStartPosition();
    this.LastStep = this.DropSteps.length;    
  }

  SetStepsToStartPosition(){
    this.currentMstStepNo = 0;
    this.currentStep = 0;
    this.scannedDropOption = "";
    this.scannedDropLoc = "";
    this.SetToNextStep();
  }

  SetToNextStep() {  
    
    var nxtDropSteps = this.DropSteps.filter(e => e.OPTM_MSTR_STEP_NO > this.currentMstStepNo);
    if (nxtDropSteps != undefined && nxtDropSteps.length > 0) {  
      this.currentMstStepNo = nxtDropSteps[0].OPTM_MSTR_STEP_NO;
      this.currentStepCode = nxtDropSteps[0].OPTM_STEP_CODE;
      this.PrepareForStepExecution();  
      this.processStep = true;  
      this.currentStep = this.currentStep + 1;  
    } else {
      this.processStep = false;
    }
  }

  DropOptionPlaceHolder = "";
  PrepareForStepExecution() {
    switch ( this.currentStepCode) {
      case "Confirm_Drop":
        if (this.DropOption == this.translate.instant("PickList")) {
          this.DropOptionPlaceHolder = this.translate.instant("enterpicklist");
          this.currentStepText = this.translate.instant("scanpicklist");
        } else if (this.DropOption == this.translate.instant("Container")) {
          this.DropOptionPlaceHolder = this.translate.instant("enterCont")
          this.currentStepText = this.translate.instant("scancont");
        } else {
          this.currentStepText = this.translate.instant("ScanTote");
          this.DropOptionPlaceHolder = this.translate.instant("ph_EnterTote")
        }
        return;
      case "Confirm_Pick_Drop_Location":
        this.currentStepText = this.translate.instant("ScanLoadLoc");
        return;
      default:
        return;
    }
  }

  onDropOptionChange(event) {
    this.DropOption = event;
    this.dropLocation = "";
    this.SetStepsToStartPosition();
  }

  onScanContToteChange(blnDropFlg: boolean) {
    if (this.DropOption == this.translate.instant("PickList")) {
      //this.ValidateAndDropPicklist();
    } else if (this.DropOption == this.translate.instant("Container")) {
      this.ValidateAndDropContainer(blnDropFlg);
    } else if (this.DropOption == this.translate.instant("Tote")) {
      this.ValidateAndDropTote(blnDropFlg);
    }
  }

  onSaveClick() {
    this.onScanContToteChange(true);
  }

  /*
  ValidateAndDropPicklist() {
    this.dropLocation = this.dropLocation.trim();
    if (this.dropLocation == undefined || this.dropLocation == "") {
      this.toastr.error("", this.translate.instant("DropLocationBlank"));
      return;
    }
    
    this.dropValue = this.dropValue.trim();
    if (this.dropValue == undefined || this.dropValue == "") {
      this.toastr.error("", this.translate.instant("DropPicklistBlank"));
      return;
    }
    
    this.showLoader = true;
    
    this.picktaskService.DropPickListAPI(this.dropLocation, this.dropValue, this.blnPickDropAllowedInAnyBin).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data != "") {
            this.toastr.error("", this.translate.instant(data));
            this.dropLocation = "";
          } else {
            this.toastr.success("", this.translate.instant("DropSuccessMsg"));
            this.SetStepsToStartPosition()
          }
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
          return;
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
        return;
      }
    );

  }
  */

  ValidateAndDropContainer(blnDropFlg: boolean) {
    this.dropLocation = this.dropLocation.trim();
    if (this.dropLocation == undefined || this.dropLocation == "") {
      this.toastr.error("", this.translate.instant("DropLocationBlank"));
      return;
    }
    
    this.scannedDropOption = this.scannedDropOption.trim();
    if (this.scannedDropOption == undefined || this.scannedDropOption == "") {
      this.toastr.error("", this.translate.instant("DropContainerBlank"));
      return;
    }
    
    this.showLoader = true;
    
    this.picktaskService.ValidateAndDropContainer(this.dropLocation, this.scannedDropOption, blnDropFlg, this.blnPickDropAllowedInAnyBin).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data != "") {
            this.toastr.error("", this.translate.instant(data));
            this.scannedDropOption = "";
          } else {
            if (!blnDropFlg) {              
              this.SetToNextStep()
            } else {
              this.toastr.success("", this.translate.instant("DropSuccessMsg"));
              this.SetStepsToStartPosition()
            }
          }
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
          return;
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
        return;
      }
    );

  }

  ValidateAndDropTote(blnDropFlg: boolean) {
    this.dropLocation = this.dropLocation.trim();
    if (this.dropLocation == undefined || this.dropLocation == "") {
      this.toastr.error("", this.translate.instant("DropLocationBlank"));
      return;
    }
    
    this.scannedDropOption = this.scannedDropOption.trim();
    if (this.scannedDropOption == undefined || this.scannedDropOption == "") {
      this.toastr.error("", this.translate.instant("DropToteBlank"));
      return;
    }
    
    this.showLoader = true;
    
    this.picktaskService.ValidateAndDropTote(this.dropLocation, this.scannedDropOption, blnDropFlg, this.blnPickDropAllowedInAnyBin).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data != "") {
            this.toastr.error("", this.translate.instant(data));
            this.scannedDropOption = "";
          } else {
            if (!blnDropFlg) {              
              this.SetToNextStep()
            } else {
              this.toastr.success("", this.translate.instant("DropSuccessMsg"));
              this.SetStepsToStartPosition()
            }
          }
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
          return;
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
        return;
      }
    );

  }

  ValidateScannedLocation(){
    if (this.scannedDropLoc == undefined || this.scannedDropLoc == "") {
      return;
    }
    if (this.scannedDropLoc == this.dropLocation) {
      this.SetToNextStep()
    } else {
      this.toastr.error('', this.translate.instant("DropBinDoNotMatch"));
      return;
    }
  }

  onDropLocationChange() {
    if (this.dropLocation == undefined || this.dropLocation == "") {
      return;
    }
    this.dropLocation = this.dropLocation.trim();
    this.showLoader = true;
    
    this.picktaskService.ValidateScannedBinForDropping(this.dropLocation).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data != "") {
            this.toastr.error("", this.translate.instant(data));
            this.dropLocation = "";
          } else {
            this.SetStepsToStartPosition();
          }
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
          return;
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
        return;
      }
    );

  }

  OnCancelClick() {
    this.router.navigate(['home/dashboard']);
  }
}
