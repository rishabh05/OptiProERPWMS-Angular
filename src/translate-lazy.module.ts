import { NgModule } from "@angular/core";
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// import { CommonHelper, LocalStorageService } from "ewapps-lib";

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/','.json');
}

@NgModule({
    imports: [
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient]
            },
            isolate:true
        }),        
    ],
    declarations: [
    ],
    providers: [
    ],
    exports: [
        TranslateModule
    ]
})
export class TrnaslateLazyModule {
    constructor(translate: TranslateService) {
        // get the current UserLang
        // let userLang: string = translate.getBrowserLang();
        // let userLang: string = CommonHelper.getBrowserLanguage();
        let userLang: string = 'en';
        // this language will be used as a fallback when a translation isn't found in the current language
        translate.setDefaultLang('en');

        // the lang to use, if the lang isn't available, it will use the current loader to get them
        // translate.use(userLang);

        // Get Language from local storage
        let currentLang = 'en';
        translate.use(currentLang);
    }
}