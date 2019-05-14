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
  dialogMsg: string = "Do you want to delete?"
  yesButtonText: string = "Yes";
  noButtonText: string = "No";
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
  public OperationType: any;
  public scanInputPlaceholder = "Scan"
  public SerialBatchHeaderTitle: string = "";
  showConfirmDialog: boolean;
  rowindexForDelete: any;
  delIdx: any;
  delGrd: any;
  showLookupLoader: boolean = false;
  selectedUOM: any;
  uomIdx: number = 0;

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
            this.manageUOM();
          }
        );
      }

      this.ourboundService.getUOMList(this.selected.ITEMCODE).subscribe(
        data => {
          this.uomList = data;


          this.selectedUOM = this.uomList.filter(u => u.UomCode == this.selected.UOM);
          this.selectedUOM = this.selectedUOM[0];

        }
      )
    }
  }

  manageUOM() {
    // this._pickedMeterialQty=this.selectedUOM.AltQty*this._pickedMeterialQty;
  }

  manageOldCollection() {
    let itemMeterials
    if (this.outbound.TempMeterials !== undefined
      && this.outbound.TempMeterials !== null
      && this.outbound.TempMeterials.length > 0) {

      itemMeterials = this.outbound.TempMeterials.filter(
        (m: any) => m.Item.ITEMCODE
          === this.outbound.SelectedItem.ITEMCODE &&  m.Item.ROWNUM
          === this.outbound.SelectedItem.ROWNUM && this.outbound.OrderData.DOCNUM === m.Item.DOCNUM);
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

  onScanInputChange(){
    //this.onGS1ScanItem(); 
  }

  prodIssueScan(){
   
  }

  onHiddenScanClick(){
   // alert("outbound hidden scan click")
    this.onGS1ScanItem(); 
  }
  ScanInputs:string = "";
  onGS1ScanItem(){
   
    var inputValue = (<HTMLInputElement>document.getElementById('outboundOrderNoScanInput')).value;
    if(inputValue.length>0){
     this.ScanInputs = inputValue;
   }
    if (this.ScanInputs != null && this.ScanInputs != undefined &&
      this.ScanInputs != "" && this.ScanInputs != "error decoding QR Code") {

    } else {
      // if any message is required to show then show.
      this.ScanInputs = "";
      return;
    }
    let this1=this;
    this.ourboundService.checkAndScanCode(this.outbound.CustomerData.CustomerCode, this.ScanInputs).subscribe(
      (data: any) => {
      //  alert("check and scan code api call response data:"+JSON.stringify(data));
      let openQty:number;
      let tracking:string;
      let oepxpdt:string;
      var piManualOrSingleDimentionBarcode = 0
      var serialNo= "";
      if (data != null) {

          if (data[0].Error != null) {
            if (data[0].Error == "Invalidcodescan") {
              piManualOrSingleDimentionBarcode = 1
              this.toastr.error('', this.translate.instant("InvalidScanCode"));
              this.ScanInputs = "";
              // nothing is done in old code.
            } else {
              // some message is handle in else section in old code
              //return;
            }
            return;
          }
       
          // now check if the  code is for avilable item or not other wise invalid item error.
          var itemCode = this.outbound.SelectedItem.ITEMCODE;

          if (piManualOrSingleDimentionBarcode == 0) {
            if (data[0] != null && data[0].Value != null && (data[0].Value.toUpperCase() != itemCode.toUpperCase())) {
              this.toastr.error('', this.translate.instant("InvalidItemCode"));
              this.ScanInputs = "";
              return;
            }
 
            var piExpDateExist = 0;
            tracking = this1.OperationType;

            for (var i = 0; i < data.length; i++) {
              if (data[i].Key == '10' || data[i].Key == '21' || data[i].Key == '23') {
                this.ScanInputs = data[i].Value;
                serialNo = data[i].Value;
                //scan input value me set karna hai
                // make sure ScanInputs variable me puri string aati hai.. to uski value change karne
                // se kuch affect na kare.
                //scan input field par set karna hai.. ye value 10,21,23 k case me.
              }
              if (data[i].Key == '15' || data[i].Key == '17') {
                var d = data[i].Value.split('/');
                 oepxpdt = d[0] + '/' + d[1] + '/' + d[2];
                // set value to date field 
              ///  this.expiryDate = oepxpdt; 
                piExpDateExist = 1; //taken this variable for date purpose check if later used.
              }

              if (data[i].Key == '30' || data[i].Key == '310' ||
                data[i].Key == '315' || data[i].Key == '316' || data[i].Key == '320') {
                  openQty = data[i].Value;
              // ye dekhna hai kaise use hoga  this.addQuantity();
              }
            }
          }

          
          // create array 
          //let lookupArray:any=[{ITEMCODE:itemCode,OPENQTY:openQty}]
         // BINNO TOTALQTY LOTNO PickQty
          //this.getLookupValue(lookupArray,null,false); 
          this.ourboundService.getAllPickPackAndOtherSerialBatchWithoutBin(itemCode,"",serialNo,
          this.outbound.SelectedItem.DOCENTRY).subscribe(
            (data: any) => {
              console.log("data:"+data)
              if(data!=null && data != undefined && data.length>0){
                var binno = data[0].BINNO;
                var totalQty = data[0].TOTALQTY;
                var lotNo = data[0].LOTNO;
                var PickQty = 0;
                let lookupArray:any=[{ITEMCODE:itemCode,OPENQTY:openQty,BINNO:binno,
                  TOTALQTY:totalQty,LOTNO:lotNo,PickQty:PickQty}];
                  let el: any = document.getElementById('gridSelectedMeterial');
                this.getLookupValue(lookupArray,el,true); 
              }
           
            },
            error => {
              console.log("Error when checking availability: ", error);
            });
          } 
      },
      error => {
        console.log("Error: ", error);
      });



               
    
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
    this.showLookupLoader = true;
    this.ourboundService.getAvaliableMeterial(itemCode, docEntry).subscribe(
      (resp: any) => {
        this.lookupData = resp;
        this.manageOldSelectedItems();
        this.manageExistingItem();
        this.showLookupLoader = false;
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

  valueChange(e: any) {
    this.selectedUOM = e;
    this.manageUOM();
  }

  removeSelectedMeterial(idx: any, grd: any) {
    this.selectedMeterials.splice(idx, 1);
    grd.data = this.selectedMeterials;
    this.calculateTotalAndRemainingQty();
  }

  removeMeterial(idx: any, grd: any) {
    this.delGrd = grd;
    this.delIdx = idx;

    this.showConfirmDialog = true;
  }

  getConfirmDialogValue($event) {
    this.showConfirmDialog = false;

    // Yes
    if ($event.Status === 'yes') {
      this.removeSelectedMeterial(this.delIdx, this.delGrd);
    }
    // No
    else if ($event.Status === 'no') {

    }
    // Cross
    else {

    }
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
        t.Item.ROWNUM !== this.outbound.SelectedItem.ROWNUM && t.Item.ITEMCODE !== this.outbound.SelectedItem.ITEMCODE || t.Item.DOCNUM !== this.outbound.OrderData.DOCNUM);

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
          // Remove old selected metarial
          // if (this.filterLookUpDta(sd)) {
          //   continue;
          // }

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

  private manageExistingItem() {
    let tempLookup: any = this.lookupData;
    for (let j = 0; j < this.lookupData.length; j++) {
      const sd = this.lookupData[j];

      // Remove old selected metarial


      if (this.outbound) {

        let tempCollection = this.outbound.TempMeterials;
        let currentOrder = this.outbound.OrderData;

        // Serial
        if (this.OrderType === 'S') {
          for (let index = 0; index < tempCollection.length; index++) {
            const element = tempCollection[index];

            // If already selectde
            if (element.Order.DOCNUM !== currentOrder.DOCNUM
              && element.Meterial.BINNO === sd.BINNO &&
              element.Meterial.LOTNO === sd.LOTNO &&
              element.Meterial.ITEMCODE === sd.ITEMCODE) {
              if (tempLookup.length > j) {
                tempLookup.splice(j, 1);
                break;
              }
            }

          }
        }
        else {

          // Prepare collection of bin
          let totalBinPickQtyCollection: any[] = this.getBinAndTotalMeterial(tempCollection);
          for (let i = 0; i < totalBinPickQtyCollection.length; i++) {
            const element = totalBinPickQtyCollection[i];

            if (element.BINNO === sd.BINNO &&
              element.LOTNO === sd.LOTNO &&
              element.ITEMCODE === sd.ITEMCODE
            ) {

              sd.TOTALQTY = sd.TOTALQTY - element.TotalAllocatedMetQty;

              if (element.TotalAllocatedMetQty >= sd.TOTALQTY) {
                if (tempLookup.length > j) {
                  tempLookup.splice(j, 1);
                  break;
                }
                else{
                  tempLookup[j].TOTALQTY=sd.TOTALQTY;
                }
              }
            }
          }
        }

      }
    }

    this.lookupData == tempLookup;
  }

  private getBinAndTotalMeterial(tempCollection: any[]): any[] {
    let binAndQtyCollection: any = {};
    let binAndQtyCollectionArray: any[] = [];
    let ProcessedCount: number = 0;


    for (let index = 0; index < tempCollection.length; index++) {
      const element = tempCollection[index];

      let tCollection: any = tempCollection.filter(t =>
        element.Meterial.BINNO === t.Meterial.BINNO &&
        element.Meterial.LOTNO === t.Meterial.LOTNO &&
        element.Meterial.ITEMCODE === t.Meterial.ITEMCODE);

      ProcessedCount = ProcessedCount + tCollection.length;

      if (ProcessedCount <= tempCollection.length) {

        let existCol = binAndQtyCollectionArray.filter(t =>
          element.Meterial.BINNO === t.BINNO &&
          element.Meterial.LOTNO === t.LOTNO &&
          element.Meterial.ITEMCODE === t.ITEMCODE);

        if (existCol.length == 0) {
          binAndQtyCollection.BINNO = element.Meterial.BINNO;
          binAndQtyCollection.LOTNO = element.Meterial.LOTNO;
          binAndQtyCollection.ITEMCODE = element.Meterial.ITEMCODE;
          binAndQtyCollection.TotalAllocatedMetQty = tCollection.map(i => i.Meterial.MeterialPickQty).reduce((sum, c) => sum + c);


          binAndQtyCollectionArray.push(binAndQtyCollection);
        }
      }

    }
    return binAndQtyCollectionArray;
  }




}

