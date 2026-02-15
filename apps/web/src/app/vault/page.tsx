'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Vault, TrendingUp, TrendingDown, Info, Coins } from 'lucide-react';
import { CONTRACT_ADDRESSES, CLAWDOGE_TOKEN } from '@/lib/web3';
import { CLAWDOGE_ABI, VAULT_ABI } from '@/lib/abis';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function VaultPage() {
    const { t } = useLanguage();
    const { address, isConnected } = useAccount();
    const [activeTab, setActiveTab] = useState<'mint' | 'redeem'>('mint');
    const [amount, setAmount] = useState('');

    // 读取金库信息
    const { data: vaultInfo, refetch: refetchVaultInfo } = useReadContract({
        address: CONTRACT_ADDRESSES.VAULT as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'getVaultInfo',
    });

    // 读取用户 CLAWDOGE 余额
    const { data: userBalance, refetch: refetchBalance } = useReadContract({
        address: CONTRACT_ADDRESSES.CLAWDOGE as `0x${string}`,
        abi: CLAWDOGE_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
    });

    // 计算铸造输出
    const { data: mintOutput } = useReadContract({
        address: CONTRACT_ADDRESSES.VAULT as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'calculateMintOutput',
        args: amount ? [parseEther(amount)] : undefined,
    });

    // 计算赎回输出
    const { data: redeemOutput } = useReadContract({
        address: CONTRACT_ADDRESSES.VAULT as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'calculateRedeemOutput',
        args: amount ? [parseEther(amount)] : undefined,
    });

    // 读取 Allowance
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: CONTRACT_ADDRESSES.CLAWDOGE as `0x${string}`,
        abi: CLAWDOGE_ABI,
        functionName: 'allowance',
        args: address ? [address, CONTRACT_ADDRESSES.VAULT as `0x${string}`] : undefined,
    });

    // Mint 交易
    const { writeContract: writeMint, data: mintHash, isPending: isMintPending } = useWriteContract();
    const { isLoading: isMintConfirming, isSuccess: isMintSuccess } = useWaitForTransactionReceipt({ hash: mintHash });

    // Approve 交易
    const { writeContract: writeApprove, data: approveHash, isPending: isApprovePending } = useWriteContract();
    const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

    // Redeem 交易
    const { writeContract: writeRedeem, data: redeemHash, isPending: isRedeemPending } = useWriteContract();
    const { isLoading: isRedeemConfirming, isSuccess: isRedeemSuccess } = useWaitForTransactionReceipt({ hash: redeemHash });

    // Approve 成功后自动发起 Redeem
    useEffect(() => {
        if (isApproveSuccess && amount && activeTab === 'redeem') {
            refetchAllowance();
            writeRedeem({
                address: CONTRACT_ADDRESSES.VAULT as `0x${string}`,
                abi: VAULT_ABI,
                functionName: 'redeem',
                args: [parseEther(amount)],
            });
        }
    }, [isApproveSuccess]);

    // 交易成功后刷新
    useEffect(() => {
        if (isMintSuccess || isRedeemSuccess) {
            refetchVaultInfo();
            refetchBalance();
            refetchAllowance();
            setAmount('');
        }
    }, [isMintSuccess, isRedeemSuccess]);

    const handleMint = () => {
        if (!amount || !isConnected) return;
        writeMint({
            address: CONTRACT_ADDRESSES.VAULT as `0x${string}`,
            abi: VAULT_ABI,
            functionName: 'mint',
            value: parseEther(amount),
        });
    };

    const handleRedeem = () => {
        if (!amount || !isConnected) return;
        const redeemAmount = parseEther(amount);

        if (!allowance || (allowance as bigint) < redeemAmount) {
            writeApprove({
                address: CONTRACT_ADDRESSES.CLAWDOGE as `0x${string}`,
                abi: CLAWDOGE_ABI,
                functionName: 'approve',
                args: [CONTRACT_ADDRESSES.VAULT as `0x${string}`, BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')],
            });
            return;
        }

        writeRedeem({
            address: CONTRACT_ADDRESSES.VAULT as `0x${string}`,
            abi: VAULT_ABI,
            functionName: 'redeem',
            args: [redeemAmount],
        });
    };

    const formatNum = (val: bigint | undefined) => {
        if (!val) return '0';
        const num = Number(formatEther(val));
        if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
        if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
        return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
    };

    const vaultBalance = vaultInfo ? (vaultInfo as readonly bigint[])[0] : undefined;
    const circulatingSupply = vaultInfo ? (vaultInfo as readonly bigint[])[1] : undefined;
    const maxSupply = vaultInfo ? (vaultInfo as readonly bigint[])[2] : undefined;
    const burned = vaultInfo ? (vaultInfo as readonly bigint[])[3] : undefined;
    const netValue = vaultInfo ? (vaultInfo as readonly bigint[])[4] : undefined;

    const loading = isMintPending || isMintConfirming || isApprovePending || isApproveConfirming || isRedeemPending || isRedeemConfirming;
    const needsApproval = activeTab === 'redeem' && amount && allowance !== undefined &&
        (allowance as bigint) < (amount ? parseEther(amount) : BigInt(0));

    const statusText = isMintPending ? t('vault', 'confirmMint')
        : isMintConfirming ? t('vault', 'mintConfirming')
            : isApprovePending ? t('vault', 'confirmApproval')
                : isApproveConfirming ? t('vault', 'approvalConfirming')
                    : isRedeemPending ? t('vault', 'confirmRedeem')
                        : isRedeemConfirming ? t('vault', 'redeemConfirming')
                            : '';

    return (
        <div className="min-h-screen bg-black py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Vault className="w-8 h-8 text-yellow-400" />
                        <h1 className="text-3xl font-bold text-white">{t('vault', 'title')}</h1>
                    </div>
                    <p className="text-zinc-400">{t('vault', 'subtitle')}</p>
                </div>

                {/* Vault Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                        <p className="text-zinc-500 text-sm">{t('vault', 'vaultBalance')}</p>
                        <p className="text-xl font-bold text-white">{formatNum(vaultBalance)} <span className="text-sm text-zinc-400">MON</span></p>
                    </div>
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                        <p className="text-zinc-500 text-sm">{t('vault', 'circulatingSupply')}</p>
                        <p className="text-xl font-bold text-orange-400">{formatNum(circulatingSupply)}</p>
                    </div>
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                        <p className="text-zinc-500 text-sm">{t('vault', 'netValue')}</p>
                        <p className="text-xl font-bold text-green-400">
                            {netValue ? `${Number(formatEther(netValue)).toFixed(6)}` : '--'} <span className="text-sm text-zinc-400">MON</span>
                        </p>
                    </div>
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                        <p className="text-zinc-500 text-sm">{t('vault', 'totalBurned')}</p>
                        <p className="text-xl font-bold text-red-400">{formatNum(burned)}</p>
                    </div>
                </div>

                {/* User Balance */}
                {isConnected && (
                    <div className="p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-400">{t('common', 'balance')} $CLAWDOGE</p>
                                <p className="text-2xl font-bold text-orange-400">
                                    {userBalance ? formatNum(userBalance as bigint) : '0'}
                                </p>
                            </div>
                            <Coins className="w-8 h-8 text-orange-400/50" />
                        </div>
                    </div>
                )}

                {/* Mint / Redeem Tabs */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="flex border-b border-zinc-800">
                        <button
                            onClick={() => { setActiveTab('mint'); setAmount(''); }}
                            className={`flex-1 py-4 text-center font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'mint'
                                ? 'text-green-400 border-b-2 border-green-400 bg-green-400/5'
                                : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            <TrendingUp className="w-5 h-5" />
                            {t('vault', 'mintTab')} (MON → CLAWDOGE)
                        </button>
                        <button
                            onClick={() => { setActiveTab('redeem'); setAmount(''); }}
                            className={`flex-1 py-4 text-center font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'redeem'
                                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/5'
                                : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            <TrendingDown className="w-5 h-5" />
                            {t('vault', 'redeemTab')} (CLAWDOGE → MON)
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Input */}
                        <div className="mb-4">
                            <label className="text-sm text-zinc-400 mb-2 block">
                                {activeTab === 'mint' ? t('vault', 'youPay') + ' (MON)' : t('vault', 'youBurn') + ' (CLAWDOGE)'}
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.0"
                                className="w-full px-4 py-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-xl
                                           placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                            />
                        </div>

                        {/* Output Preview */}
                        {amount && (
                            <div className="mb-6 p-4 bg-zinc-800/50 rounded-xl">
                                <p className="text-sm text-zinc-500 mb-1">
                                    {activeTab === 'mint' ? t('vault', 'youGet') : t('vault', 'youReceive')}
                                </p>
                                <p className="text-2xl font-bold text-white">
                                    {activeTab === 'mint'
                                        ? `${formatNum(mintOutput as bigint | undefined)} CLAWDOGE`
                                        : `${formatNum(redeemOutput as bigint | undefined)} MON`
                                    }
                                </p>
                                {activeTab === 'redeem' && (
                                    <p className="text-xs text-zinc-500 mt-1">{t('vault', 'redeemTab')} -11.1%</p>
                                )}
                            </div>
                        )}

                        {/* Action Button */}
                        {!isConnected ? (
                            <p className="text-center text-yellow-400 py-4">⚠️ {t('vault', 'connectFirst')}</p>
                        ) : (
                            <button
                                onClick={activeTab === 'mint' ? handleMint : handleRedeem}
                                disabled={!amount || loading}
                                className={`w-full py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2
                                    ${activeTab === 'mint'
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90'
                                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90'
                                    } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>{statusText || t('common', 'processing')}</span>
                                    </>
                                ) : needsApproval ? (
                                    <span>{t('vault', 'approveClawdoge')}</span>
                                ) : (
                                    <span>{activeTab === 'mint' ? t('vault', 'mintClawdoge') : t('vault', 'redeemToMon')}</span>
                                )}
                            </button>
                        )}

                        {/* Success Message */}
                        {(isMintSuccess || isRedeemSuccess) && (
                            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                                <p className="text-sm text-green-400">{t('common', 'txSuccess')}</p>
                            </div>
                        )}

                        {/* Tax Info */}
                        <div className="mt-4 p-3 bg-zinc-800/50 rounded-xl flex items-start gap-2">
                            <Info className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-zinc-500">{t('vault', 'taxNote')}</p>
                        </div>
                    </div>
                </div>

                {/* Max Supply Progress */}
                <div className="mt-8 p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                    <h3 className="text-lg font-semibold text-white mb-4">{t('home', 'maxSupply')}</h3>
                    <div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden mb-2">
                        <div
                            className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transition-all"
                            style={{
                                width: `${circulatingSupply && maxSupply
                                    ? (Number(circulatingSupply) / Number(maxSupply) * 100)
                                    : 0}%`
                            }}
                        />
                    </div>
                    <div className="flex justify-between text-sm text-zinc-500">
                        <span>{t('vault', 'circulatingSupply')}: {formatNum(circulatingSupply)}</span>
                        <span>Max: {formatNum(maxSupply)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
