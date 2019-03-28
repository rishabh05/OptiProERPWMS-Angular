import { Component, OnInit } from '@angular/core';
import { CommonConstants } from 'src/app/const/common-constants';
import { OutboundService } from 'src/app/services/outbound.service';
import { OutboundData } from 'src/app/models/outbound/outbound-data';
import { MeterialModel } from 'src/app/models/outbound/meterial-model';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-out-prodissue',
  templateUrl: './out-prodissue.component.html',
  styleUrls: ['./out-prodissue.component.scss']
})
export class OutProdissueComponent implements OnInit {
  public outbound: OutboundData;
  public selected: any = null;
  public step: number = 0.001;
  public lookupData: any;
  public lookupFor: any = 'out-items';
  public showLookup: boolean = false;
  public selectedItems: any;
  public totalPickQty: number = 0.000;
  public mask: string = "0.000";
  public uomList: any = [];
  public selectedMeterials: any = Array<MeterialModel>();
  public comingSelectedMeterials: any = Array<MeterialModel>();
  public indivisualPickQty: number = 0.000;

  public _requiredMeterialQty: number = 0;
  public _remainingMeterial: number = 0;
  public _pickedMeterialQty: number = 0;
  public OrderType: string = '';
  public oldSelectedMeterials: any = Array<MeterialModel>();
  public OperationType: any[];


  constructor(private ourboundService: OutboundService, private router: Router, private toastr: ToastrService, private translate: TranslateService) { }

  ngOnInit() {
    //lsOutbound
    let outboundData = localStorage.getItem(CommonConstants.OutboundData);

    if (outboundData != undefined && outboundData != '') {
      this.outbound = JSON.parse(outboundData);
      this.selected = this.outbound.SelectedItem;
      this.OrderType = this.selected.TRACKING;
      this._requiredMeterialQty = parseFloat(this.selected.OPENQTY);
      this._remainingMeterial = this._requiredMeterialQty - this._pickedMeterialQty;
      this.selectedItems = [this.selected];

      if (this.OrderType == 'N') {
        this.ourboundService.getAvaliableMeterialForNoneTracked(this.selected.ITEMCODE).subscribe(
          mdata => {
            let el: any = document.getElementById('gridSelectedMeterial');
            this.getLookupValue(mdata, el, true);
          }
        );
      }


      this.ourboundService.getUOMList(this.selected.ITEMCODE).subscribe(
        data => {
          this.uomList = data;
        }
      )
    }
  }

  calculatePickQty() {
  }

  valueChange() {

  }

  calculateRequeiredMeterial(): boolean {
    let needMeterial: boolean = false;
    let localTotalPickQty: number = this.totalPickQty;
    let requiredQty: number = parseFloat(this.selected.OPENQTY) - localTotalPickQty;
    debugger;
    if (localTotalPickQty >= requiredQty) {
      return false;
    }

    if (this.comingSelectedMeterials != undefined && this.comingSelectedMeterials != null && this.comingSelectedMeterials.length > 0) {

      this.comingSelectedMeterials = this.comingSelectedMeterials.reverse(i => i.TOTALQTY);


      // Insert Pick qty
      for (let i = 0; i < this.comingSelectedMeterials.length; i++) {

        requiredQty = requiredQty - localTotalPickQty;

        // if (this.totalPickQty >= requiredQty) {
        //   return false;
        // }

        needMeterial = true;
        let meterial = this.comingSelectedMeterials[i];
        let meterialExists: boolean = false;

        meterialExists = this.selectedItems.filter(i => i.LOTNO == meterial.LOTNO && i.BINNO == meterial.BINNO).length > 0;
        if (meterialExists) {
          return false;
        }

        let avlQty = meterial.TOTALQTY;

        if (avlQty >= requiredQty) {
          meterial.MeterialPickQty = parseFloat(this.selected.OPENQTY);
        }
        else {
          meterial.MeterialPickQty = parseFloat(avlQty);
        }

        localTotalPickQty = localTotalPickQty + meterial.MeterialPickQty;

        this.selectedMeterials.push(meterial);
      }

      this.totalPickQty = this.totalPickQty + this.selectedMeterials.map(i => i.MeterialPickQty).reduce((sum, c) => sum + c);

    }


    return needMeterial;
  }

