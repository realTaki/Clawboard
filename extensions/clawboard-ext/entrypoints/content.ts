// Clawboard Extension - Content Script for Moltbook
// 在 Moltbook Agent 页面注入打赏按钮，点击后跳转到主站打赏页

import { fetchAgentInfo } from '../lib/api';
import { CONFIG, Agent } from '../lib/config';
import { browser } from 'wxt/browser';
import { t, Locale } from '../lib/i18n';

let currentLocale: Locale = 'en';

export default defineContentScript({
  matches: ['https://www.moltbook.com/*', 'https://moltbook.com/*'],
  runAt: 'document_idle',

  async main() {
    console.log('🐕 Clawboard extension loaded on Moltbook!');

    // 初始化语言
    const stored = await browser.storage.local.get(['locale']);
    currentLocale = (stored.locale as Locale) || 'en';

    // 监听语言变化
    browser.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.locale) {
        currentLocale = changes.locale.newValue as Locale;
        updateAllButtons();
      }
    });

    const url = window.location.href;
    const match = url.match(/moltbook\.com\/u\/([^\/\?]+)/);

    if (match && match[1]) {
      await injectAgentPageButton(match[1]);
    }

    // 监听 URL 变化（SPA 路由切换）
    let lastUrl = window.location.href;
    const observer = new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        const newMatch = lastUrl.match(/moltbook\.com\/u\/([^\/\?]+)/);
        if (newMatch && newMatch[1]) {
          // 清除旧按钮
          document.getElementById('clawboard-tip-btn')?.remove();
          injectAgentPageButton(newMatch[1]);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  },
});

async function injectAgentPageButton(agentId: string) {
  console.log(`🔍 Looking up agent on chain: ${agentId}`);

  // 从链上查询 Agent 信息
  const agent = await fetchAgentInfo(agentId);

  const headerArea = document.querySelector('h1, [class*="username"], [class*="display-name"]');

  if (!headerArea) {
    setTimeout(() => injectAgentPageButton(agentId), 1000);
    return;
  }

  if (document.getElementById('clawboard-tip-btn')) return;

  const tipButton = createTipButton(agentId, agent);
  headerArea.parentElement?.appendChild(tipButton);
}

function createTipButton(agentId: string, agent: Agent | null): HTMLElement {
  const container = document.createElement('div');
  container.id = 'clawboard-tip-btn';

  // 保存 agent 数据到 dataset 以便更新时使用
  container.dataset.agentId = agentId;
  container.dataset.agentData = agent ? JSON.stringify(agent) : '';

  updateButtonContent(container, agentId, agent);

  return container;
}

function updateButtonContent(container: HTMLElement, agentId: string, agent: Agent | null) {
  // 构建跳转 URL
  const tipUrl = `${CONFIG.MAIN_SITE_URL}/tip?agentId=${encodeURIComponent(agentId)}${agent ? `&name=${encodeURIComponent(agent.displayName)}` : ''}`;

  const isRegistered = agent !== null && agent.isActive;

  container.innerHTML = `
    <style>
      #clawboard-tip-btn { 
        display: inline-block;
        margin-left: 8px;
        vertical-align: middle;
      }
      .clawboard-btn {
        display: inline-flex; 
        align-items: center; 
        gap: 6px;
        padding: 6px 14px;
        background: #1a1a1b;
        border: 1px solid #343536;
        border-radius: 20px;
        color: #d7dadc;
        font-weight: 500; 
        font-size: 12px;
        cursor: pointer; 
        transition: all 0.15s ease;
        text-decoration: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .clawboard-btn:hover { 
        background: #272729;
        border-color: #ff4500;
        color: #ff4500;
      }
      .clawboard-btn:active {
        transform: scale(0.98);
      }
      .clawboard-btn.registered {
        border-color: #f97316;
      }
      .clawboard-icon {
        font-size: 14px;
        line-height: 1;
      }
      .clawboard-text {
        color: inherit;
      }
      .clawboard-badge {
        display: inline-flex;
        align-items: center;
        padding: 2px 6px;
        background: rgba(249, 115, 22, 0.15);
        border-radius: 10px;
        font-size: 10px;
        color: #f97316;
        font-weight: 600;
      }
    </style>
    <a href="${tipUrl}" target="_blank" class="clawboard-btn ${isRegistered ? 'registered' : ''}">
      <span class="clawboard-icon">🐕</span>
      <span class="clawboard-text">${t(currentLocale, 'leaderboard', 'tipOnMoltbook')}</span>
      ${isRegistered && agent.totalReceived !== '0' ? `<span class="clawboard-badge">${agent.totalReceived}</span>` : ''}
      ${!isRegistered ? `<span class="clawboard-badge" style="color:#666">${t(currentLocale, 'tip', 'unregistered')}</span>` : ''}
    </a>
  `;
}

function updateAllButtons() {
  const btn = document.getElementById('clawboard-tip-btn');
  if (btn) {
    const agentId = btn.dataset.agentId;
    const agentDataStr = btn.dataset.agentData;
    if (agentId) {
      const agent = agentDataStr ? JSON.parse(agentDataStr) : null;
      updateButtonContent(btn, agentId, agent);
    }
  }
}
