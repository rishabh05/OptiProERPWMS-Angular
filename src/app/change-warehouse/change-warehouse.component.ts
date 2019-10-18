import { Component, OnInit } from '@angular/core';
import { SigninService } from '../services/signin.service';
import { Router } from '@angular/router';
import { WHS } from '../models/account/WHS';
import { Commonservice } from '../services/commonservice.service';
import { ToastrService } from '../../../node_modules/ngx-toastr';
import { TranslateService } from '../../../node_modules/@ngx-translate/core';

@Component({
  selector: 'app-change-warehouse',
  templateUrl: './change-warehouse.component.html',
  styleUrls: ['./change-warehouse.component.scss']
})
export class ChangeWarehouseComponent implements OnInit {

  whsList: WHS[] = [];
  defaultWHS: any;
  
  constructor( private commonService: Commonservice,private signinService: SigninService, private router: Router,private toastr: ToastrService,private translate: TranslateService) {
    this.defaultWHS = { OPTM_WHSE: localStorage.getItem("whseId"), BPLid: 0 };
  }

  ngOnInit() {
    this.setWarehouseList();
  }

  public setWarehouseList() {
    this.signinService.getWHS(localStorage.getItem("CompID")).subscribe(
      data => {
        this.whsList = data.Table;
        // for (var i = 0; i < this.whsList.length; i++) {
        //   if (this.getCookie('whseId') == this.whsList[i].OPTM_WHSE) {
        //     this.defaultWHS = this.whsList[i];
        //   }
        // }
       // this.defaultWHS = localStorage.getItem("whseId");
      },
      error => {
        if(error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined){
          this.commonService.unauthorizedToken(error, this.translate.instant("token_expired"));               
       } 
       else{
        this.toastr.error('', error);
       }
      }
    );
  }

  onSubmitClick(){
    localStorage.setItem("whseId", this.defaultWHS.OPTM_WHSE);
    this.setCookie('whseId', this.defaultWHS.OPTM_WHSE, 365);
    this.commonService.refreshTopBarValue(localStorage.getItem("whseId"));
    this.router.navigateByUrl('home/dashboard');
  }

  /**
    * Function for set cookie data
    * @param cname 
    * @param cvalue 
    * @param exdays 
    */
   public setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}


public getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
          c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
      }
  }
  return "";
}
}
