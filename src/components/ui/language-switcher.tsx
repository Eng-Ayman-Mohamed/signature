'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
] as const;

interface LanguageSwitcherProps {
  isMobilePreview?: boolean;
  variant?: 'pills' | 'dropdown' | 'compact';
  className?: string;
}

export function LanguageSwitcher({ 
  isMobilePreview = false,
  variant = 'pills',
  className 
}: LanguageSwitcherProps) {
  const t = useTranslations('language');
  const locale = useLocale();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (isMobilePreview) return;
    
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobilePreview]);

  const changeLocale = useCallback((newLocale: string) => {
    if (newLocale === locale) return;

    // Save to cookie via client-side
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    const cookieString = `NEXT_LOCALE=${newLocale};path=/;expires=${date.toUTCString()};SameSite=Lax`;
    document.cookie = cookieString;

    // Refresh the page to apply the new locale
    router.refresh();
    
    setIsOpen(false);
  }, [locale, router]);

  // Hide on mobile preview - render nothing
  if (isMobilePreview) {
    return null;
  }

  // Pills variant (desktop)
  if (variant === 'pills') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLocale(lang.code)}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200',
              locale === lang.code
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <span className="hidden sm:inline">{lang.nativeName}</span>
            <span className="sm:hidden">{lang.flag}</span>
          </button>
        ))}
      </div>
    );
  }

  // Compact variant (icon only)
  if (variant === 'compact') {
    return (
      <div className={cn('relative', className)} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'p-2 rounded-full transition-colors',
            'text-muted-foreground hover:text-foreground hover:bg-muted',
            isOpen && 'bg-muted text-foreground'
          )}
          aria-label={t('switch')}
        >
          <Globe className="w-5 h-5" />
        </button>

        {isOpen && (
          <div className={cn(
            'absolute top-full mt-2 py-1 min-w-[140px]',
            'bg-popover border border-border rounded-lg shadow-lg',
            'animate-in fade-in-0 zoom-in-95 duration-150',
            // Position based on locale direction
            locale === 'ar' ? 'left-0' : 'right-0'
          )}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLocale(lang.code)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                  locale === lang.code
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted'
                )}
              >
                <span>{lang.flag}</span>
                <span className="flex-1 text-start">{lang.nativeName}</span>
                {locale === lang.code && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Dropdown variant (default)
  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
          'border border-border bg-background',
          'text-sm font-medium',
          'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50',
          isOpen && 'bg-muted'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('switch')}
      >
        <Globe className="w-4 h-4 text-muted-foreground" />
        <span className="hidden sm:inline">
          {LANGUAGES.find(l => l.code === locale)?.nativeName}
        </span>
        <ChevronDown className={cn(
          'w-4 h-4 text-muted-foreground transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>

      {isOpen && (
        <div 
          className={cn(
            'absolute top-full mt-1 py-1 min-w-[160px]',
            'bg-popover border border-border rounded-lg shadow-lg',
            'animate-in fade-in-0 zoom-in-95 duration-150',
            // Position based on locale direction
            locale === 'ar' ? 'left-0' : 'right-0'
          )}
          role="listbox"
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLocale(lang.code)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                locale === lang.code
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted'
              )}
              role="option"
              aria-selected={locale === lang.code}
            >
              <span>{lang.flag}</span>
              <span className="flex-1 text-start">{lang.nativeName}</span>
              {locale === lang.code && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Simple inline variant for header/navigation
export function LanguageSwitcherInline({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('language');

  const changeLocale = useCallback((newLocale: string) => {
    // Save to cookie via client-side
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;expires=${date.toUTCString()};SameSite=Lax`;
    router.refresh();
  }, [router]);

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      {LANGUAGES.map((lang, index) => (
        <span key={lang.code} className="flex items-center">
          <button
            onClick={() => changeLocale(lang.code)}
            className={cn(
              'transition-colors',
              locale === lang.code
                ? 'text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {lang.nativeName}
          </button>
          {index < LANGUAGES.length - 1 && (
            <span className="mx-2 text-muted-foreground/50">|</span>
          )}
        </span>
      ))}
    </div>
  );
}
