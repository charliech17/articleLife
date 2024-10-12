import { HttpClient } from '@angular/common/http';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { missingTranslationHandler, translatePartialLoader } from '../../config/translation.config';

export const provideTranslation = () => ({
  defaultLanguage: 'zh-tw',
  loader: {
    provide: TranslateLoader,
    useFactory: translatePartialLoader,
    deps: [HttpClient],
  },
  missingTranslationHandler: {
    provide: MissingTranslationHandler,
    useFactory: missingTranslationHandler,
  },
});
