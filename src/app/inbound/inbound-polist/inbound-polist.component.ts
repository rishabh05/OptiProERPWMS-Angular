import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { InboundService } from '../../services/inbound.service';
import { Commonservice } from '../../services/commonservice.service';
import { InboundMasterComponent } from '../inbound-master.component';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AutoLot } from '../../models/Inbound/AutoLot';
import { RowClassArgs, GridComponent } from '@progress/kendo-angular-grid';
import { bypassSanitizationTrustResourceUrl } from '@angular/core/src/sanitization/bypass';
import { InventoryTransferService } from '../../services/inventory-transfer.service';
import { StatePersistingServiceService } from '../../services/state-persisting-service.service';
import { GridSettings } from '../../interface/grid-settings.interface';
import { ColumnSettings } from '../../interface/column-settings.interface';
import { process } from '@progress/kendo-data-query';
import * as $ from 'jquery';
@Component({
  selector: 'app-inbound-polist',
  templateUrl: './inbound-polist.component.html',
  styleUrls: ['./inbound-polist.component.scss']
})
export class InboundPolistComponent implements OnInit {
  CT_Description: string;
  CT_Length: string;
  CT_Width: string;
  CT_Height: string;
  CT_Max_Width: string;


  constructor(private inboundService: InboundService, private commonservice: Commonservice, private router: Router, private toastr: ToastrService, private translate: TranslateService,
    private inboundMasterComponent: InboundMasterComponent, private inventoryTransferService: InventoryTransferService,
    private persistingService: StatePersistingServiceService) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  ngOnInit() {
    
  }

  onAddClick() {
    this.inboundMasterComponent.inboundComponent = 1;
  }


  onCancelClick() {
    this.inboundMasterComponent.inboundComponent = 1;
  }


}
