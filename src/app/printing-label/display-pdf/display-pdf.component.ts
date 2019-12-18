import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Commonservice } from '../../services/commonservice.service';
import { ISubscription } from 'rxjs/Subscription';
import { UIHelper } from 'src/app/helpers/ui.helpers';

@Component({
  selector: 'app-display-pdf',
  templateUrl: './display-pdf.component.html',
  styleUrls: ['./display-pdf.component.scss']
})
export class DisplayPdfComponent implements OnInit, OnDestroy {

  @Input() base64String: any;
  @Input() fileName;
  @Output() pdfClose = new EventEmitter(); 
  displayPDF: boolean = false;
  isMobile:boolean = false;
  fileNameLabel:string = "";  
  refreshEventForReopenPDFSubs: ISubscription;
  //npm install ng2-pdf-viewer --save
  constructor(private commonService: Commonservice) { }

  ngOnInit() {
    
    this.fileNameLabel = this.fileName.substr( this.fileName.lastIndexOf("\\")+ 1);
    //console.log("File name: "+this.fileNameLabel);
    this.fileNameLabel = this.fileName;//"http://www.pdf995.com/samples/pdf.pdf";
       this.base64String= encodeURI(this.base64String);
   if(this.base64String!=null && this.base64String != "")  this.displayPDF = true;
   this.refreshEventForReopenPDFSubs = this.commonService.refreshPDFSubscriber.subscribe(data => {
    //for event to destroy item here.
    this.opened = true;
      
  });
  if (UIHelper.isMobile()) {
    this.isMobile = true;
  } else {
    this.isMobile = false; 
  }
  }

  OnCancelClick(){
    this.pdfClose.emit("item");
  }

  public opened: boolean = true;

  public close() {
    //console.log("PDF dialog  close called");
    this.pdfClose.emit({close: true});
    this.opened = false;
  } 

  public open() {
    this.opened = true;
  }

  ngOnDestroy(){
   // console.log("distroy")
  }

}
