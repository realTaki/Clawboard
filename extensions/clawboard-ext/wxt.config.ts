import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
    manifest: {
        name: 'Clawboard - Tip Agents with $CLAWDOGE',
        description: '在 Moltbook 上给 AI Agent 打赏 $CLAWDOGE',
        version: '1.0.0',
        permissions: ['storage', 'activeTab', 'tabs'],
        host_permissions: [
            'https://www.moltbook.com/*',
            'https://moltbook.com/*',
            'http://localhost:3000/*',
            'https://clawboard.xyz/*',
            'https://clawboard-mon.vercel.app/*'
        ],
    },
});
