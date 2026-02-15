'use client';

import Link from 'next/link';
import { Trophy, LinkIcon, Vault, Zap, TrendingUp, Users } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-yellow-500/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] 
                        bg-orange-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            {/* Logo */}
            <div className="mb-8 animate-float">
              <span className="text-8xl md:text-9xl">🐕</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="text-white">{t('home', 'heroTitle1')}</span>
              <br />
              <span className="gradient-text">{t('home', 'heroTitle2')}</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
              {t('home', 'heroSubtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/bind"
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 
                           hover:from-orange-600 hover:to-yellow-600 text-white font-bold text-lg rounded-2xl 
                           transition-all duration-200 shadow-lg shadow-orange-500/25 animate-pulse-glow"
              >
                <LinkIcon className="w-5 h-5" />
                {t('home', 'bindYourAgent')}
              </Link>
              <Link
                href="/leaderboard"
                className="flex items-center gap-2 px-8 py-4 border border-zinc-700 hover:border-orange-500/50 
                           text-white font-semibold text-lg rounded-2xl transition-all duration-200 
                           hover:bg-zinc-900"
              >
                <Trophy className="w-5 h-5" />
                {t('home', 'viewLeaderboard')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            <span className="gradient-text">{t('home', 'coreFeatures')}</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-orange-500/50 
                            transition-all duration-300 group">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4 
                              group-hover:bg-orange-500/30 transition-colors">
                <Zap className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t('home', 'feature1Title')}</h3>
              <p className="text-zinc-400 text-sm">{t('home', 'feature1Desc')}</p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-orange-500/50 
                            transition-all duration-300 group">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4 
                              group-hover:bg-yellow-500/30 transition-colors">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t('home', 'feature2Title')}</h3>
              <p className="text-zinc-400 text-sm">{t('home', 'feature2Desc')}</p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-orange-500/50 
                            transition-all duration-300 group">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4 
                              group-hover:bg-orange-500/30 transition-colors">
                <LinkIcon className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t('home', 'feature3Title')}</h3>
              <p className="text-zinc-400 text-sm">{t('home', 'feature3Desc')}</p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-orange-500/50 
                            transition-all duration-300 group">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4 
                              group-hover:bg-yellow-500/30 transition-colors">
                <Vault className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t('home', 'feature4Title')}</h3>
              <p className="text-zinc-400 text-sm">{t('home', 'feature4Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Token Info Section */}
      <section className="py-24 border-t border-zinc-800 bg-gradient-to-b from-zinc-900/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">{t('home', 'tokenMechanism').split(' ')[0]}</span>
              <span className="text-white"> {t('home', 'tokenMechanism').split(' ').slice(1).join(' ')}</span>
            </h2>
            <p className="text-zinc-400">{t('home', 'tokenSubtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Minting */}
            <div className="text-center p-8 bg-zinc-900/30 border border-zinc-800 rounded-3xl">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{t('home', 'mintTitle')}</h3>
              <p className="text-zinc-400 text-sm mb-4">{t('home', 'mintDesc')}</p>
              <p className="text-2xl font-bold text-green-400">2.1B</p>
              <p className="text-zinc-500 text-sm">{t('home', 'maxSupply')}</p>
            </div>

            {/* Transfer Tax */}
            <div className="text-center p-8 bg-zinc-900/30 border border-zinc-800 rounded-3xl">
              <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{t('home', 'transferTax')}</h3>
              <p className="text-zinc-400 text-sm mb-4">{t('home', 'transferTaxDesc')}</p>
              <div className="flex justify-center gap-4">
                <div>
                  <p className="text-2xl font-bold text-orange-400">4.2%</p>
                  <p className="text-zinc-500 text-sm">{t('home', 'team')}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-400">6.9%</p>
                  <p className="text-zinc-500 text-sm">{t('home', 'burn')}</p>
                </div>
              </div>
            </div>

            {/* Redemption */}
            <div className="text-center p-8 bg-zinc-900/30 border border-zinc-800 rounded-3xl">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{t('home', 'redeemTitle')}</h3>
              <p className="text-zinc-400 text-sm mb-4">{t('home', 'redeemDesc')}</p>
              <p className="text-2xl font-bold text-blue-400">11.1%</p>
              <p className="text-zinc-500 text-sm">{t('home', 'redeemTax')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <span className="text-white">{t('home', 'ctaTitle1')}</span>
            <span className="gradient-text">{t('home', 'ctaTitle2')}</span>
          </h2>
          <p className="text-lg text-zinc-400 mb-10">{t('home', 'ctaSubtitle')}</p>
          <Link
            href="/vault"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 
                       hover:from-orange-600 hover:to-yellow-600 text-white font-bold text-lg rounded-2xl 
                       transition-all duration-200 shadow-lg shadow-orange-500/25"
          >
            <Vault className="w-5 h-5" />
            {t('home', 'enterVault')}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐕</span>
              <span className="font-bold gradient-text">Clawboard</span>
            </div>
            <p className="text-zinc-500 text-sm">{t('home', 'footer')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
