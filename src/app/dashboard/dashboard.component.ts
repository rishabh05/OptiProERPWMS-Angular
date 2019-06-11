import { Component, OnInit } from '@angular/core';
import { Commonservice } from 'src/app/services/commonservice.service';
import { TranslateService, LangChangeEvent } from '../../../node_modules/@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  appVersion: String;
  constructor(private commonservice: Commonservice, private translate: TranslateService) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
      
    });
  }

  ngOnInit() {
    this.appVersion = "Version: " +   this.commonservice.config_params.AppVersion;

    // this.appVersion = this.translate.instant("Dashboard_AppVersion") +   this.commonservice.config_params.AppVersion;
 }
 
}
