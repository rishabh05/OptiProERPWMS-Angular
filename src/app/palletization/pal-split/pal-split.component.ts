import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pal-split',
  templateUrl: './pal-split.component.html',
  styleUrls: ['./pal-split.component.scss']
})
export class PalSplitComponent implements OnInit {

  fromPallet:any;
  toPallet: any;
  itemsData:any;
  showNewPallet: any = false;
  isNonTrack: any = false;
  isPalletizationEnable: any = true;
  newPalletValue:any;
  palletValue:string = "";
  autoGenereatePalletEnable: boolean = false;
  showLoader: boolean = false;
  showLookupLoader = true;
  enteredQty:any = 0;
  
  constructor() { }

  ngOnInit() {
  }
  onCheckChange() {
    this.showNewPallet = !this.showNewPallet;
    this.newPalletValue = "";
  }

  onFromLookupClick()
  {

  }
  fromPalletChange(){

  }

  onToLookupClick()
  {

  }
  toPalletChange(){
    
  }

}
