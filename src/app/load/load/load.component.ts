import { Component, OnInit, ViewChild } from '@angular/core';
import { Commonservice } from '../../services/commonservice.service';
import { Router } from '../../../../node_modules/@angular/router';
import { ToastrService } from '../../../../node_modules/ngx-toastr';
import { LangChangeEvent, TranslateService } from '../../../../node_modules/@ngx-translate/core';

@Component({
  selector: 'app-load',
  templateUrl: './load.component.html',
  styleUrls: ['./load.component.scss']
})
export class LoadComponent implements OnInit {

  LoadArray = [];
  Load = "";
  showFields: boolean = true;
  selectedDropOption: string = "";
  currentStepText = "";
  LoadSteps: any[] = [];
  currentStep = 1;
  maxStep = 2;
  scannedDropOption = "";
  loadField_lbl = "";
  Equipment: string = '';
  MoveFrmLoc; string = '';
  @ViewChild('focusOnDropLoc') focusOnDropLoc;
  @ViewChild('focusOnConfirmDropOption') focusOnConfirmDropOption;

  constructor(private commonservice: Commonservice, private router: Router, private toastr: ToastrService, private translate: TranslateService) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.LoadArray = [
        this.translate.instant("Tote"),
        this.translate.instant("Container")];
    });
    this.loadField_lbl = this.translate.instant("Load") + " " + this.Load;
  }

  ngOnInit() {
    this.LoadArray = [
      this.translate.instant("Tote"),
      this.translate.instant("Container")];
    this.Load = this.LoadArray[0];
    this.commonservice.GetSelectedSteps("Loading");
    setTimeout(() => {
      this.setLoadingSteps();
    }, 500)
    this.showFields = true;
    this.loadField_lbl = this.translate.instant("Load") + " " + this.Load;
  }

  setLoadingSteps() {
    this.LoadSteps = JSON.parse(sessionStorage.getItem("LoadSteps"));
    if (this.LoadSteps != undefined && this.LoadSteps.length > 0) {
      this.currentStep = this.getStepNo(this.LoadSteps[0].OPTM_STEP_CODE);
      this.maxStep = this.LoadSteps.length;
      this.changeText(this.currentStep)
    }
  }

  LoadPlaceHolder="";
  changeText(step) {
    if (step == 1) {
      if (this.Load == this.translate.instant("Container")) {
        this.LoadPlaceHolder = this.translate.instant("enterCont")
        this.currentStepText = this.translate.instant("scancont");
      } else {
        this.currentStepText = this.translate.instant("ScanTote");
        this.LoadPlaceHolder = this.translate.instant("ph_EnterTote")
      }
    }
    else if (step == 2) {
      this.currentStepText = this.translate.instant("ScanLoadLoc");
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

  onDropOptionChange(event) {
    this.selectedDropOption = event;
  }

  onEquipmentChange() {

  }

  ClearFrmCtrlData(fldName: string) {
    if (fldName == 'Equipment') {
      this.Equipment = '';
    } else if (fldName == 'MoveFrmLoc') {
      this.MoveFrmLoc = '';
    }    
  }

  onContToteChange() {
  }

  onFrmLocationChange() {

  }

  OnCancelClick() {
    this.router.navigate(['home/dashboard']);
  }
}
