import { NgbDateAdapter } from '@ng-bootstrap/ng-bootstrap';
import { ApplicationConfig, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, TitleStrategy } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, Title } from '@angular/platform-browser';
import { NgbDateDayjsAdapter } from '../config/datepicker-adapter';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { AppPageTitleStrategy } from './app-page-title-strategy';
import { TranslateModule } from '@ngx-translate/core';
import { provideTranslation } from '../shared/language/translation.module';
import { httpInterceptorProviders } from '../shared/interceptor/api/http-interceptor.providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    importProvidersFrom([TranslateModule.forRoot(provideTranslation())]),
    // importProvidersFrom(TranslationModule),
    provideHttpClient(withFetch(), withInterceptors(httpInterceptorProviders)),
    Title,
    { provide: LOCALE_ID, useValue: 'en' },
    { provide: NgbDateAdapter, useClass: NgbDateDayjsAdapter },
    { provide: TitleStrategy, useClass: AppPageTitleStrategy },
  ],
};
