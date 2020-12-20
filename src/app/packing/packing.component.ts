import { Component, OnInit, ViewChild } from '@angular/core';
import { Commonservice } from '../services/commonservice.service';
import { Router } from '../../../node_modules/@angular/router';
import { LangChangeEvent, TranslateService } from '../../../node_modules/@ngx-translate/core';
import { ToastrService } from '../../../node_modules/ngx-toastr';
import { PickTaskService } from '../services/picktask.service';
import { PickPackContentModel } from '../models/PickPackContentModel';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-packing',
  templateUrl: './packing.component.html',
  styleUrls: ['./packing.component.scss']
})
export class PackingComponent implements OnInit {

  ToteValue: string = "";
  currentStep = 1;
  ScanContainer: string;
  BinCodeValue: string;
  ShipmentId: number = 0;
  ShipmentCode: string;
  ContainerCode: string;
  LastStep = 4;
  showLoader: boolean = false;
  FirstCont: any;
  PackingSteps: any[] = [];
  stepIndex = 0;
  maxStep = 0;
  dialogOpened = false;
  OPTM_STARTDATETIME: Date;
  SHIPMENTS = [];
  SHIPMENT_ITEMS = [];
  showLookup = false;
  serviceData = [];
  lookupfor = "";
  ShipmentItemDetail = [];
  ItemBtchSerDetail = [];
  showRemoveDialogFlag: boolean = false;
  titleMessage: string;
  yesButtonText: string;
  noButtonText: string;
  remFrmContCode: string;
  remItemCode: string;
  remBtchSer: string;
  remQty: number;
  ItmTracking: string;

  @ViewChild('focusOnItemCode') focusOnItemCode;
  @ViewChild('focusOnBtchSer') focusOnBtchSer;
  @ViewChild('focusOnCont') focusOnCont;
  @ViewChild('focusOnQty') focusOnQty;

  constructor(private commonservice: Commonservice, private router: Router, private toastr: ToastrService, private translate: TranslateService, private packservice: PickTaskService, private decimalPipe: DecimalPipe) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  ngOnInit() {
    this.commonservice.GetSelectedSteps("Packing");
    setTimeout(() => {
      this.setPackingSteps();
    }, 1000)
    this.showFields = true;
  }

