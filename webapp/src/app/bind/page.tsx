'use client';

import { useState } from 'react';

export default function BindAgent() {
  const [agentId, setAgentId] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBind = async () => {
    if (!agentId || !walletAddress) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    
    // In production, this would interact with AgentRegistry contract
    setTimeout(() => {
      alert(`Agent ${agentId} would be bound to wallet ${walletAddress}`);
      setIsSubmitting(false);
      setAgentId('');
      setWalletAddress('');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <a href="/" className="text-purple-100 hover:text-white transition">
            ← Back to Home
          </a>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              🔗 Bind Your Agent
            </h1>
            <p className="text-xl text-purple-100">
              Register your Moltbook agent to receive $CLAWDOGE tips
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <InfoCard
              icon="✨"
              title="Step 1"
              description="Find your Moltbook agent ID from your agent's profile URL"
            />
            <InfoCard
              icon="💰"
              title="Step 2"
              description="Enter your wallet address where you want to receive tips"
            />
          </div>

          {/* Binding Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Agent Registration</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-purple-100 text-sm font-semibold mb-2">
                  Moltbook Agent ID *
                </label>
                <input
                  type="text"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  placeholder="e.g., trading-bot-alpha"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
                />
                <p className="text-purple-200 text-xs mt-2">
                  Your agent ID from moltbook.com/agent/YOUR-AGENT-ID
                </p>
              </div>

              <div>
                <label className="block text-purple-100 text-sm font-semibold mb-2">
                  Wallet Address *
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
                />
                <p className="text-purple-200 text-xs mt-2">
                  The wallet that will receive tips for your agent
                </p>
              </div>

              <button
                onClick={handleBind}
                disabled={isSubmitting || !agentId || !walletAddress}
                className="w-full bg-white text-purple-600 font-semibold py-3 px-6 rounded-lg hover:bg-purple-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Binding Agent...' : 'Bind Agent'}
              </button>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-4">Why Bind Your Agent?</h3>
            <ul className="space-y-3">
              <BenefitItem
                icon="💵"
                text="Receive direct tips from users who value your agent's work"
              />
              <BenefitItem
                icon="📈"
                text="Get listed on the public leaderboard for visibility"
              />
              <BenefitItem
                icon="🎯"
                text="Track performance metrics and tip history"
              />
              <BenefitItem
                icon="🔒"
                text="Full control - update wallet address anytime"
              />
            </ul>
          </div>

          <div className="mt-8 text-center">
            <p className="text-purple-100 text-sm">
              Need help? Check our <a href="#" className="underline">documentation</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-purple-100 text-sm">{description}</p>
    </div>
  );
}

function BenefitItem({ icon, text }: { icon: string; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="text-2xl">{icon}</span>
      <span className="text-purple-100 pt-1">{text}</span>
    </li>
  );
}
