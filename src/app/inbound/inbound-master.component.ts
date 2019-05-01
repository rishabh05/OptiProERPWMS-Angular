import { Component, OnInit } from '@angular/core';
import { AutoLot } from '../models/Inbound/AutoLot';
import { OpenPOLinesModel } from '../models/Inbound/OpenPOLinesModel';

@Component({
  selector: 'app-inbound-master',
  templateUrl: './inbound-master.component.html',
  styleUrls: ['./inbound-master.component.scss']
})
export class InboundMasterComponent implements OnInit {

  constructor() { }

  public inboundComponent: number = 1;
  public selectedVernder: string;
  //public autoLots: AutoLot[];
  public openPOmodel: any;
  public oSubmitPOLotsArray: any[] = []; 
  public AddtoGRPOFlag: boolean = false;
  public SubmitPOArray: OpenPOLinesModel[] = [];
  

  ngOnInit() {
  }

  setSelectedVender(vender: string){
    this.selectedVernder = vender;
  }
  
  // setAutoLots(autoLots: AutoLot[]){
  //   this.autoLots = autoLots;
  // }

  setClickedItemDetail(openPOmodel){
    this.openPOmodel = openPOmodel;
  }

  public savePOLots(oSubmitPOLot: any){
    this.oSubmitPOLotsArray.push(oSubmitPOLot);
    this.AddtoGRPOFlag = true;
  }

  public AddPOList(openPOLinesModel: OpenPOLinesModel){
    this.SubmitPOArray.push(openPOLinesModel);
  }

}
