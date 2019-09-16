import { registerLocaleData } from '@angular/common';
import { LOCALE_ID, Provider } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

type SupportedLocale = 'en' | 'nl';
export const DEFAULT_LOCALE = 'en';
export const SUPPORTED_LOCALES: SupportedLocale[] = [ 'en', 'nl' ];

/**
 * Switches the runtime locale based on the current language
 */
export class CustomLocaleId extends String {
  currentLocale: string = DEFAULT_LOCALE;

  constructor(private translate: TranslateService) {
    super();
    translate.onLangChange.subscribe((language: LangChangeEvent) => {
      const newLocale = this.getLocaleFromLanguage(language.lang);
      getLocaleModule(newLocale as SupportedLocale).then(mod => {
        console.log(`Setting locale to ${newLocale}`);
        this.currentLocale = newLocale;
        registerLocaleData(mod.default);
      });
    });
  }

  toString = (): string => this.currentLocale;

  private getLocaleFromLanguage(language: string) {
    for (const locale of SUPPORTED_LOCALES) {
      if (language.startsWith(locale)) {
        return locale;
      }
    }
    return DEFAULT_LOCALE;
  }
}

function getLocaleModule(language: SupportedLocale) {
  switch (language) {
    case 'nl':
      return import('@angular/common/locales/nl');
    case 'en':
      return import('@angular/common/locales/en');
  }
}

export const CUSTOM_LOCALE_PROVIDER: Provider = {
  provide: LOCALE_ID,
  useClass: CustomLocaleId,
  deps: [ TranslateService ],
};
