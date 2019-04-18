import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-change-warehouse',
  templateUrl: './change-warehouse.component.html',
  styleUrls: ['./change-warehouse.component.scss']
})
export class ChangeWarehouseComponent implements OnInit {

  
  constructor() { }

  ngOnInit() {
  }

  public listItems: Array<string> = [
    'Baseball', 'Basketball', 'Cricket', 'Field Hockey',
    'Football', 'Table Tennis', 'Tennis', 'Volleyball'
  ];
}