  setPackingSteps() {
    this.PackingSteps = JSON.parse(sessionStorage.getItem("PackingSteps"));
    if (this.PackingSteps != undefined && this.PackingSteps.length > 0) {
      this.currentStep = this.getStepNo(this.PackingSteps[0].OPTM_STEP_CODE);
      this.maxStep = this.PackingSteps.length;
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
    this.scannedBtchSer = "";
    this.scannedContainer = "";
    this.scannedItemCode = "";
    this.scannedQty = undefined;
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
  onSubmitClick() {
    this.SavePackingContainerAndUpdateShipment();
  }

  clearHeaderValues() {
    this.ToteValue = "";
    this.ShipmentCode = "";
    this.ShipmentId = 0;
    this.ContainerCode = ""
    this.ShipmentItemDetail = [];
    this.PickPackContents = [];
  }

  clearHeaderValuesOnToteChange() {
    this.ShipmentCode = "";
    this.ShipmentId = 0;
    this.ContainerCode = ""
    this.ShipmentItemDetail = [];
    this.PickPackContents = [];
  }

  clearHeaderValuesOnShipmentChange() {
    this.ShipmentId = 0;
    this.ContainerCode = ""
    this.ShipmentItemDetail = [];
    this.PickPackContents = [];
  }

  clearDataAfterSubmit() {
    this.clearHeaderValues();
    this.clearFields();
    this.resetSteps();
    this.PickPackContents = [];
  }

  refreshDataAfterSubmit() {
    this.ShipmentItemDetail = [];
    if (this.SHIPMENT_ITEMS.length > 0) {
      this.ShipmentItemDetail = this.SHIPMENT_ITEMS.filter(e => e.OPTM_SHIPMENTID == this.ShipmentId);
    }
    this.PickPackContents = [];
    this.clearFields();
    this.resetSteps();    
  }

  iterateSteps = false;
  nextSteptoIterate() {
    this.iterateSteps = true;
    if (this.stepIndex < this.maxStep - 1) {
      this.stepIndex = this.stepIndex + 1;
      if (this.stepIndex >= 0 && this.stepIndex < this.PackingSteps.length) {
        if (this.PackingSteps[this.stepIndex].OPTM_ITERATE == "Y") {
          this.currentStep = this.getStepNo(this.PackingSteps[this.stepIndex].OPTM_STEP_CODE);
          if (this.stepIndex == this.PackingSteps.length - 1) {
            this.LastStep = this.currentStep;
          }
        } else {
          if (this.stepIndex == this.PackingSteps.length - 1) {
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

  // pickedCompleteCycle = false;
  checkIfQtyFullFiled() {
    this.showFields = false
  }

  nextStep() {
    if (this.stepIndex < this.maxStep) {
      this.stepIndex = this.stepIndex + 1;
      if (this.stepIndex >= 0 && this.stepIndex < this.PackingSteps.length) {
        this.currentStep = this.getStepNo(this.PackingSteps[this.stepIndex].OPTM_STEP_CODE);
        if (this.stepIndex == this.PackingSteps.length - 1) {
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
      let tracking = this.getITemTracking(this.scannedItemCode)
      if(tracking == 'B'){
        this.currentStepText = this.translate.instant("ScanBatch");
      }else{
        this.currentStepText = this.translate.instant("ScanSerial");
      }
    } else if (step == 3) {
      this.currentStepText = this.translate.instant("EnterQty");
    } else if (step == 4) {
      this.currentStepText = this.translate.instant("ScanCont");
    }
  }

  prevStep() {
    this.stepIndex = this.stepIndex - 1;
    if (this.stepIndex >= 0 && this.stepIndex < this.PackingSteps.length) {
      this.currentStep = this.getStepNo(this.PackingSteps[this.stepIndex].OPTM_STEP_CODE);
    }
    if (this.currentStep >= 1) {
      this.changeText(this.currentStep)
    }
  }

  OnCancelClick() {
    this.router.navigate(['home/dashboard']);
  }

  onPackStatusClick() {
    if (this.ShipmentCode == "" || this.ShipmentCode == undefined) {
      this.toastr.error('', this.translate.instant("ShipmentBlankMsg"))
      return;
    }

    this.packservice.GetShpmntPackStatus(this.ShipmentId).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }

          if (data.SHIPMENTS.length > 0) {
            this.showLookup = true;
            this.lookupfor = "ShipmentItemList"
            this.serviceData = data.SHIPMENTS
          } else {
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

  onBTCHSERClick() {
    if (this.ItemBtchSerDetail.length > 0) {
      this.showLookup = true;
      this.lookupfor = "ItemBTCHSER"
      this.serviceData = this.ItemBtchSerDetail
    }
  }

  onRemoveFromContainerClick() {
    this.showRemoveDialogFlag = false;
    if (this.PickPackContents.length > 0) {
      this.showLookup = true;
      this.lookupfor = "PackedContents"
      this.serviceData = this.PickPackContents
    } else {
      this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
    }
  }

  SetRemoveItemDetails($event) {
    this.showRemoveDialogFlag = false;
    if ($event.CLOSED == false) {
      let remQty: number = $event.REMOVE_QTY
      let tracking = this.getITemTracking(this.remItemCode)
      let index = -1;
      if(tracking == "N"){
        index = this.PickPackContents.findIndex(e=> e.OPTM_ITEMCODE == this.remItemCode && e.OPTM_CONTAINERCODE == this.remFrmContCode);
      }else{
        index = this.PickPackContents.findIndex(e=> e.OPTM_ITEMCODE == this.remItemCode && e.OPTM_BTCHSER == this.remBtchSer && e.OPTM_CONTAINERCODE == this.remFrmContCode);
      }
      if(index != -1){
        if (this.PickPackContents[index].OPTM_QTY > remQty) {
          if(tracking == "N" || tracking == 'B'){
            this.PickPackContents[index].OPTM_QTY = this.PickPackContents[index].OPTM_QTY - remQty;
          }
        } else {
          //If remove quantity is equal to Item quantity in the container then remove it from container
          this.PickPackContents.splice(index)
        }
        this.UpdateShipmentItemDetail(this.remItemCode,-1 * remQty);
      } else {
        this.toastr.error('', this.translate.instant("ItemNotfound"))
        return;
      }      
    }    
  }

  onRelTotesClick() {
    if (this.ShipmentCode == "" || this.ShipmentCode == undefined) {
      this.toastr.error('', this.translate.instant("ShipmentBlankMsg"));
      return;
    }

    this.packservice.GetShipmentRelTotes(this.ShipmentId).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }

          if (data.SHIPMENT_TOTES.length > 0) {
            this.showLookup = true;
            this.lookupfor = "RelatedToteList"
            this.serviceData = data.SHIPMENT_TOTES
          } else {
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

  GetDroppedToteList() {
    if (this.BinCodeValue == "" || this.BinCodeValue == undefined) {
      this.toastr.error('', this.translate.instant("BinSelectFirst"));
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
          if (data.length > 0) {
            this.showLookup = true;
            this.serviceData = data;
            this.lookupfor = "ToteList";
          } else {
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
  
  GetToteShipments() {
    this.GetToteShipmentsFromDB(true);    
  }

  GetToteShipmentsFromDB(showlookup: boolean) {
    if (this.ToteValue == "" || this.ToteValue == undefined) {
      this.toastr.error('', this.translate.instant("ToteBlankMsg"))
      return;
    }

    this.packservice.GetToteShipments(this.ToteValue, this.BinCodeValue).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }

          if (data.SHIPMENTS.length > 0) {            
            this.SHIPMENTS = data.SHIPMENTS
            if (data.SHIPMENT_ITEMS.length > 0) {
              this.SHIPMENT_ITEMS = data.SHIPMENT_ITEMS;
            }
            if (showlookup) {
              this.showLookup = true;
              this.lookupfor = "ToteShipmentList";
              this.serviceData = this.SHIPMENTS;
            }
          } else {
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

  GetToteItemBtchSer() {
    this.packservice.GetToteItemBtchSer(this.ToteValue, this.ShipmentId, this.BinCodeValue).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.ItemBtchSerDetail = data.ITEM_BTCHSER;
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
    this.clearHeaderValuesOnToteChange();
    if (this.ToteValue == "" || this.ToteValue == undefined) {
      return;
    }
    this.packservice.ValidateSelectedToteForPacking(this.ToteValue, this.BinCodeValue).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data[0].ErrorMsg != "") {
            this.toastr.error('', data[0].ErrorMsg);
            this.ToteValue = ""
          } else {

          }
        } else {
          this.toastr.error('', this.translate.instant("InvalidTote"));
          this.ToteValue = ""
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
    if (this.ShipmentCode == "" || this.ShipmentCode == undefined) {
      return;
    }
    this.GetToteShipmentsFromDB(false);
    let result = this.SHIPMENTS.filter(e => e.OPTM_SHIPMENT_CODE == this.ShipmentCode);
    if (result != null) {
      this.ShipmentCode = result[0].OPTM_SHIPMENT_CODE;
      this.ShipmentId = result[0].OPTM_SHIPMENTID;
      this.setItemsForSelectedShipment();      
    } else {
      this.ShipmentCode = '';
      this.ShipmentId = 0;
      this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
    }    
  }

  /*
  ValidateSelectedShipmentForPacking() {
    this.clearHeaderValuesOnShipmentChange();
    if (this.ToteValue == "" || this.ToteValue == undefined) {
      this.ShipmentCode = '';
      this.toastr.error('', this.translate.instant("ToteBlankMsg"))
      return;
    } else if (this.ShipmentCode == "" || this.ShipmentCode == undefined) {
      return;
    }
    this.packservice.ValidateSelectedShipmentForPacking(this.ToteValue, this.ShipmentCode).subscribe(
      (data: any) => {
        this.showLoader = false;        
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data[0].ErrorNo != "0") {
            this.toastr.error('', data[0].ErrorMsg);
            this.ShipmentCode = '';
            this.ShipmentId = 0
          } else {
            this.ShipmentId = data[0].data;
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

  */
  
  GetPackingBinsForWarehouse() {
    this.packservice.GetPackingBinsForWarehouse().subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data.length > 0) {
            this.showLookup = true;
            this.serviceData = data;
            this.lookupfor = "PackBinList";
          } else {
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

  getLookupValue(event) {
    if (event.CLOSED != undefined && event.CLOSED) {
      this.showLookup = false;
      return
    }

    if (this.lookupfor == "PackBinList") {
      this.BinCodeValue = event.OPTM_SORT_PACK_BIN;
      this.clearHeaderValues();
      //this.clearFields();
      //this.resetSteps();
    } else if (this.lookupfor == "ToteList") {
      this.clearHeaderValuesOnToteChange();
      this.ToteValue = event.OPTM_CODE;
    } else if (this.lookupfor == "ToteShipmentList") {
      this.clearHeaderValuesOnShipmentChange();
      //Now assign the values
      this.ShipmentCode = event.OPTM_SHIPMENT_CODE;
      this.ShipmentId = event.OPTM_SHIPMENTID;

      this.setItemsForSelectedShipment();      
    } else if (this.lookupfor == "PackedContents") {
      //Show Item, Batch Serial and Quantity Selected. Allow to enter quantity to remove
      //On Confirm remove the quantity from Pack Contents for the Item / Batch Selected.      
      //In case of Serial do not show the screen but remove the item from behind
      this.titleMessage = "Selected Item to remove";
      this.yesButtonText = "Confirm";
      this.noButtonText = "Cancel";
      this.remFrmContCode = event.OPTM_CONTAINERCODE;
      this.remItemCode = event.OPTM_ITEMCODE;
      this.remBtchSer = event.OPTM_BTCHSER;
      this.remQty = event.OPTM_QTY;
      this.ItmTracking = event.OPTM_Tracking;
      this.showRemoveDialogFlag = true;
      this.showLookup = false;      
    } else if (this.lookupfor == "ItemBTCHSER" || this.lookupfor == "ShipmentItemList" || 
        this.lookupfor == "RelatedToteList") {
        this.showLookup = false;
    }
    this.clearFields();
    this.resetSteps();
  }

  setItemsForSelectedShipment() {
    if (this.SHIPMENT_ITEMS.length > 0) {
      this.ShipmentItemDetail = this.SHIPMENT_ITEMS.filter(e => e.OPTM_SHIPMENTID == this.ShipmentId);
    }      
    this.GetToteItemBtchSer();
  }


  // GetToteShipmentItems() {
  //   this.packservice.GetToteShipmentItems(this.ToteValue, this.ShipmentCode).subscribe(
  //     (data: any) => {
  //       this.showLoader = false;
  //       if (data != undefined) {
  //         if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
  //           this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
  //             this.translate.instant("CommonSessionExpireMsg"));
  //           return;
  //         }
  //         if (data.OUTPUT[0].RESULT == "Data Saved") {
  //           this.toastr.success('', this.translate.instant("ContainerCreatedSuccessMsg"));
  //         } else {
  //           this.toastr.error('', data.OUTPUT[0].RESULT);
  //         }
  //       } else {
  //         // this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
  //       }
  //     },
  //     error => {
  //       this.showLoader = false;
  //       if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
  //         this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
  //       }
  //       else {
  //         this.toastr.error('', error);
  //       }
  //     }
  //   );
  // }

  SavePackingContainerAndUpdateShipment() {
    //var packingContainerDtl = this.PrearePackingContModel();
    if (this.PickPackContents.length == 0) {
      this.toastr.error('', this.translate.instant("NoDataToSave"));
      return;
    }
    var oSubmitPickPackObj: any = {};
    oSubmitPickPackObj.PickPackContents = [];    
    oSubmitPickPackObj.PickPackContents = this.PickPackContents;
    this.showLoader = true;
    this.packservice.SavePackingContainerAndUpdateShipment(oSubmitPickPackObj).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data.OUTPUT[0].ErrorNo == "0") {
            this.toastr.success('', this.translate.instant("PackingContCreated"));
            if (data.SHIPMENT_ITEMS == undefined) {
              this.clearDataAfterSubmit();
            } else {
              if (data.SHIPMENT_ITEMS.length > 0) {
                this.SHIPMENT_ITEMS = data.SHIPMENT_ITEMS;
              } else {
                this.clearDataAfterSubmit();
                return;
              }
              if (data.ITEM_BTCHSER.length > 0) {
                this.ItemBtchSerDetail = data.ITEM_BTCHSER;
              }
              this.refreshDataAfterSubmit();
            }
            
          } else {
            this.toastr.error('', data.OUTPUT[0].ErrorMsg);
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

  ValidatePackingContainer() {
    //this.PickPackContents = [];
    if (this.ContainerCode == "" || this.ContainerCode == undefined) {
      return;
    } else if (this.ShipmentCode == "" || this.ShipmentCode == undefined) {
      this.ContainerCode = '';
      this.toastr.error('', this.translate.instant("SHPCODEFirst"))
      return;
    }

    this.showLoader = true;
    this.packservice.ValidatePackingContainer(this.ContainerCode, undefined, this.ShipmentCode).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          // this.showLookupLoader = false;
          if (data != "") {
            this.ContainerCode = '';
            this.toastr.error("", data);
            // this.containercreated = false;
          } else {
            this.toastr.success("", this.translate.instant("CCCreated"))
            // this.containercreated = true;
          }
        } else {
          this.toastr.error('', this.translate.instant("InvalidContainerCode"));
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

  scannedItemCode: string = "";
  scannedContainer: string = "";
  scannedQty: number = undefined;
  scannedBtchSer: string = "";
  onItemChange() {
    if (this.ContainerCode == "" || this.ContainerCode == undefined) {
      this.toastr.error('', this.translate.instant("PackContBlank"))
      this.scannedItemCode = '';
      return;
    }
    if (this.scannedItemCode == undefined || this.scannedItemCode == "") {
      return;
    }
    this.scannedItemCode = this.scannedItemCode.trim();
    let index = this.ShipmentItemDetail.findIndex(e => e.OPTM_ITEMCODE == this.scannedItemCode)
    if (index != -1) {
      if (this.ShipmentItemDetail[index].BalanceQty == 0 || this.ShipmentItemDetail[index].PickQuantity == this.ShipmentItemDetail[index].MAX_AVAIL_QTY) {
        this.toastr.error('', this.translate.instant("ItemPacked"))
        this.scannedItemCode = '';
        return;
      };

      if (this.currentStep == this.LastStep) {
        this.checkIfQtyFullFiled();
      } else {
        if (this.getITemTracking(this.scannedItemCode) == 'N') {
          this.stepIndex = this.stepIndex + 1
        }
        if (this.iterateSteps) {
          this.nextSteptoIterate();
        } else {
          this.nextStep();
        }
      }
    } else {
      this.toastr.error('', this.translate.instant("InvalidItemCode"));
      this.scannedItemCode = "";
      this.setfocus();
    }
  }

  getITemTracking(ItemCode) {
    let result = this.ShipmentItemDetail.find(e => e.OPTM_ITEMCODE == ItemCode);
    return result.OPTM_TRACKING
  }

  onBtchSerChange() {
    if (this.scannedBtchSer == undefined || this.scannedBtchSer == "") {
      return;
    }
    this.scannedBtchSer = this.scannedBtchSer.trim();
    let tracking = this.getITemTracking(this.scannedItemCode)
    if(tracking == 'S'){
      let index = this.PickPackContents.findIndex(e=> e.OPTM_ITEMCODE == this.scannedItemCode && e.OPTM_BTCHSER == this.scannedBtchSer);
      if(index != -1){
        this.toastr.error('', this.translate.instant("Serial already taken."))
        this.scannedBtchSer = "";
        return;
      }
    }

    let index = this.ItemBtchSerDetail.findIndex(e => e.OPTM_BTCHSER == this.scannedBtchSer && e.OPTM_ITEMCODE == this.scannedItemCode)
    if (index != -1) {
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
      if(tracking == 'B'){
        this.toastr.error('', this.translate.instant("InvalidBatch"));
      }else{
        this.toastr.error('', this.translate.instant("InvalidSerial"));
      }
      
      this.scannedBtchSer = "";
      this.setfocus();
    }
  }

  onQtyChange() {
    if (this.scannedQty == undefined || Number(this.scannedQty) <= 0) {
      return;
    }
    let result;
    let sum =0;
    let array;
    let maxAvailQty: number = 0;
    var itemdtl = this.ShipmentItemDetail.find(e=> e.OPTM_ITEMCODE == this.scannedItemCode);
    if (this.getITemTracking(this.scannedItemCode) == 'N') {
      //result = this.ItemBtchSerDetail.find(e => e.OPTM_ITEMCODE == this.scannedItemCode)
      maxAvailQty = itemdtl.MAX_AVAIL_QTY;
      array = this.PickPackContents.filter(e => e.OPTM_ITEMCODE == this.scannedItemCode)
    } else {
      if (this.getITemTracking(this.scannedItemCode) == 'S' && this.scannedQty != 1) {
        this.toastr.error('', this.translate.instant("InvalidscannedQty"));
        this.scannedQty = undefined;
        this.setfocus();
        return;
      }
      result = this.ItemBtchSerDetail.find(e => e.OPTM_BTCHSER == this.scannedBtchSer && e.OPTM_ITEMCODE == this.scannedItemCode)
      if (result != undefined) {
        maxAvailQty = result.MAX_AVAIL_QTY;
      }
      array = this.PickPackContents.filter(e => e.OPTM_BTCHSER == this.scannedBtchSer && e.OPTM_ITEMCODE == this.scannedItemCode)
    }
    sum = array.reduce(function (a, b) {
      return a + parseFloat(b.OPTM_QTY);
    }, 0);
    if ((Number(sum) + this.scannedQty) <= maxAvailQty && (Number(sum) + this.scannedQty) <= itemdtl.SHIP_QTY) {
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
    else {
      this.toastr.error('', this.translate.instant("InvalidscannedQty"));
      this.scannedQty = undefined;
      this.setfocus();
    }
  }

  onContainerChange() {
    if (this.ContainerCode == '' || this.ContainerCode == null) {
      this.toastr.error('', this.translate.instant("ScanContainerCode"));
      return;
    }
    if (this.scannedContainer == undefined || this.scannedContainer == "") {
      return;
    }
    this.scannedContainer = this.scannedContainer.trim();
    if (this.scannedContainer === this.ContainerCode) {

      if (this.currentStep == this.LastStep) {
        this.checkIfQtyFullFiled();
      } else {
        if (this.iterateSteps) {
          this.nextSteptoIterate();
        } else {
          this.nextStep();
        }
      }
      // if (this.iterateSteps) {
      //   this.nextSteptoIterate();
      // } else {
      //   this.nextStep();
      // }
    } else {
      this.toastr.error('', this.translate.instant("InvalidscannedContainer"));
      this.scannedContainer = "";
      this.setfocus();
    }
  }

  UpdateShipmentItemDetail(itemCode: string, qty: number){
    let index = this.ShipmentItemDetail.findIndex(e => e.OPTM_ITEMCODE == itemCode);
    if (this.ShipmentItemDetail[index].PickQuantity != undefined) {
      this.ShipmentItemDetail[index].PickQuantity = Number(this.ShipmentItemDetail[index].PickQuantity) + Number(qty)
    } else {
      this.ShipmentItemDetail[index].PickQuantity = qty;
    }
    // this.ShipmentItemDetail[index].PickQuantity = this.scannedQty;
    this.ShipmentItemDetail[index].BalanceQty = Number(this.ShipmentItemDetail[index].BalanceQty) - Number(qty);
    
  }

  PickPackContents = [];
  onSaveClick() {
    if (this.ContainerCode == '' || this.ContainerCode == null) {
      this.ContainerCode = this.scannedContainer;
    }
    this.toastr.success('', this.translate.instant("Itemdetailsaved"))
    this.PrearePackingContModel();
    this.UpdateShipmentItemDetail(this.scannedItemCode,this.scannedQty);
    /*
    let index = this.ShipmentItemDetail.findIndex(e => e.OPTM_ITEMCODE == this.scannedItemCode);
    if (this.ShipmentItemDetail[index].PickQuantity != undefined) {
      this.ShipmentItemDetail[index].PickQuantity = Number(this.ShipmentItemDetail[index].PickQuantity) + Number(this.scannedQty)
    } else {
      this.ShipmentItemDetail[index].PickQuantity = this.scannedQty;
    }
    // this.ShipmentItemDetail[index].PickQuantity = this.scannedQty;
    this.ShipmentItemDetail[index].BalanceQty = Number(this.ShipmentItemDetail[index].SHIP_QTY) - Number(this.ShipmentItemDetail[index].PickQuantity);
    */
    this.clearFields();
    this.resetSteps();
    this.showFields = true;
  }

  resetSteps() {
    this.currentStep = 1;
    this.stepIndex = 0;
  }

  ClearContCode() {
    this.ContainerCode = '';
  }

  PrearePackingContModel() {
    let tracking = this.getITemTracking(this.scannedItemCode)
    if(tracking == "N" || tracking == 'B'){
      let index = -1;
      if(tracking == "N"){
        index = this.PickPackContents.findIndex(e=> e.OPTM_ITEMCODE == this.scannedItemCode && e.OPTM_CONTAINERCODE == this.ContainerCode);
      }else{
        index = this.PickPackContents.findIndex(e=> e.OPTM_ITEMCODE == this.scannedItemCode && e.OPTM_BTCHSER == this.scannedBtchSer && e.OPTM_CONTAINERCODE == this.ContainerCode);
      }

      if(index != -1){
        this.PickPackContents[index].OPTM_QTY = Number(this.PickPackContents[index].OPTM_QTY) + Number(this.scannedQty);
        this.PickPackContents[index].OPTM_QTY = this.decimalPipe.transform(this.PickPackContents[index].OPTM_QTY, '1.6-6');
        return;
      }
    }

    let SrcObject: string = "Packing" //"PickList', 'Packing', 'Shipment'
    
    this.PickPackContents.push(new PickPackContentModel(0, 0, sessionStorage.getItem("whseId"),
    this.BinCodeValue, 2, this.ContainerCode, this.ToteValue, this.scannedItemCode, tracking, 
    this.scannedBtchSer, this.decimalPipe.transform(this.scannedQty, '1.6-6'), this.ShipmentId, this.OPTM_STARTDATETIME, SrcObject));
    
    /*
    this.PickPackContents.push({
      COMPANYDBNAME: sessionStorage.getItem("CompID"),
      OPTM_TOTE_NUMBER: this.ToteValue,
      OPTM_SHIPMENTID: this.ShipmentId,
      OPTM_CONTAINERCODE: this.ContainerCode,
      OPTM_ITEMCODE: this.scannedItemCode,
      OPTM_BTCHSER: this.scannedBtchSer,
      OPTM_QTY: this.scannedQty,
      OPTM_WHSE: sessionStorage.getItem("whseId"),
      OPTM_BIN: this.BinCodeValue,
      OPTM_CREATEDBY: sessionStorage.getItem("UserId"),
      Source_Obj: "Packing" //"PickList', 'Packing', 'Shipment'
    }) */
  }

  getServerDate() {
    this.showLoader = true;
    this.commonservice.getServerDate().subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          this.OPTM_STARTDATETIME = data;
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

