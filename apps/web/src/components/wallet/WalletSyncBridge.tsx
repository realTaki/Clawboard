'use client';

import { useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { CONTRACT_ADDRESSES } from '@/lib/web3';
import { CLAWDOGE_ABI, AGENT_REGISTRY_ABI } from '@/lib/abis';

// 这个组件用于将钱包状态同步到浏览器插件
export function WalletSyncBridge() {
    const { address, isConnected } = useAccount();

    // 读取用户 CLAWDOGE 余额
    const { data: clawdogeBalance } = useReadContract({
        address: CONTRACT_ADDRESSES.CLAWDOGE as `0x${string}`,
        abi: CLAWDOGE_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
    });

    // 读取用户绑定的 Agent（通过反向映射）
    const { data: agentHash } = useReadContract({
        address: CONTRACT_ADDRESSES.AGENT_REGISTRY as `0x${string}`,
        abi: AGENT_REGISTRY_ABI,
        functionName: 'walletToAgent',
        args: address ? [address] : undefined,
    });

    useEffect(() => {
        const balance = clawdogeBalance
            ? Number(formatEther(clawdogeBalance as bigint)).toLocaleString(undefined, { maximumFractionDigits: 2 })
            : '0';

        const hasAgent = agentHash && agentHash !== '0x0000000000000000000000000000000000000000000000000000000000000000';

        // 向插件发送钱包状态
        const syncToExtension = () => {
            window.postMessage({
                type: 'CLAWBOARD_WALLET_SYNC',
                data: {
                    connected: isConnected,
                    address: address || null,
                    balance,
                    hasAgent: !!hasAgent,
                }
            }, '*');
        };

        // 立即同步一次
        syncToExtension();

        // 每5秒同步一次
        const interval = setInterval(syncToExtension, 5000);

        return () => clearInterval(interval);
    }, [address, isConnected, clawdogeBalance, agentHash]);

    // 这个组件不渲染任何内容
    return null;
}
