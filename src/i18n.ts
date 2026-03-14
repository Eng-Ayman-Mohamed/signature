import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const locales = ['en', 'ar', 'fr', 'es'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const rtlLocales: Locale[] = ['ar'];

export function isRtlLocale(locale: string): boolean {
  return rtlLocales.includes(locale as Locale);
}

export default getRequestConfig(async () => {
  // Get locale from cookie or use default
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get('NEXT_LOCALE')?.value;
  
  // Validate the saved locale
  let locale: Locale = defaultLocale;
  if (savedLocale && locales.includes(savedLocale as Locale)) {
    locale = savedLocale as Locale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
