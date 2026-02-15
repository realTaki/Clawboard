// Clawboard Extension - Content Script for Main Site
// 在主站上运行，用于同步钱包状态到插件

import { browser } from 'wxt/browser';

interface WalletSyncData {
    connected: boolean;
    address: string | null;
    balance?: string;
    hasAgent?: boolean;
}

export default defineContentScript({
    matches: ['http://localhost:3000/*', 'https://clawboard.xyz/*', 'https://clawboard-mon.vercel.app/*'],
    runAt: 'document_idle',

    async main() {
        console.log('🐕 Clawboard extension loaded on main site, listening for wallet & locale sync...');

        // 初始同步语言
        const savedLocale = localStorage.getItem('clawboard-locale');
        if (savedLocale === 'zh' || savedLocale === 'en') {
            await browser.storage.local.set({ locale: savedLocale });
            console.log('🌍 Initial locale synced:', savedLocale);
        }

        // 监听来自页面的 postMessage（主站 WalletSyncBridge / LanguageProvider 组件发送）
        window.addEventListener('message', async (event) => {
            if (event.source !== window) return;

            // 1. 钱包同步
            if (event.data?.type === 'CLAWBOARD_WALLET_SYNC') {
                const data: WalletSyncData = event.data.data;

                if (data.connected && data.address) {
                    await browser.storage.local.set({
                        walletAddress: data.address,
                        walletBalance: data.balance || '0',
                        hasAgent: data.hasAgent || false,
                    });
                    console.log('🔗 Wallet synced:', data.address, 'Balance:', data.balance);
                } else {
                    // 钱包断开
                    const stored = await browser.storage.local.get(['walletAddress']) as { walletAddress?: string };
                    if (stored.walletAddress) {
                        await browser.storage.local.remove(['walletAddress', 'walletBalance', 'hasAgent']);
                        console.log('🔓 Wallet disconnected, cleared storage');
                    }
                }
            }

            // 2. 语言同步
            if (event.data?.type === 'CLAWBOARD_LOCALE_SYNC') {
                const locale = event.data.locale;
                if (locale === 'zh' || locale === 'en') {
                    await browser.storage.local.set({ locale });
                    console.log('🌍 Locale synced:', locale);
                }
            }
        });

        // 监听来自 Popup 的消息请求
        browser.runtime.onMessage.addListener((message: { type: string }, _sender, sendResponse) => {
            if (message.type === 'GET_WALLET_STATUS') {
                browser.storage.local.get(['walletAddress', 'walletBalance', 'hasAgent', 'locale']).then((stored) => {
                    const data = stored as {
                        walletAddress?: string;
                        walletBalance?: string;
                        hasAgent?: boolean;
                        locale?: string;
                    };
                    sendResponse({
                        connected: !!data.walletAddress,
                        address: data.walletAddress || null,
                        balance: data.walletBalance || '0',
                        hasAgent: data.hasAgent || false,
                        locale: data.locale || 'en',
                    });
                });
                return true; // 保持消息通道打开
            }
            return false;
        });

        // 通知页面扩展已准备好
        window.postMessage({ type: 'CLAWBOARD_EXT_READY' }, '*');
    },
});
