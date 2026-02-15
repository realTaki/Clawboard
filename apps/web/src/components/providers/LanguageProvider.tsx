'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, t, TranslationSection, TranslationEntry } from '@/lib/i18n';

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: <S extends TranslationSection>(section: S, key: TranslationEntry<S>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
    locale: 'en',
    setLocale: () => { },
    t: (section, key) => t('en', section, key),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('en');

    // 从 localStorage 恢复语言设置
    useEffect(() => {
        const saved = localStorage.getItem('clawboard-locale');
        if (saved === 'zh' || saved === 'en') {
            setLocaleState(saved);
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('clawboard-locale', newLocale);
        // 通知插件同步语言
        window.postMessage({ type: 'CLAWBOARD_LOCALE_SYNC', locale: newLocale }, '*');
    };

    const translate = <S extends TranslationSection>(section: S, key: TranslationEntry<S>): string => {
        return t(locale, section, key);
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t: translate }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
