import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-prod-item-issue',
  templateUrl: './prod-item-issue.component.html',
  styleUrls: ['./prod-item-issue.component.scss']
})
export class ProdItemIssueComponent implements OnInit {

  dialogMsg: string = "Do you want to delete?"
  yesButtonText: string = "Yes";
  noButtonText: string = "No";
  // public outbound: OutboundData;
  public selected: any = null;
  public step: number = 0.001;
  public lookupData: any;
  public lookupFor: any = 'out-items';
  public showLookup: boolean = false;
  public selectedItems: any;
  public totalPickQty: number = 0.000;
  public mask: string = "0.000";
  public uomList: any = [];
  // public selectedMeterials: any = Array<MeterialModel>();
  // public comingSelectedMeterials: any = Array<MeterialModel>();
  public indivisualPickQty: number = 0.000;

  public _requiredMeterialQty: number = 0;
  public _remainingMeterial: number = 0;
  public _pickedMeterialQty: number = 0;
  public OrderType: string = '';
  // public oldSelectedMeterials: any = Array<MeterialModel>();
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

  constructor() { }

  ngOnInit() {
  }

}
