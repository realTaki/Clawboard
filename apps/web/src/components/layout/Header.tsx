'use client';

import Link from 'next/link';
import { ConnectWalletButton } from '@/components/wallet/ConnectWalletButton';
import { Trophy, LinkIcon, Vault, Globe } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

export function Header() {
    const { locale, setLocale, t } = useLanguage();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-3xl">🐕</span>
                        <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 
                           bg-clip-text text-transparent">
                            Clawboard
                        </span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            href="/leaderboard"
                            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                        >
                            <Trophy className="w-4 h-4" />
                            {t('header', 'leaderboard')}
                        </Link>
                        <Link
                            href="/bind"
                            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                        >
                            <LinkIcon className="w-4 h-4" />
                            {t('header', 'bindAgent')}
                        </Link>
                        <Link
                            href="/vault"
                            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                        >
                            <Vault className="w-4 h-4" />
                            {t('header', 'vault')}
                        </Link>
                    </nav>

                    {/* Right: Language Toggle + Wallet */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 
                                       hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700 
                                       rounded-lg transition-all duration-200"
                            title={locale === 'en' ? 'Switch to Chinese' : '切换到英文'}
                        >
                            <Globe className="w-3.5 h-3.5" />
                            {locale === 'en' ? '中文' : 'EN'}
                        </button>
                        <ConnectWalletButton />
                    </div>
                </div>
            </div>
        </header>
    );
}
