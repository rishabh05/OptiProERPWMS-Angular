import { Component } from '@angular/core';
import { Commonservice } from './services/commonservice.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private CommonService: Commonservice) { }
  title = 'app';

  ngOnInit() {
    // this.CommonService.loadConfig();
  }
}
