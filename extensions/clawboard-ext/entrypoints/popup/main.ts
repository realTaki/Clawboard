import './style.css';
import { browser } from 'wxt/browser';
import { t, Locale } from '../../lib/i18n';

const app = document.getElementById('app')!;

const CONFIG = {
  MAIN_SITE_URL: 'https://clawboard-mon.vercel.app',
};

interface WalletData {
  connected: boolean;
  address: string | null;
  balance?: string;
  hasAgent?: boolean;
}

let currentLocale: Locale = 'en';

// 获取语言设置
async function getLocale(): Promise<Locale> {
  const stored = await browser.storage.local.get(['locale']);
  return (stored.locale as Locale) || 'en';
}

// 切换语言
async function toggleLocale() {
  currentLocale = currentLocale === 'en' ? 'zh' : 'en';
  await browser.storage.local.set({ locale: currentLocale });
  render();
}

// 从 storage 获取钱包状态
async function getWalletData(): Promise<WalletData> {
  try {
    const stored = await browser.storage.local.get([
      'walletAddress',
      'walletBalance',
      'hasAgent',
    ]) as {
      walletAddress?: string;
      walletBalance?: string;
      hasAgent?: boolean;
    };

    if (stored.walletAddress) {
      return {
        connected: true,
        address: stored.walletAddress,
        balance: stored.walletBalance || '0',
        hasAgent: stored.hasAgent || false,
      };
    }

    return { connected: false, address: null };
  } catch {
    return { connected: false, address: null };
  }
}

// 尝试通过向当前标签页发消息来获取钱包状态
async function fetchWalletFromPage(): Promise<WalletData> {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id) {
      return { connected: false, address: null };
    }

    const response = await browser.tabs.sendMessage(tab.id, { type: 'GET_WALLET_STATUS' }) as (WalletData & { locale?: Locale }) | undefined;

    if (response?.locale) {
      currentLocale = response.locale;
      await browser.storage.local.set({ locale: currentLocale });
    }

    if (response?.connected && response?.address) {
      await browser.storage.local.set({
        walletAddress: response.address,
        walletBalance: response.balance || '0',
        hasAgent: response.hasAgent || false,
      });

      return response;
    }

    return { connected: false, address: null };
  } catch {
    return { connected: false, address: null };
  }
}

// 格式化地址
function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// 连接钱包（打开主站）
function connectWallet() {
  window.open(`${CONFIG.MAIN_SITE_URL}?connect=true`, '_blank');
}

// 断开连接
async function disconnectWallet() {
  await browser.storage.local.remove(['walletAddress', 'walletBalance', 'hasAgent']);
  render();
}

// 渲染 UI
async function render() {
  // 获取语言（如果是首次渲染）
  if (!currentLocale) {
    currentLocale = await getLocale();
  }

  // 先显示加载状态
  if (!app.innerHTML) {
    app.innerHTML = `
      <div class="popup">
        <div class="header">
          <div class="logo">
            <span class="logo-icon">🐕</span>
            <span class="logo-text">Clawboard</span>
          </div>
        </div>
        <div class="loading">
          <div class="spinner"></div>
          <p>${t(currentLocale, 'common', 'loading')}</p>
        </div>
      </div>
    `;
  }

  // 获取钱包数据
  let wallet = await getWalletData();

  // 如果没有缓存，尝试从页面获取
  if (!wallet.connected) {
    wallet = await fetchWalletFromPage();
  }

  app.innerHTML = `
    <div class="popup">
      <!-- Header -->
      <div class="header">
        <div class="logo">
          <span class="logo-icon">🐕</span>
          <span class="logo-text">Clawboard</span>
        </div>
        <div class="actions">
            <button id="lang-btn" class="lang-btn" title="Switch Language">
                ${currentLocale === 'en' ? '中文' : 'EN'}
            </button>
            <div class="version">v1.0.0</div>
        </div>
      </div>
      
      <!-- Wallet Status -->
      <div class="wallet-section">
        ${wallet.connected && wallet.address ? `
          <div class="wallet-connected">
            <div class="wallet-info">
              <div class="wallet-status">
                <span class="status-dot"></span>
                <span>${t(currentLocale, 'common', 'connected')}</span>
              </div>
              <div class="wallet-address">${formatAddress(wallet.address)}</div>
            </div>
            <button class="disconnect-btn" id="disconnect-btn">${t(currentLocale, 'common', 'disconnect')}</button>
          </div>
          <div class="balance-card">
            <div class="balance-label">$CLAWDOGE ${t(currentLocale, 'common', 'balance')}</div>
            <div class="balance-value">${wallet.balance || '0'}</div>
          </div>
          <div class="agent-status">
            ${wallet.hasAgent
        ? `<span class="agent-badge registered">✅ ${t(currentLocale, 'bind', 'boundShort')}</span>`
        : `<span class="agent-badge not-registered">⚠️ ${t(currentLocale, 'bind', 'agentNotBound')}</span>`}
          </div>
        ` : `
          <div class="wallet-not-connected">
            <div class="wallet-icon">👛</div>
            <p>${t(currentLocale, 'common', 'connectWallet')}</p>
            <button class="connect-btn" id="connect-btn">${t(currentLocale, 'common', 'connectWallet')}</button>
            <p class="hint">${currentLocale === 'en' ? 'Connect to tip on Moltbook' : '连接后可在 Moltbook 上打赏'}</p>
          </div>
        `}
      </div>
      
      <!-- Actions -->
      <div class="actions-section">
        <a href="${CONFIG.MAIN_SITE_URL}" target="_blank" class="action-btn primary">
          <span>🏠</span>
          <span>${currentLocale === 'en' ? 'Visit Clawboard' : '访问 Clawboard'}</span>
        </a>
        <div class="action-grid">
          <a href="${CONFIG.MAIN_SITE_URL}/leaderboard" target="_blank" class="action-btn small">
            <span>🏆</span>
            <span>${t(currentLocale, 'header', 'leaderboard')}</span>
          </a>
          <a href="${CONFIG.MAIN_SITE_URL}/bind" target="_blank" class="action-btn small">
            <span>🔗</span>
            <span>${t(currentLocale, 'header', 'bindAgent')}</span>
          </a>
          <a href="${CONFIG.MAIN_SITE_URL}/vault" target="_blank" class="action-btn small">
            <span>🏦</span>
            <span>${t(currentLocale, 'header', 'vault')}</span>
          </a>
          <a href="https://www.moltbook.com" target="_blank" class="action-btn small">
            <span>🤖</span>
            <span>Moltbook</span>
          </a>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="footer">
        <p>${currentLocale === 'en' ? 'Tip Agents on Moltbook with $CLAWDOGE' : '在 Moltbook 上给 Agent 打赏 $CLAWDOGE'}</p>
      </div>
    </div>
  `;

  // 绑定事件
  document.getElementById('connect-btn')?.addEventListener('click', connectWallet);
  document.getElementById('disconnect-btn')?.addEventListener('click', disconnectWallet);
  document.getElementById('lang-btn')?.addEventListener('click', toggleLocale);
}

// 初始化
getLocale().then(l => {
  currentLocale = l;
  render();
});
