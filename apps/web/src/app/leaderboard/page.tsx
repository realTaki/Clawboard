'use client';

import { useState, useMemo } from 'react';
import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { Search, Crown, Copy, CheckCircle, ExternalLink, Users } from 'lucide-react';
import { CONTRACT_ADDRESSES } from '@/lib/web3';
import { AGENT_REGISTRY_ABI } from '@/lib/abis';
import { useLanguage } from '@/components/providers/LanguageProvider';

function formatAddress(address: string): string {
    if (!address || address === '0x0000000000000000000000000000000000000000') return '-';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

type AgentInfo = {
    agentId: string;
    displayName: string;
    wallet: string;
    tipCount: bigint;
    registeredAt: bigint;
    isActive: boolean;
};

export default function LeaderboardPage() {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedAddress, setCopiedAddress] = useState<string>('');
    const [page, setPage] = useState(0);
    const pageSize = 20;

    const { data: agentCount } = useReadContract({
        address: CONTRACT_ADDRESSES.AGENT_REGISTRY as `0x${string}`,
        abi: AGENT_REGISTRY_ABI,
        functionName: 'agentCount',
    });

    const { data: leaderboardData, isLoading } = useReadContract({
        address: CONTRACT_ADDRESSES.AGENT_REGISTRY as `0x${string}`,
        abi: AGENT_REGISTRY_ABI,
        functionName: 'getLeaderboard',
        args: [BigInt(page * pageSize), BigInt(pageSize)],
    });

    const agents: AgentInfo[] = leaderboardData
        ? (leaderboardData as AgentInfo[]).filter((a) => a.isActive)
        : [];

    const filteredAgents = useMemo(() => {
        if (!searchQuery) return agents;
        const q = searchQuery.toLowerCase();
        return agents.filter(
            (a) =>
                a.agentId.toLowerCase().includes(q) ||
                a.displayName.toLowerCase().includes(q) ||
                a.wallet.toLowerCase().includes(q)
        );
    }, [agents, searchQuery]);

    const sortedAgents = useMemo(() => {
        return [...filteredAgents].sort((a, b) => {
            // Sort by tip count (descending)
            if (b.tipCount > a.tipCount) return 1;
            if (b.tipCount < a.tipCount) return -1;
            return 0;
        });
    }, [filteredAgents]);

    const totalCount = agentCount ? Number(agentCount) : 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    const copyAddress = (address: string) => {
        navigator.clipboard.writeText(address);
        setCopiedAddress(address);
        setTimeout(() => setCopiedAddress(''), 2000);
    };

    const getRankBadge = (rank: number) => {
        if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
        if (rank === 2) return <Crown className="w-5 h-5 text-zinc-400" />;
        if (rank === 3) return <Crown className="w-5 h-5 text-orange-700" />;
        return <span className="text-zinc-500 font-mono text-sm">#{rank}</span>;
    };

    return (
        <div className="min-h-screen bg-black py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-4xl">🏆</span>
                        <h1 className="text-3xl font-bold text-white">{t('leaderboard', 'title')}</h1>
                    </div>
                    <p className="text-zinc-400 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {t('leaderboard', 'totalAgents')}: <span className="text-orange-400 font-semibold">{totalCount}</span>
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 transform -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder={t('leaderboard', 'searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white 
                                   placeholder-zinc-500 focus:outline-none focus:border-orange-500/50 transition-colors"
                    />
                </div>

                {/* Table */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-zinc-800 text-sm text-zinc-400 font-medium">
                        <div className="col-span-1">#</div>
                        <div className="col-span-5">{t('leaderboard', 'agent')}</div>
                        <div className="col-span-4">{t('leaderboard', 'wallet')}</div>
                        <div className="col-span-2 text-right">{t('leaderboard', 'tipCount')}</div>
                    </div>

                    {isLoading ? (
                        <div className="py-20 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent mx-auto mb-4" />
                            <p className="text-zinc-500">{t('common', 'loading')}</p>
                        </div>
                    ) : sortedAgents.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-4xl mb-4">🐕</p>
                            <p className="text-zinc-400">{t('leaderboard', 'noAgents')}</p>
                            <a href="/bind" className="text-orange-400 text-sm hover:text-orange-300 mt-2 inline-block">
                                {t('header', 'bindAgent')} →
                            </a>
                        </div>
                    ) : (
                        sortedAgents.map((agent, index) => {
                            const rank = page * pageSize + index + 1;
                            return (
                                <div
                                    key={`${agent.agentId}-${index}`}
                                    className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-zinc-800/50 
                                               hover:bg-zinc-800/30 transition-colors items-center"
                                >
                                    <div className="col-span-1 flex items-center">
                                        {getRankBadge(rank)}
                                    </div>
                                    <div className="col-span-5 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 
                                                         rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {agent.displayName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{agent.displayName}</p>
                                            <p className="text-zinc-500 text-xs">@{agent.agentId}</p>
                                        </div>
                                    </div>
                                    <div className="col-span-4 flex items-center gap-2">
                                        <span className="text-zinc-400 text-sm font-mono">
                                            {formatAddress(agent.wallet)}
                                        </span>
                                        <button
                                            onClick={() => copyAddress(agent.wallet)}
                                            className="text-zinc-500 hover:text-white transition-colors"
                                        >
                                            {copiedAddress === agent.wallet ? (
                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                    <div className="col-span-2 text-right text-zinc-300">
                                        {Number(agent.tipCount).toLocaleString()}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <button
                            onClick={() => setPage(Math.max(0, page - 1))}
                            disabled={page === 0}
                            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 
                                       hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {t('leaderboard', 'prev')}
                        </button>
                        <span className="text-zinc-400 text-sm">
                            {page + 1} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                            disabled={page >= totalPages - 1}
                            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 
                                       hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {t('leaderboard', 'nextPage')}
                        </button>
                    </div>
                )}

                {/* CTA */}
                <div className="mt-8 p-6 bg-gradient-to-r from-orange-500/5 to-yellow-500/5 
                                 border border-orange-500/20 rounded-2xl text-center">
                    <a
                        href="/bind"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 
                                    text-white font-semibold rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all"
                    >
                        <ExternalLink className="w-4 h-4" />
                        {t('header', 'bindAgent')}
                    </a>
                </div>
            </div>
        </div>
    );
}
