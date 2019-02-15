import { Component } from '@angular/core';
import { Commonservice } from './services/commonservice.service';
import { TranslateService, LangChangeEvent } from '../../node_modules/@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private CommonService: Commonservice) { 
    // let userLang = navigator.language.split('-')[0];
    // userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    // translate.use(userLang);
  }
  title = 'app';

  ngOnInit() {
    // this.CommonService.loadConfig();
  }
}
