import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './src/i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'never' // Don't show locale in URL for default locale
});

export const config = {
  matcher: [
    // Match all pathnames except for
    // - api routes
    // - _next/static files
    // - _next/image files
    // - favicon.ico
    // - public folder files
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