  QtyFilled() {
    if (this.selectedMeterials != undefined && this.selectedMeterials != undefined && this.selectedMeterials.length > 0) {
      this.totalPickQty = this.totalPickQty + this.selectedMeterials.map(i => i.MeterialPickQty).reduce((sum, c) => sum + c);
    }
    else {
      this.totalPickQty = 0;
    }
    return this.totalPickQty >= this.selected.OPENQTY;
  }


  needMeterial() {
    this.calculateTotalAndRemainingQty();

    return this._pickedMeterialQty < this._requiredMeterialQty;
  }

  onIssueMeterialQtyChange(idx: number, txt: any) {

    let oldValue: number = parseFloat(this.oldSelectedMeterials[idx].MeterialPickQty);

    if (this.selectedMeterials[idx].MeterialPickQty === null || this.selectedMeterials[idx].MeterialPickQty === undefined) {
      this.selectedMeterials[idx].MeterialPickQty = oldValue;
    }
    //let oldValue: number = parseFloat(this.selectedMeterials[idx].MeterialPickQty);

    if (txt.value === '' || txt.value === undefined || txt.value === null) {
      this.toastr.error('', this.translate.instant("MeterialCanNotBeBlank"));
      txt.value = oldValue;
      this.selectedMeterials[idx].MeterialPickQty = oldValue;
      return;
    }

    this.selectedMeterials[idx].MeterialPickQty = parseFloat(txt.value);

    if (this.selectedMeterials[idx].MeterialPickQty > this.selectedMeterials[idx].TOTALQTY) {

      this.toastr.error('', this.translate.instant("QtyGTTotal"));
      txt.value = oldValue;
      this.selectedMeterials[idx].MeterialPickQty = oldValue;
    }

    this.calculateTotalAndRemainingQty();

    if (this._pickedMeterialQty < 0) {

      this.toastr.error('', this.translate.instant("MeterialCanNotBeLTZero"));

      txt.value = oldValue;
      this.selectedMeterials[idx].MeterialPickQty = oldValue;

      this.calculateTotalAndRemainingQty();
      return;
    }

    if (this._pickedMeterialQty > this._requiredMeterialQty) {
      this.toastr.error('', this.translate.instant("QtyGTOpen"));

      txt.value = oldValue;
      this.selectedMeterials[idx].MeterialPickQty = oldValue;
      this.calculateTotalAndRemainingQty();
      return;
    }


  }

  calculateTotalAndRemainingQty() {
    if (this.selectedMeterials != null && this.selectedMeterials != undefined && this.selectedMeterials.length > 0) {
      this._pickedMeterialQty = this.selectedMeterials.map(i => i.MeterialPickQty).reduce((sum, c) => parseFloat(sum) + parseFloat(c));
      this._remainingMeterial = this._requiredMeterialQty - this._pickedMeterialQty;
    }
    else {
      this._pickedMeterialQty = 0;
      this._remainingMeterial = this._requiredMeterialQty - this._pickedMeterialQty;
    }
  }

  public openAvaliableMeterials() {

    if (this.needMeterial() == false) {
      this.toastr.error('', this.translate.instant("PickedAllRequiredItems"));
      //alert('You picked all requerde items.');
      return;
    }

    let itemCode = this.selected.ITEMCODE;
    let docEntry = this.selected.DOCENTRY;
    this.ourboundService.getAvaliableMeterial(itemCode, docEntry).subscribe(
      (resp: any) => {
        this.lookupData = resp;
        this.showLookup = true;
      }
    )
  }

