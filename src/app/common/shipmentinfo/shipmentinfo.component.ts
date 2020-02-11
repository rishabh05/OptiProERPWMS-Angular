import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shipmentinfo',
  templateUrl: './shipmentinfo.component.html',
  styleUrls: ['./shipmentinfo.component.scss']
})
export class ShipmentinfoComponent implements OnInit {
  showDialog:boolean = true;
  @Input() serviceData: any;
 

  lookupPagable: boolean = true; 
  lookupPageSize: number = 10;
  @Output() lookupOutputEvent = new EventEmitter();
  ngOnInit() {
  }
  constructor(private toastr: ToastrService,  translate: TranslateService, private router: Router) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  closeDialog(){
    this.showDialog = false;

    this.lookupOutputEvent.emit('close')
  }

}
