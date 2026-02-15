'use client';

import { useState } from 'react';

export default function Vault() {
  const [activeTab, setActiveTab] = useState<'mint' | 'redeem'>('mint');
  const [amount, setAmount] = useState('');
  const [vaultStats] = useState({
    netValue: 1250000,
    totalSupply: 125000000,
    currentPrice: 0.01,
    yourBalance: 5000,
    yourValue: 50,
  });

  const handleMint = () => {
    alert('Mint functionality would connect to ClawVault contract');
  };

  const handleRedeem = () => {
    alert('Redeem functionality would connect to ClawVault contract');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <a href="/" className="text-purple-100 hover:text-white transition">
            ← Back to Home
          </a>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              🏦 Vault Dashboard
            </h1>
            <p className="text-xl text-purple-100">
              Mint and redeem $CLAWDOGE tokens with USDC collateral
            </p>
          </div>

          {/* Vault Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <StatCard
              label="Vault Net Value"
              value={`$${vaultStats.netValue.toLocaleString()}`}
              subtitle="Total USDC"
            />
            <StatCard
              label="Total Supply"
              value={vaultStats.totalSupply.toLocaleString()}
              subtitle="$CLAWDOGE"
            />
            <StatCard
              label="Current Price"
              value={`$${vaultStats.currentPrice}`}
              subtitle="per token"
            />
          </div>

          {/* Your Position */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Your Position</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-purple-200 text-sm mb-1">Balance</div>
                <div className="text-3xl font-bold text-white">
                  {vaultStats.yourBalance.toLocaleString()} $CLAWDOGE
                </div>
              </div>
              <div>
                <div className="text-purple-200 text-sm mb-1">Value</div>
                <div className="text-3xl font-bold text-white">
                  ${vaultStats.yourValue.toLocaleString()} USDC
                </div>
              </div>
            </div>
          </div>

          {/* Mint/Redeem Interface */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
            {/* Tabs */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setActiveTab('mint')}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
                  activeTab === 'mint'
                    ? 'bg-white text-purple-600'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Mint Tokens
              </button>
              <button
                onClick={() => setActiveTab('redeem')}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
                  activeTab === 'redeem'
                    ? 'bg-white text-purple-600'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Redeem Tokens
              </button>
            </div>

            {/* Mint Form */}
            {activeTab === 'mint' && (
              <div>
                <div className="mb-6">
                  <label className="block text-purple-100 text-sm mb-2">
                    USDC Amount
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
                  />
                </div>
                {amount && (
                  <div className="mb-6 p-4 bg-white/5 rounded-lg">
                    <div className="flex justify-between text-purple-100 mb-2">
                      <span>You will receive:</span>
                      <span className="font-bold text-white">
                        ~{(parseFloat(amount) / vaultStats.currentPrice).toFixed(2)} $CLAWDOGE
                      </span>
                    </div>
                  </div>
                )}
                <button
                  onClick={handleMint}
                  disabled={!amount}
                  className="w-full bg-white text-purple-600 font-semibold py-3 px-6 rounded-lg hover:bg-purple-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mint $CLAWDOGE
                </button>
              </div>
            )}

            {/* Redeem Form */}
            {activeTab === 'redeem' && (
              <div>
                <div className="mb-6">
                  <label className="block text-purple-100 text-sm mb-2">
                    $CLAWDOGE Amount
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
                  />
                </div>
                {amount && (
                  <div className="mb-6 p-4 bg-white/5 rounded-lg">
                    <div className="flex justify-between text-purple-100 mb-2">
                      <span>You will receive:</span>
                      <span className="font-bold text-white">
                        ~{(parseFloat(amount) * vaultStats.currentPrice).toFixed(2)} USDC
                      </span>
                    </div>
                    <div className="text-xs text-purple-200 mt-2">
                      * 11.1% transfer tax applies (4.2% treasury + 6.9% burn)
                    </div>
                  </div>
                )}
                <button
                  onClick={handleRedeem}
                  disabled={!amount}
                  className="w-full bg-white text-purple-600 font-semibold py-3 px-6 rounded-lg hover:bg-purple-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Redeem USDC
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <p className="text-purple-100 text-sm">
              Connect your wallet to interact with the vault
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subtitle }: { label: string; value: string; subtitle: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
      <div className="text-purple-200 text-sm mb-2">{label}</div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-purple-200 text-xs">{subtitle}</div>
    </div>
  );
}
