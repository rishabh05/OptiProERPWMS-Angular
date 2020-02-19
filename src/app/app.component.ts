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
  public svgFile:string = 'assets/images/svg/svg-sprite.svg';
  public svgVersion:any = "1.16";

  constructor(private router: Router) { 
    // let userLang = navigator.language.split('-')[0];
    // userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    // translate.use(userLang);

    // this.router.routeReuseStrategy.shouldReuseRoute = function(){
    //     return false;
    // };
    
    // this.router.events.subscribe((evt) => {
    //     if (evt instanceof NavigationEnd) {
    //         this.router.navigated = false;
    //         window.scrollTo(0, 0);
    //     }
    // });
  }
  title = 'app';

  ngOnInit() {
    // this.CommonService.loadConfig();
    this.svgSprite();
  }

  svgSprite(){
    //console.log("SVG Sprite version : " + this.svgVersion);
    let that = this;
    if (!document.createElementNS || !document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect)
          return true;

      var isLocalStorage = 'localStorage' in window && window['localStorage'] !== null,
          request,
          data,
          insertIT = function () {
              document.body.insertAdjacentHTML('afterbegin', data);
          },
          insert = function () {
              if (document.body) insertIT();
              else document.addEventListener('DOMContentLoaded', insertIT);
          };

      if (isLocalStorage && (localStorage.getItem('inlineSVGrev') == that.svgVersion)) {
          data = localStorage.getItem('inlineSVGdata');
          if (data) {
              insert();
              return true;
          }
      }

      try {
          request = new XMLHttpRequest();
          request.open('GET', that.svgFile, true);
          request.onload = function () {
              if (request.status >= 200 && request.status < 400) {
                  data = request.responseText;
                  insert();
                  if (isLocalStorage) {
                      localStorage.setItem('inlineSVGdata', data);
                      localStorage.setItem('inlineSVGrev', that.svgVersion);
                  }
              }
          }
          request.send();
      }
      catch (e) { }
    }
}
