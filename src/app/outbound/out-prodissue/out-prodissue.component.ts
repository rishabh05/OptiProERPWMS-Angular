import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-out-prodissue',
  templateUrl: './out-prodissue.component.html',
  styleUrls: ['./out-prodissue.component.scss']
})
export class OutProdissueComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  public listItems: Array<{ text: string, value: number }> = [
      { text: "Small", value: 1 },
      { text: "Medium", value: 2 },
      { text: "Large", value: 3 }
  ];

}
