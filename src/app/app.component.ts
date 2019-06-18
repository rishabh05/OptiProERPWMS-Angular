import { Component } from '@angular/core';
import { Commonservice } from './services/commonservice.service';
import { Router, NavigationEnd } from '@angular/router';
// import { TranslateService, LangChangeEvent } from '../../node_modules/@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private router: Router) { 
    // let userLang = navigator.language.split('-')[0];
    // userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    // translate.use(userLang);

    this.router.routeReuseStrategy.shouldReuseRoute = function(){
      return false;
  };
  
  this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
          this.router.navigated = false;
          window.scrollTo(0, 0);
      }
  });
  }
  title = 'app';

  ngOnInit() {
    // this.CommonService.loadConfig();
  }
}
