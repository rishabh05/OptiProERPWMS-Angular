import { Component, OnInit } from '@angular/core';
import { CommonConstants } from 'src/app/const/common-constants';
import { OutboundService } from 'src/app/services/outbound.service';
import { OutboundData } from 'src/app/models/outbound/outbound-data';
import { MeterialModel } from 'src/app/models/outbound/meterial-model';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { forEach } from '@angular/router/src/utils/collection';
import { anyChanged } from '@progress/kendo-angular-grid/dist/es2015/utils';



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
  public scanInputPlaceholder = "Scan"
  public SerialBatchHeaderTitle: string = "";

  constructor(private ourboundService: OutboundService, private router: Router, private toastr: ToastrService, private translate: TranslateService) { }

  ngOnInit() {
    //lsOutbound
    let outboundData = localStorage.getItem(CommonConstants.OutboundData);

    if (outboundData != undefined && outboundData != '') {

      this.outbound = JSON.parse(outboundData);

      this.selected = this.outbound.SelectedItem;
      this.OrderType = this.selected.TRACKING;



      if (this.OrderType != 'N') {
        if (this.OrderType === 'S') {
          this.SerialBatchHeaderTitle = "Serial";
        }
        else if (this.OrderType === 'B') {
          this.SerialBatchHeaderTitle = "Batch";
        }
        this.manageOldCollection();
      }

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

  manageOldCollection() {
    let itemMeterials
    if (this.outbound.TempMeterials !== undefined
      && this.outbound.TempMeterials !== null
      && this.outbound.TempMeterials.length > 0) {

      itemMeterials = this.outbound.TempMeterials.filter(
        (m: any) => m.Item.ITEMCODE
          === this.outbound.SelectedItem.ITEMCODE && this.outbound.OrderData.DOCNUM === m.Item.DOCNUM);
    }
    if (itemMeterials !== undefined && itemMeterials !== null
      && itemMeterials.length > 0) {

      itemMeterials.forEach(element => {
        this.selectedMeterials.push(element.Meterial)
      });;
      this.manageMeterial();
      this.calculateTotalAndRemainingQty();

    }

  }

  calculateRequeiredMeterial(): boolean {
    let needMeterial: boolean = false;
    let localTotalPickQty: number = this.totalPickQty;
    let requiredQty: number = parseFloat(this.selected.OPENQTY) - localTotalPickQty;

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
        this.manageOldSelectedItems();
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

      if (this.outbound.TempMeterials !== undefined
        && this.outbound.TempMeterials !== null && this.outbound.TempMeterials.length > 0) {


        this.outbound.TempMeterials = this.outbound.TempMeterials.filter((t: any) =>
          t.Item.ITEMCODE !== this.outbound.SelectedItem.ITEMCODE || t.Item.DOCNUM !== this.outbound.OrderData.DOCNUM);

        // loop selected Items
        for (let index = 0; index < this.selectedMeterials.length; index++) {
          const m = this.selectedMeterials[index];
          if (m.MeterialPickQty > 0) {
            let item = { Order: this.outbound.OrderData, Item: this.outbound.SelectedItem, Meterial: m }
            this.outbound.TempMeterials.push(item)
          }
        }

        // this.selectedMeterials.forEach(m => {

        // }
        // );
      }
      else {

        this.outbound.TempMeterials = [];

        // loop selected Items
        for (let index = 0; index < this.selectedMeterials.length; index++) {
          const m = this.selectedMeterials[index];
          if (m.MeterialPickQty > 0) {
            let item = { Order: this.outbound.OrderData, Item: this.outbound.SelectedItem, Meterial: m }
            this.outbound.TempMeterials.push(item)
          }
        }

        // this.selectedMeterials.forEach(element => {
        //   let item = { Order: this.outbound.OrderData, Item: this.outbound.SelectedItem, Meterial: element }
        //   this.outbound.TempMeterials.push(item)
        // });


      }


    }
    // //lsOutbound
    localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
    this.back();
  }

  back() {
    this.router.navigateByUrl('home/outbound/outorder', { skipLocationChange: true });
  }

  intersection(array1: any[], array2: any[]): any[] {
    let result: any[] = [];
    for (let i = 0; i < array1.length; i++) {
      for (let j = 0; j < array2.length; j++) {
        if (array1[i] === array2[j] && result.indexOf(array1[i]) === -1) {
          result.push(array1[i]);
          break;
        }
      }
    }
    return result;
  };

  filterData(m1: any[], m2: any[]): any[] {
    let result: any[] = [];
    for (let i = 0; i < m1.length; i++) {
      let data = m2.filter((m: any) =>
        m.BINNO !== m1[i].BINNO &&
        m.LOTNO !== m1[i].LOTNO
      );
      if (data !== undefined && data !== null && data.length > 0) {
        result.push(data);
      }
    }
    return result;
  }

  removeData(m1: any[], m2: any[]): any[] {

    for (let index = 0; index < m2.length; index++) {

      let data = m1.filter((m: any) =>
        m.BINNO !== m2[index].BINNO &&
        m.LOTNO !== m2[index].LOTNO
      );

      let idx = m1.indexOf(data);
      if (idx > -1) {
        m1 = m1.splice(idx, 1);
      }
      return m1;

    }
  }


  private manageOldSelectedItems() {
    // let outbound: OutboundData = JSON.parse(localStorage.getItem(CommonConstants.OutboundData));

    if (this.selectedMeterials !== null && this.selectedMeterials !== undefined && this.selectedMeterials.length > 0) {

      for (let index = 0; index < this.selectedMeterials.length; index++) {
        const element = this.selectedMeterials[index];

        for (let j = 0; j < this.lookupData.length; j++) {
          const sd = this.lookupData[j];
          if (sd.ITEMCODE === element.ITEMCODE
            && sd.LOTNO === element.LOTNO
            && sd.BINNO === element.BINNO) {
            sd.OldData = true;
            this.lookupData[j] = sd;
          }
          else {
            // sd.OldData=false;
            // this.lookupData[j]=sd;
          }
        }
      }
    }
  }

}
