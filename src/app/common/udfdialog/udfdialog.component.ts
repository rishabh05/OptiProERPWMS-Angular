import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ToastrService } from '../../../../node_modules/ngx-toastr';
import { TranslateService, LangChangeEvent } from '../../../../node_modules/@ngx-translate/core';

@Component({
  selector: 'app-udfdialog',
  templateUrl: './udfdialog.component.html',
  styleUrls: ['./udfdialog.component.scss']
})
export class UDFdialogComponent implements OnInit {

  @Input() templates: any;
  @Input() UDFComponentData: any;
  @Input() lookupfor: any;
  @Output() UDFSaveClick = new EventEmitter();
  dialogOpened: boolean =  false;
  Heading: string;
  
  constructor(private toastr: ToastrService, private translate: TranslateService) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  ngOnInit() {
    this.Heading = "Additional Fields - "+this.lookupfor;
  }

  async ngOnChanges(): Promise<void> {
    this.Heading = "Additional Fields - "+this.lookupfor;
    if (this.templates !== undefined) {
      if (this.templates.length > 0) {
        this.dialogOpened = true;
      }
    }
  }

  clearUDFs() {
    this.templates = [];
    this.UDFComponentData = [];
    // this.itUDFComponents = null;
  }

  onUDFSaveClick(){
    if (!this.validateUDFFields()) {
      return;
    }    
    this.UDFSaveClick.emit(this.UDFComponentData);
  }

  validateUDFFields() {
    let result = this.UDFComponentData.filter(e => e.ismandatory == true);
    for (var i = 0; i < result.length; i++) {
      if (result[i].istextbox && result[i].textBox == "") {
        this.toastr.error('', this.translate.instant("Please enter " + result[i].LabelName));
        return false;
      } else if (result[i].isdropDown && result[i].dropDown == "") {
        this.toastr.error('', this.translate.instant("Please select " + result[i].LabelName));
        return false;
      }
    }
    return true;
  }

  onUDFDialogClose() {
    this.dialogOpened = false;
    this.UDFComponentData = [];
    this.templates = [];
    this.UDFSaveClick.emit(null);
  }
}
