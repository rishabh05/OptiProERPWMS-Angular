import { Component, OnInit } from '@angular/core';
import { SigninService } from 'src/app/services/signin.service';
import { Router } from '../../../node_modules/@angular/router';
import { WHS } from 'src/app/models/account/WHS';

@Component({
  selector: 'app-change-warehouse',
  templateUrl: './change-warehouse.component.html',
  styleUrls: ['./change-warehouse.component.scss']
})
export class ChangeWarehouseComponent implements OnInit {

  whsList: WHS[] = [];
  defaultWHS: any;
  
  constructor(private signinService: SigninService, private router: Router) {
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

      }
    );
  }

  public listItems: Array<string> = [
    'Baseball', 'Basketball', 'Cricket', 'Field Hockey',
    'Football', 'Table Tennis', 'Tennis', 'Volleyball'
  ];

  onSubmitClick(){
    localStorage.setItem("whseId", this.defaultWHS.OPTM_WHSE);
    this.router.navigateByUrl('home/dashboard');
  }
}
