'use client';

import { useTranslations } from 'next-intl';

/**
 * Hook to get personality-specific translations for section titles and labels.
 * Use this in any personality component instead of hardcoded strings.
 * 
 * @example
 * const { sections, labels, empty, hero } = usePersonalityTranslations();
 * 
 * // In your component:
 * <h2>{sections.about}</h2>
 * <span>{labels.viewProject}</span>
 */
export function usePersonalityTranslations() {
  const t = useTranslations('personalities');
  
  return {
    // Section titles
    sections: {
      about: t('sections.about'),
      experience: t('sections.experience'),
      education: t('sections.education'),
      projects: t('sections.projects'),
      skills: t('sections.skills'),
      contact: t('sections.contact'),
    },
    
    // UI Labels
    labels: {
      present: t('labels.present'),
      viewProject: t('labels.viewProject'),
      viewOnGithub: t('labels.viewOnGithub'),
      letsTalk: t('labels.letsTalk'),
      sendMessage: t('labels.sendMessage'),
      madeWithLove: t('labels.madeWithLove'),
      website: t('labels.website'),
      email: t('labels.email'),
      phone: t('labels.phone'),
      downloadResume: t('labels.downloadResume'),
      getInTouch: t('labels.getInTouch'),
      viewAllProjects: t('labels.viewAllProjects'),
      viewFullProfile: t('labels.viewFullProfile'),
      connectWithMe: t('labels.connectWithMe'),
      yearsExperience: (count: number) => t('labels.yearsExperience', { count }),
      projectsCompleted: (count: number) => t('labels.projectsCompleted', { count }),
      skillsMastered: (count: number) => t('labels.skillsMastered', { count }),
    },
    
    // Empty state messages
    empty: {
      noProjects: t('empty.noProjects'),
      noExperience: t('empty.noExperience'),
      noEducation: t('empty.noEducation'),
      noSkills: t('empty.noSkills'),
      noContact: t('empty.noContact'),
    },
    
    // Hero section
    hero: {
      hello: t('hero.hello'),
      welcome: t('hero.welcome'),
      scrollDown: t('hero.scrollDown'),
      viewMyWork: t('hero.viewMyWork'),
    },
  };
}

/**
 * Hook to get common UI translations.
 */
export function useCommonTranslations() {
  const t = useTranslations('common');
  
  return {
    save: t('save'),
    cancel: t('cancel'),
    delete: t('delete'),
    edit: t('edit'),
    view: t('view'),
    loading: t('loading'),
    error: t('error'),
    success: t('success'),
    confirm: t('confirm'),
    back: t('back'),
    next: t('next'),
    previous: t('previous'),
    close: t('close'),
    search: t('search'),
    add: t('add'),
    remove: t('remove'),
    upload: t('upload'),
    download: t('download'),
    copy: t('copy'),
    share: t('share'),
    preview: t('preview'),
    publish: t('publish'),
    unpublish: t('unpublish'),
    reset: t('reset'),
    clear: t('clear'),
    optional: t('optional'),
    required: t('required'),
  };
}

/**
 * Hook to get navigation translations.
 */
export function useNavTranslations() {
  const t = useTranslations('nav');
  
  return {
    home: t('home'),
    dashboard: t('dashboard'),
    portfolio: t('portfolio'),
    settings: t('settings'),
    profile: t('profile'),
    logout: t('logout'),
    login: t('login'),
    signup: t('signup'),
    about: t('about'),
    experience: t('experience'),
    education: t('education'),
    projects: t('projects'),
    skills: t('skills'),
    contact: t('contact'),
    layout: t('layout'),
    personality: t('personality'),
  };
}

/**
 * Hook to get auth translations.
 */
export function useAuthTranslations() {
  const t = useTranslations('auth');
  
  return {
    login: t('login'),
    signup: t('signup'),
    logout: t('logout'),
    email: t('email'),
    password: t('password'),
    confirmPassword: t('confirmPassword'),
    forgotPassword: t('forgotPassword'),
    resetPassword: t('resetPassword'),
    noAccount: t('noAccount'),
    hasAccount: t('hasAccount'),
    loginWith: (provider: string) => t('loginWith', { provider }),
    signupWith: (provider: string) => t('signupWith', { provider }),
    orContinueWith: t('orContinueWith'),
    invalidCredentials: t('invalidCredentials'),
    emailSent: t('emailSent'),
    welcomeBack: t('welcomeBack'),
    createAccount: t('createAccount'),
    getStarted: t('getStarted'),
    passwordStrength: {
      weak: t('passwordStrength.weak'),
      fair: t('passwordStrength.fair'),
      good: t('passwordStrength.good'),
      strong: t('passwordStrength.strong'),
      excellent: t('passwordStrength.excellent'),
    },
  };
}

/**
 * Hook to get language switcher translations.
 */
export function useLanguageTranslations() {
  const t = useTranslations('language');
  
  return {
    switch: t('switch'),
    select: t('select'),
    en: t('en'),
    ar: t('ar'),
    fr: t('fr'),
    es: t('es'),
  };
}
