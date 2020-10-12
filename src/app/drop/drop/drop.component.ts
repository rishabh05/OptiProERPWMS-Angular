import { Component, OnInit, ViewChild } from '@angular/core';
import { Commonservice } from '../../services/commonservice.service';
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
  DropOption = "";
  showFields: boolean = true;
  selectedDropOption: string = "";
  currentStepText = "";
  PickListSteps: any[] = [];
  currentStep = 1;
  maxStep = 2;
  scannedDropOption = "";
  DropField_lbl = "";

  @ViewChild('focusOnDropLoc') focusOnDropLoc;
  @ViewChild('focusOnConfirmDropOption') focusOnConfirmDropOption;

  constructor(private commonservice: Commonservice, private router: Router, private toastr: ToastrService, private translate: TranslateService) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.DropOptionArray = [
        this.translate.instant("PickList"),
        this.translate.instant("Tote"),
        this.translate.instant("Container")];
    });
    this.DropField_lbl = this.translate.instant("DROP") + " " + this.DropOption;
  }

  ngOnInit() {
    this.DropOptionArray = [
      this.translate.instant("PickList"),
      this.translate.instant("Tote"),
      this.translate.instant("Container")];
    this.DropOption = this.DropOptionArray[0];
    this.commonservice.GetSelectedSteps("Drop");
    setTimeout(() => {
      this.setPickingSteps();
    }, 500)
    this.showFields = true;
    this.DropField_lbl = this.translate.instant("DROP") + " " + this.DropOption;
  }

  setPickingSteps() {
    this.PickListSteps = JSON.parse(localStorage.getItem("PickListSteps"));
    if (this.PickListSteps != undefined && this.PickListSteps.length > 0) {
      this.currentStep = this.getStepNo(this.PickListSteps[0].OPTM_STEP_CODE);
      this.maxStep = this.PickListSteps.length;
      this.changeText(this.currentStep)
    }
  }

  DropOptionPlaceHolder = "";
  changeText(step) {
    if (step == 1) {
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
    }
    else if (step == 2) {
      this.currentStepText = this.translate.instant("ScanLoadLoc");
    }
  }

  getStepNo(OPTM_STEP_CODE): any {
    switch (OPTM_STEP_CODE) {
      case "Confirm_Drop":
        return 1;
      case "Confirm_Pick_Drop_Location":
        return 2;
      default:
        return 1;
    }
  }

  onDropOptionChange(event) {
    this.DropOption = event;
    this.DropField_lbl = this.translate.instant("DROP") + " " + event;
    this.changeText(this.currentStep);
  }

  onPicklistContToteChange() {
  }

  onDropLocationChange() {

  }

  OnCancelClick() {
    this.router.navigate(['home/dashboard']);
  }
}
