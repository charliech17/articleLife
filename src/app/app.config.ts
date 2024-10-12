import { NgbDateAdapter } from '@ng-bootstrap/ng-bootstrap';
import { ApplicationConfig, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, TitleStrategy } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, Title } from '@angular/platform-browser';
import { NgbDateDayjsAdapter } from '../config/datepicker-adapter';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { AppPageTitleStrategy } from './app-page-title-strategy';
import { TranslateModule } from '@ngx-translate/core';
import { provideTranslation } from '../shared/language/translation.module';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideClientHydration(),
    importProvidersFrom([TranslateModule.forRoot(provideTranslation())]),
    // importProvidersFrom(TranslationModule),
    provideHttpClient(withFetch()),
    Title,
    { provide: LOCALE_ID, useValue: 'zh-Hant' },
    { provide: NgbDateAdapter, useClass: NgbDateDayjsAdapter },
    // httpInterceptorProviders,
    { provide: TitleStrategy, useClass: AppPageTitleStrategy },
  ]
};