  getLookupValue(lookupValue: any, gridSelectedMeterial: any, updateGrid: boolean = true) {

    this.comingSelectedMeterials = lookupValue;
    this.manageMeterial();
    console.log("SelectedMeterial", this.selectedMeterials);
    if (updateGrid == true)
      gridSelectedMeterial.data = this.selectedMeterials;
//lsOutbound
    this.outbound = JSON.parse(localStorage.getItem(CommonConstants.OutboundData));
    this.outbound.SelectedMeterials = lookupValue;
    localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
  }

  removeSelectedMeterial(idx: any, grd: any) {
    this.selectedMeterials.splice(idx, 1);
    grd.data = this.selectedMeterials;
    this.calculateTotalAndRemainingQty();
  }


  manageMeterial() {

    let requiredMeterialQty: number = this._requiredMeterialQty;
    let pickedMeterialQty: number = this._pickedMeterialQty;
    let remailingMeterialQty: number = requiredMeterialQty - pickedMeterialQty;

    if (pickedMeterialQty < requiredMeterialQty) {

      for (let i = 0; i < this.comingSelectedMeterials.length; i++) {

        let meterial = this.comingSelectedMeterials[i];
        let avaliableMeterialQty = parseFloat(meterial.TOTALQTY);

        if (avaliableMeterialQty >= remailingMeterialQty) {
          meterial.MeterialPickQty = remailingMeterialQty;
        }
        else {
          meterial.MeterialPickQty = avaliableMeterialQty;
        }

        // meterial.MeterialPickQty = avaliableMeterialQty - remailingMeterialQty;

        // if (meterial.MeterialPickQty < 0) {
        //   meterial.MeterialPickQty = 0.000;
        // }
        // else {
        //   meterial.MeterialPickQty = remailingMeterialQty;
        // }

        this.selectedMeterials.push(meterial);


        pickedMeterialQty = pickedMeterialQty + meterial.MeterialPickQty;
        remailingMeterialQty = requiredMeterialQty - pickedMeterialQty;
      }

      // Selected meterial
      if (this.selectedMeterials != undefined && this.selectedMeterials != undefined && this.selectedMeterials.length > 0) {
        this._pickedMeterialQty = this.selectedMeterials.map(i => i.MeterialPickQty).reduce((sum, c) => sum + c);
        this._remainingMeterial = this._requiredMeterialQty - this._pickedMeterialQty;
      }
      else {
        this._pickedMeterialQty = pickedMeterialQty;
        this._requiredMeterialQty = remailingMeterialQty;
      }

    }

    this.oldSelectedMeterials = JSON.parse(JSON.stringify(this.selectedMeterials));

  }

  addMetToCollection() {
    //lsOutbound
    let outboundData = localStorage.getItem(CommonConstants.OutboundData);

    if (outboundData != undefined && outboundData != '') {

      this.outbound = JSON.parse(outboundData);

      // get element
      let item: any = this.outbound.TempSavedData.filter(i => i.SelectedItem.ITEMCODE == this.outbound.SelectedItem.ITEMCODE)

      let idx = this.outbound.TempSavedData.indexOf(item);

      debugger;
      if (idx !== -1) {
        item.SelectedMeterials.push(this.outbound.SelectedMeterials);
        this.outbound.TempSavedData.splice(idx, 1, item);

      }
      else {


        let OrderDataCollection: any = { SelectedItem: this.outbound.SelectedItem, SelectedMeterials: this.outbound.SelectedMeterials };

        if (this.outbound.TempSavedData === undefined || this.outbound.TempSavedData.length <= 0) {
          this.outbound.TempSavedData = [];
        }

        this.outbound.TempSavedData.push(OrderDataCollection);
      }
    }
//lsOutbound
    localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
    this.back();
  }

  back() {
    this.router.navigateByUrl('home/outbound/outorder', { skipLocationChange: true });
  }
}


