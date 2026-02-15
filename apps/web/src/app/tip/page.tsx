'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther, maxUint256 } from 'viem';
import { CONTRACT_ADDRESSES } from '@/lib/web3';
import { CLAWDOGE_ABI, AGENT_REGISTRY_ABI } from '@/lib/abis';
import { useLanguage } from '@/components/providers/LanguageProvider';

const PREDEFINED_AMOUNTS = [10, 50, 100, 500, 1000];

function formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
}

function formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function TipPageContent() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const agentId = searchParams.get('agentId') || '';
    const agentNameFromUrl = searchParams.get('name') || '';

    const { address, isConnected } = useAccount();
    const [amount, setAmount] = useState<number>(100);
    const [tipStatus, setTipStatus] = useState<'idle' | 'approving' | 'tipping' | 'success' | 'error'>('idle');

    // 从链上读取 Agent 信息
    const { data: agentData } = useReadContract({
        address: CONTRACT_ADDRESSES.AGENT_REGISTRY as `0x${string}`,
        abi: AGENT_REGISTRY_ABI,
        functionName: 'getAgent',
        args: agentId ? [agentId] : undefined,
    });

    // 读取用户 CLAWDOGE 余额
    const { data: userBalance } = useReadContract({
        address: CONTRACT_ADDRESSES.CLAWDOGE as `0x${string}`,
        abi: CLAWDOGE_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
    });

    // 读取用户对 AgentRegistry 的 allowance
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: CONTRACT_ADDRESSES.CLAWDOGE as `0x${string}`,
        abi: CLAWDOGE_ABI,
        functionName: 'allowance',
        args: address ? [address, CONTRACT_ADDRESSES.AGENT_REGISTRY as `0x${string}`] : undefined,
    });

    // Approve 交易
    const { writeContract: writeApprove, data: approveHash, isPending: isApprovePending } = useWriteContract();
    const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

    // Tip 交易
    const { writeContract: writeTip, data: tipHash, isPending: isTipPending } = useWriteContract();
    const { isLoading: isTipConfirming, isSuccess: isTipSuccess } = useWaitForTransactionReceipt({ hash: tipHash });

    // 解析 Agent 数据
    const agent = agentData as { agentId: string; displayName: string; wallet: string; totalReceived: bigint; tipCount: bigint; isActive: boolean } | undefined;
    const agentWallet = agent?.wallet;
    const agentName = agent?.displayName || agentNameFromUrl || agentId;
    const isRegistered = agent?.isActive && agentWallet && agentWallet !== '0x0000000000000000000000000000000000000000';

    // 检查是否需要 approve
    const tipAmount = parseEther(amount.toString());
    const needsApproval = allowance !== undefined && (allowance as bigint) < tipAmount;

    // Approve 成功后自动发起 tip
    useEffect(() => {
        if (isApproveSuccess) {
            refetchAllowance();
            setTipStatus('tipping');
            writeTip({
                address: CONTRACT_ADDRESSES.AGENT_REGISTRY as `0x${string}`,
                abi: AGENT_REGISTRY_ABI,
                functionName: 'tip',
                args: [agentId, tipAmount],
            });
        }
    }, [isApproveSuccess]);

    // Tip 成功
    useEffect(() => {
        if (isTipSuccess) setTipStatus('success');
    }, [isTipSuccess]);

    const handleTip = async () => {
        if (!isConnected || !address || !isRegistered || !agentWallet) return;
        if (amount <= 0) return;
        if (userBalance && (userBalance as bigint) < tipAmount) return;

        if (needsApproval) {
            setTipStatus('approving');
            writeApprove({
                address: CONTRACT_ADDRESSES.CLAWDOGE as `0x${string}`,
                abi: CLAWDOGE_ABI,
                functionName: 'approve',
                args: [CONTRACT_ADDRESSES.AGENT_REGISTRY as `0x${string}`, maxUint256],
            });
        } else {
            setTipStatus('tipping');
            writeTip({
                address: CONTRACT_ADDRESSES.AGENT_REGISTRY as `0x${string}`,
                abi: AGENT_REGISTRY_ABI,
                functionName: 'tip',
                args: [agentId, tipAmount],
            });
        }
    };

    const loading = isApprovePending || isApproveConfirming || isTipPending || isTipConfirming;
    const statusText = isApprovePending ? t('tip', 'confirmApproval')
        : isApproveConfirming ? t('tip', 'approvalConfirming')
            : isTipPending ? t('tip', 'confirmTipInWallet')
                : isTipConfirming ? t('tip', 'tipConfirming')
                    : '';

    if (!agentId) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center">
                    <div className="text-5xl mb-4">🐕</div>
                    <h1 className="text-xl font-bold text-white mb-2">{t('tip', 'noAgentId')}</h1>
                </div>
            </div>
        );
    }

    if (tipStatus === 'success') {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h1 className="text-2xl font-bold text-white mb-2">{t('tip', 'tipSuccess')}</h1>
                    <p className="text-zinc-400 mb-4">
                        <span className="text-orange-400">{agentName}</span> → <span className="text-yellow-400">{formatNumber(amount)} $CLAWDOGE</span>
                    </p>
                    {tipHash && (
                        <a
                            href={`https://explorer.monad.xyz/tx/${tipHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-orange-400 hover:text-orange-300 underline mb-4 block"
                        >
                            {t('tip', 'viewTx')}
                        </a>
                    )}
                    <div className="flex gap-4">
                        <button
                            onClick={() => setTipStatus('idle')}
                            className="flex-1 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors"
                        >
                            {t('tip', 'confirmTip')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">🐕</span>
                    <div>
                        <h1 className="text-xl font-bold text-white">{t('tip', 'title')}</h1>
                        <p className="text-sm text-zinc-500">Clawboard</p>
                    </div>
                </div>

                {/* Agent Info */}
                <div className="bg-zinc-800/50 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-xl">
                            {agentName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-white">{agentName}</h2>
                            {isRegistered ? (
                                <p className="text-sm text-zinc-400 font-mono">{formatAddress(agentWallet)}</p>
                            ) : (
                                <p className="text-sm text-yellow-500">⚠️ {t('tip', 'notRegistered')}</p>
                            )}
                        </div>
                        {agent && agent.totalReceived > BigInt(0) && (
                            <div className="text-right">
                                <p className="text-xs text-zinc-500">{t('tip', 'totalReceived')}</p>
                                <p className="text-orange-400 font-semibold">
                                    {formatNumber(Number(formatEther(agent.totalReceived)))}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Amount Selection */}
                <div className="mb-4">
                    <label className="text-sm text-zinc-400 mb-2 block">{t('tip', 'tipAmount')}</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {PREDEFINED_AMOUNTS.map((presetAmount) => (
                            <button
                                key={presetAmount}
                                onClick={() => setAmount(presetAmount)}
                                className={`px-4 py-2 rounded-lg border transition-all ${amount === presetAmount
                                    ? 'border-orange-500 bg-orange-500/20 text-orange-400'
                                    : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
                                    }`}
                            >
                                {formatNumber(presetAmount)}
                            </button>
                        ))}
                    </div>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                    {userBalance && (
                        <p className="text-xs text-zinc-500 mt-2">
                            {t('tip', 'yourBalance')}: {formatNumber(Number(formatEther(userBalance as bigint)))} $CLAWDOGE
                        </p>
                    )}
                </div>

                {/* Wallet Status */}
                <div className="mb-6">
                    {isConnected && address ? (
                        <div className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-green-400 text-sm">{t('common', 'connected')}</span>
                            <span className="text-zinc-400 text-sm font-mono ml-auto">{formatAddress(address)}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                            <span className="text-yellow-400 text-sm">⚠️ {t('tip', 'connectWalletFirst')}</span>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleTip}
                    disabled={!isConnected || !isRegistered || loading || amount <= 0}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-yellow-500 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-opacity flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>{statusText || t('common', 'processing')}</span>
                        </>
                    ) : (
                        <>
                            <span>🐕</span>
                            <span>{needsApproval ? t('tip', 'approveAndTip') : t('tip', 'confirmTip')} {formatNumber(amount)} $CLAWDOGE</span>
                        </>
                    )}
                </button>

                {/* Tips */}
                <div className="mt-4 p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl">
                    <p className="text-xs text-zinc-400">{t('tip', 'tipNote')}</p>
                </div>
            </div>
        </div>
    );
}

export default function TipPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent" />
            </div>
        }>
            <TipPageContent />
        </Suspense>
    );
}
