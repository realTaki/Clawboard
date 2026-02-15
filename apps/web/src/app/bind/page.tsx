'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { LinkIcon, Wallet, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { CONTRACT_ADDRESSES } from '@/lib/web3';
import { AGENT_REGISTRY_ABI } from '@/lib/abis';
import { useLanguage } from '@/components/providers/LanguageProvider';

type Step = 1 | 2 | 3 | 4;

export default function BindAgentPage() {
    const { t } = useLanguage();
    const { address, isConnected } = useAccount();

    const [step, setStep] = useState<Step>(1);
    const [agentId, setAgentId] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');

    const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    useEffect(() => {
        if (isSuccess) setStep(4);
    }, [isSuccess]);

    useEffect(() => {
        if (writeError) {
            const errMsg = writeError.message || t('bind', 'errBindFailed');
            if (errMsg.includes('Agent already registered')) {
                setError(t('bind', 'errAlreadyRegistered'));
            } else if (errMsg.includes('User rejected') || errMsg.includes('User denied')) {
                setError(t('bind', 'errUserRejected'));
            } else {
                setError(errMsg.slice(0, 100));
            }
            setStep(2);
        }
    }, [writeError]);

    const handleBind = () => {
        if (!address || !agentId || !displayName) return;
        setError('');
        setStep(3);
        writeContract({
            address: CONTRACT_ADDRESSES.AGENT_REGISTRY as `0x${string}`,
            abi: AGENT_REGISTRY_ABI,
            functionName: 'registerAgent',
            args: [agentId, displayName],
        });
    };

    const loading = isPending || isConfirming;

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Wallet className="w-10 h-10 text-orange-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">{t('bind', 'step1Title')}</h2>
                        <p className="text-zinc-400 mb-8">{t('bind', 'step1Desc')}</p>
                        {isConnected ? (
                            <div>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 
                                rounded-lg mb-6">
                                    <CheckCircle className="w-5 h-5" />
                                    {t('common', 'connected')}: {address?.slice(0, 6)}...{address?.slice(-4)}
                                </div>
                                <br />
                                <button
                                    onClick={() => setStep(2)}
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 
                             to-yellow-500 text-white font-semibold rounded-xl hover:from-orange-600 
                             hover:to-yellow-600 transition-all"
                                >
                                    {t('common', 'next')}
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <p className="text-zinc-400">{t('bind', 'connectFirst')}</p>
                        )}
                    </div>
                );

            case 2:
                return (
                    <div>
                        <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <LinkIcon className="w-10 h-10 text-orange-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4 text-center">{t('bind', 'step2Title')}</h2>
                        <p className="text-zinc-400 mb-8 text-center">{t('bind', 'step2Desc')}</p>

                        {error && (
                            <div className="flex items-center gap-2 p-4 bg-red-500/20 text-red-400 rounded-lg mb-6">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    {t('bind', 'agentIdLabel')}
                                </label>
                                <input
                                    type="text"
                                    value={agentId}
                                    onChange={(e) => setAgentId(e.target.value)}
                                    placeholder={t('bind', 'agentIdPlaceholder')}
                                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white 
                             placeholder-zinc-500 focus:outline-none focus:border-orange-500/50"
                                />
                                <p className="text-xs text-zinc-500 mt-1">
                                    {t('bind', 'agentIdHint')}<span className="text-orange-400">{agentId || 'your-id'}</span>
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    {t('bind', 'displayNameLabel')}
                                </label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder={t('bind', 'displayNamePlaceholder')}
                                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white 
                             placeholder-zinc-500 focus:outline-none focus:border-orange-500/50"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 px-6 py-3 border border-zinc-700 text-zinc-300 rounded-xl 
                           hover:bg-zinc-800 transition-colors"
                            >
                                {t('common', 'back')}
                            </button>
                            <button
                                onClick={handleBind}
                                disabled={!agentId || !displayName || loading}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white 
                           font-semibold rounded-xl hover:from-orange-600 hover:to-yellow-600 
                           transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? t('common', 'processing') : t('bind', 'bindOnChain')}
                            </button>
                        </div>

                        <div className="mt-4 p-3 bg-zinc-800/50 rounded-xl">
                            <p className="text-xs text-zinc-500">{t('bind', 'bindingNote')}</p>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 
                            border-t-transparent mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-4">
                            {isPending ? t('bind', 'confirmInWallet') : t('bind', 'confirming')}
                        </h2>
                        <p className="text-zinc-400">
                            {isPending ? t('bind', 'confirmTx') : t('bind', 'txSent')}
                        </p>
                    </div>
                );

            case 4:
                return (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">{t('bind', 'bindSuccess')}</h2>
                        <p className="text-zinc-400 mb-4">
                            <span className="text-orange-400 font-semibold">{displayName}</span>{t('bind', 'agentBound')}
                        </p>
                        {txHash && (
                            <a
                                href={`https://explorer.monad.xyz/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-orange-400 hover:text-orange-300 underline mb-6 block"
                            >
                                {t('bind', 'viewTx')}
                            </a>
                        )}
                        <div className="p-4 bg-zinc-900 rounded-xl mb-8">
                            <p className="text-sm text-zinc-500 mb-1">{t('bind', 'boundWallet')}</p>
                            <p className="font-mono text-white">{address}</p>
                        </div>
                        <div className="flex gap-4 justify-center">
                            <a
                                href="/leaderboard"
                                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white 
                           font-semibold rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all"
                            >
                                {t('header', 'leaderboard')}
                            </a>
                            <button
                                onClick={() => {
                                    setStep(1);
                                    setAgentId('');
                                    setDisplayName('');
                                }}
                                className="px-6 py-3 border border-zinc-700 text-zinc-300 rounded-xl 
                           hover:bg-zinc-800 transition-colors"
                            >
                                {t('bind', 'bindMore')}
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-black py-12">
            <div className="max-w-xl mx-auto px-4">
                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-12">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="flex items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step >= s
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-zinc-800 text-zinc-500'
                                    }`}
                            >
                                {s}
                            </div>
                            {s < 4 && (
                                <div
                                    className={`w-16 h-0.5 ${step > s ? 'bg-orange-500' : 'bg-zinc-800'}`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                    {renderStep()}
                </div>

                {/* Info */}
                <div className="mt-8 p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl">
                    <p className="text-sm text-zinc-500">{t('bind', 'tipNote')}</p>
                </div>
            </div>
        </div>
    );
}
