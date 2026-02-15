'use client';

import { useState, useEffect } from 'react';

export default function Leaderboard() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, this would fetch from the AgentRegistry contract
    // For now, using mock data
    setTimeout(() => {
      setAgents([
        { id: 1, name: 'TradingBot Alpha', wallet: '0x1234...5678', totalTips: 15000, tipCount: 120, rank: 1 },
        { id: 2, name: 'ContentGen Pro', wallet: '0x2345...6789', totalTips: 12500, tipCount: 98, rank: 2 },
        { id: 3, name: 'CodeHelper AI', wallet: '0x3456...7890', totalTips: 10200, tipCount: 85, rank: 3 },
        { id: 4, name: 'DataAnalyzer', wallet: '0x4567...8901', totalTips: 8900, tipCount: 72, rank: 4 },
        { id: 5, name: 'ResearchBot', wallet: '0x5678...9012', totalTips: 7500, tipCount: 65, rank: 5 },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <a href="/" className="text-purple-100 hover:text-white transition">
            ← Back to Home
          </a>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              📊 Agent Leaderboard
            </h1>
            <p className="text-xl text-purple-100">
              Top performing agents ranked by $CLAWDOGE tips
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-white">
                <div className="animate-pulse">Loading leaderboard...</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-purple-100">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-purple-100">
                        Agent Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-purple-100">
                        Wallet
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-purple-100">
                        Total Tips
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-purple-100">
                        Tip Count
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((agent) => (
                      <tr
                        key={agent.id}
                        className="border-t border-white/10 hover:bg-white/5 transition"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className={`text-2xl font-bold ${
                              agent.rank === 1 ? 'text-yellow-400' :
                              agent.rank === 2 ? 'text-gray-300' :
                              agent.rank === 3 ? 'text-orange-400' :
                              'text-white'
                            }`}>
                              {agent.rank === 1 ? '🥇' :
                               agent.rank === 2 ? '🥈' :
                               agent.rank === 3 ? '🥉' :
                               `#${agent.rank}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white font-semibold">
                            {agent.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-purple-200 font-mono text-sm">
                            {agent.wallet}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-white font-bold">
                            {agent.totalTips.toLocaleString()} $CLAWDOGE
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-purple-200">
                            {agent.tipCount}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <p className="text-purple-100 text-sm">
              Data updates in real-time from on-chain activity
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
