import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Commonservice } from 'src/app/services/commonservice.service';
import { ISubscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-display-pdf',
  templateUrl: './display-pdf.component.html',
  styleUrls: ['./display-pdf.component.scss']
})
export class DisplayPdfComponent implements OnInit, OnDestroy {

  @Input() base64String: any;
  @Input() fileName;
  @Output() redirectTo = new EventEmitter();
  displayPDF: boolean = false;
  
  fileNameLabel:string = "";
  refreshEventForReopenPDFSubs: ISubscription;
  constructor(private commonService: Commonservice) { }

  ngOnInit() {
    
    this.fileNameLabel = this.fileName.substr( this.fileName.lastIndexOf("\\")+ 1);
    //console.log("File name: "+this.fileNameLabel);
   this.base64String= encodeURI(this.base64String);
   if(this.base64String!=null && this.base64String != "")  this.displayPDF = true;
   this.refreshEventForReopenPDFSubs = this.commonService.refreshPDFSubscriber.subscribe(data => {
    //for event to destroy item here.
    this.opened = true;
     
  });
  }

  OnCancelClick(){
    this.redirectTo.emit("item");
  }

  public opened: boolean = true;

  public close() {
   
    this.opened = false;
  }

  public open() {
    this.opened = true;
  }

  ngOnDestroy(){
    console.log("distroy")
  }

}