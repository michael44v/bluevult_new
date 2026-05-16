import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Send, User, Check, ShieldCheck, MoreVertical, Paperclip, Smile } from "lucide-react";

interface Message {
  id: number;
  user: string;
  avatar: string;
  text: string;
  timestamp: string;
  isBot?: boolean;
}

const cryptoDiscussions = [
    { q: "What's the best wallet for long-term storage?", a: "Hardware wallets like Ledger or Trezor are usually the safest for long-term holding." },
    { q: "Anyone think BTC will hit $100k this year?", a: "With institutional adoption increasing, it's definitely a possibility, but market volatility is always there." },
    { q: "What is the difference between Layer 1 and Layer 2?", a: "Layer 1 is the base blockchain (like Ethereum), while Layer 2 is a scaling solution built on top (like Arbitrum)." },
    { q: "Is it a good time to buy ETH?", a: "NFA, but many are bullish on ETH due to its utility in DeFi and NFTs." },
    { q: "How do I avoid phishing scams?", a: "Never share your seed phrase, use 2FA, and always double-check URLs before connecting your wallet." },
    { q: "What are gas fees?", a: "Gas fees are payments made by users to compensate for the computing energy required to process transactions on a blockchain." },
    { q: "What's a 'whale' in crypto?", a: "A whale is an individual or entity that holds a large amount of a specific cryptocurrency, enough to influence price movements." },
    { q: "What is a rug pull?", a: "It's a scam where developers abandon a project and run away with investors' funds." },
    { q: "Should I diversify into altcoins?", a: "Diversification can reduce risk, but make sure to research projects thoroughly before investing." },
    { q: "What is staking?", a: "Staking is locking up your crypto to support a network and earning rewards in return." },
    { q: "What does HODL mean?", a: "It's a misspelling of 'hold' that became a meme, meaning to hold your assets despite market crashes." },
    { q: "What is a decentralized exchange (DEX)?", a: "A DEX is a peer-to-peer marketplace where users trade cryptocurrencies without an intermediary." },
    { q: "Is BlueVult safe for trading?", a: "BlueVult uses high-level encryption and secure servers to protect user data and assets." },
    { q: "What is Proof of Work vs Proof of Stake?", a: "PoW relies on mining (energy-intensive), while PoS relies on staking (more energy-efficient)." },
    { q: "What are stablecoins?", a: "Cryptocurrencies pegged to a stable asset like the US Dollar (e.g., USDT, USDC)." },
    { q: "What is a smart contract?", a: "A self-executing contract with terms directly written into code." },
    { q: "Can I cancel a blockchain transaction?", a: "Generally, no. Once a transaction is confirmed on the blockchain, it's irreversible." },
    { q: "What is market cap?", a: "The total value of a cryptocurrency (Price x Circulating Supply)." },
    { q: "What is the Genesis Block?", a: "The first block ever mined on a blockchain, usually Bitcoin's Block 0." },
    { q: "What is a DAO?", a: "A Decentralized Autonomous Organization, governed by its members through code and voting." },
    { q: "What is 'FOMO'?", a: "Fear Of Missing Out - when people buy an asset because they see others making money." },
    { q: "What is 'FUD'?", a: "Fear, Uncertainty, and Doubt - usually spread to lower the price of an asset." },
    { q: "What are private keys?", a: "A secret code that allows you to access and spend your cryptocurrency. Never share it!" },
    { q: "How do I bridge assets?", a: "Using a bridge protocol to move tokens from one blockchain to another." },
    { q: "What is liquidity mining?", a: "Providing liquidity to a DEX pool to earn rewards in the form of tokens." },
    { q: "What is an NFT?", a: "A Non-Fungible Token, representing unique ownership of a digital or physical item." },
    { q: "What is the Lightning Network?", a: "A second-layer payment protocol built on top of Bitcoin for fast, low-cost transactions." },
    { q: "What is yield farming?", a: "Lending or staking crypto to get high returns or rewards in the form of additional tokens." },
    { q: "What is a hash rate?", a: "The total computational power being used to mine and process transactions on a PoW blockchain." },
    { q: "What are 'moon bags'?", a: "A portion of a crypto investment kept in case the price skyrockets ('goes to the moon')." },
    { q: "What is a cold wallet?", a: "An offline wallet (like hardware or paper) not connected to the internet, making it very secure." },
    { q: "What is a hot wallet?", a: "A wallet connected to the internet, like a mobile app or browser extension." },
    { q: "What is slippage?", a: "The difference between the expected price of a trade and the price at which it is actually executed." },
    { q: "What is 'DeFi'?", a: "Decentralized Finance - financial services built on blockchain technology without traditional banks." },
    { q: "What is 'TVL'?", a: "Total Value Locked - the sum of all assets deposited in a DeFi protocol." },
    { q: "What is 'impermanent loss'?", a: "The temporary loss of funds experienced by liquidity providers due to volatility in a trading pair." },
    { q: "What is an 'airdrop'?", a: "Free distribution of a new cryptocurrency to existing wallet holders." },
    { q: "What is 'rebalancing'?", a: "Adjusting your portfolio to maintain your desired level of risk and diversification." },
    { q: "What is a 'limit order'?", a: "An order to buy or sell at a specific price or better." },
    { q: "What is a 'market order'?", a: "An order to buy or sell immediately at the current market price." },
    { q: "What is 'DYOR'?", a: "Do Your Own Research - always investigate before investing in any crypto project." },
    { q: "What is 'ATH'?", a: "All-Time High - the highest price an asset has ever reached." },
    { q: "What is 'ATL'?", a: "All-Time Low - the lowest price an asset has ever reached." },
    { q: "What is 'burning'?", a: "Permanently removing tokens from circulation to increase scarcity and value." },
    { q: "What is 'mining'?", a: "The process of verifying transactions and adding them to a blockchain in exchange for rewards." },
    { q: "What is a 'node'?", a: "A computer that stores a copy of the blockchain and helps keep the network running." },
    { q: "What is 'Web3'?", a: "The next generation of the internet, decentralized and powered by blockchain." },
    { q: "What is a 'bridge'?", a: "A tool that allows you to transfer assets between different blockchains." },
    { q: "What is 'gas limit'?", a: "The maximum amount of gas you're willing to pay for a transaction." },
    { q: "What is 'Gwei'?", a: "A small unit of Ethereum used to measure gas prices." },
    { q: "What is 'IPFS'?", a: "InterPlanetary File System - a peer-to-peer network for storing and sharing data." },
    { q: "What is 'Layer 0'?", a: "The underlying infrastructure that allows different blockchains to communicate." },
    { q: "What is 'Mainnet'?", a: "The primary blockchain where actual transactions take place." },
    { q: "What is 'Testnet'?", a: "An alternative blockchain used for testing applications before launching on Mainnet." },
    { q: "What is a 'Satoshi'?", a: "The smallest unit of Bitcoin (0.00000001 BTC)." },
    { q: "Who is Satoshi Nakamoto?", a: "The anonymous creator of Bitcoin." },
    { q: "What is a 'whitepaper'?", a: "A document that explains the technology and purpose of a new crypto project." },
    { q: "What is an 'oracle'?", a: "A service that provides real-world data to smart contracts on a blockchain." },
    { q: "What is 'sharding'?", a: "A method of splitting a blockchain into smaller pieces (shards) to improve scalability." },
    { q: "What is 'soft fork'?", a: "A backward-compatible update to a blockchain's protocol." },
    { q: "What is 'hard fork'?", a: "A non-backward-compatible update that splits the blockchain into two." },
    { q: "What is 'proof of authority'?", a: "A consensus mechanism where validators are chosen based on their reputation." },
    { q: "What is 'KYC'?", a: "Know Your Customer - a process of verifying the identity of users." },
    { q: "What is 'AML'?", a: "Anti-Money Laundering - regulations designed to prevent illegal financial activities." },
    { q: "What is 'peer-to-peer' (P2P)?", a: "Direct interaction between two parties without a central authority." },
    { q: "What is 'circulating supply'?", a: "The number of tokens currently available in the market." },
    { q: "What is 'total supply'?", a: "The total number of tokens that will ever exist for a project." },
    { q: "What is 'max supply'?", a: "The absolute maximum number of tokens that can ever be created." },
    { q: "What is 'inflation' in crypto?", a: "The rate at which new tokens are added to the supply." },
    { q: "What is 'deflation' in crypto?", a: "The rate at which tokens are removed from the supply (e.g., through burning)." },
    { q: "What is 'governance token'?", a: "A token that gives holders the right to vote on changes to a protocol." },
    { q: "What is 'liquidity provider' (LP)?", a: "Someone who adds their assets to a trading pool to facilitate trades." },
    { q: "What is 'automated market maker' (AMM)?", a: "A type of DEX protocol that uses mathematical formulas to price assets." },
    { q: "What is 'centralized exchange' (CEX)?", a: "An exchange managed by a company (e.g., Binance, Coinbase)." },
    { q: "What is 'fiat' currency?", a: "Government-issued money like USD, EUR, or GBP." },
    { q: "What is 'volatility'?", a: "The degree of variation in the price of an asset over time." },
    { q: "What is 'bull market'?", a: "A period of rising prices and investor optimism." },
    { q: "What is 'bear market'?", a: "A period of falling prices and investor pessimism." },
    { q: "What is 'sideways market'?", a: "A period when prices stay within a narrow range." },
    { q: "What is 'bagholder'?", a: "Someone who continues to hold an asset that has significantly decreased in value." },
    { q: "What is 'diamond hands'?", a: "Someone who refuses to sell their assets even during market crashes." },
    { q: "What is 'paper hands'?", a: "Someone who sells their assets at the first sign of a price drop." },
    { q: "What is 'to the moon'?", a: "An expression used when a price is expected to rise significantly." },
    { q: "What is 'rekt'?", a: "Slang for 'wrecked' - when someone loses a lot of money in a trade." },
    { q: "What is 'whale watching'?", a: "Monitoring the transactions of large crypto holders." },
    { q: "What is 'altseason'?", a: "A period when altcoins significantly outperform Bitcoin." },
    { q: "What is 'halving'?", a: "An event where the reward for mining new blocks is cut in half (happens to Bitcoin every 4 years)." },
    { q: "What is 'confirmation'?", a: "The process of a transaction being verified by the network." },
    { q: "What is 'block height'?", a: "The number of blocks preceding a specific block on a blockchain." },
    { q: "What is 'block reward'?", a: "The amount of crypto given to a miner who successfully mines a block." },
    { q: "What is 'double spending'?", a: "The risk that a cryptocurrency can be spent twice (prevented by blockchain)." },
    { q: "What is 'multisig'?", a: "A wallet that requires multiple signatures to authorize a transaction." },
    { q: "What is 'paper wallet'?", a: "A physical piece of paper containing your public and private keys." },
    { q: "What is 'seed phrase'?", a: "A series of words used to recover a crypto wallet." },
    { q: "What is '2FA'?", a: "Two-Factor Authentication - an extra layer of security for accounts." },
    { q: "What is 'cold storage'?", a: "Keeping cryptocurrency completely offline." },
    { q: "What is 'escrow'?", a: "A third party that holds funds during a transaction until conditions are met." },
    { q: "What is 'fungibility'?", a: "The property of an asset where each unit is interchangeable (like 1 BTC = 1 BTC)." },
    { q: "What is 'non-fungibility'?", a: "The property where each unit is unique (like an NFT)." },
    { q: "What is 'ledger'?", a: "A record of financial transactions (blockchain is a public ledger)." }
];

const users = [
  "Alice_Crypto", "CryptoWhale", "BlockchainBob", "EthDev_01", "BitcoinMaxi",
  "Satoshi_Disciple", "DeFi_Queen", "NftCollector", "AltcoinHunter", "HodlKing",
  "MoonLover", "SatoshiFan", "ChainLinker", "SolanaSurfer", "Vitalik_Fan",
  "CryptoNewbie", "TradingPro", "Rich_Investor", "Bullish_Boy", "Bear_Market_Survivor"
];

const Community: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialMessages: Message[] = [
      { id: 1, user: "Admin", avatar: "https://i.pravatar.cc/150?u=admin", text: "Welcome to the BlueVult Community Discussion! Feel free to ask anything about crypto.", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isBot: true }
    ];
    setMessages(initialMessages);

    let messageCount = 1;
    const interval = setInterval(() => {
      setMessages((prev) => {
        if (prev.length > 50) return prev.slice(1); // Keep last 50

        const randomQA = cryptoDiscussions[Math.floor(Math.random() * cryptoDiscussions.length)];
        const randomUser1 = users[Math.floor(Math.random() * users.length)];
        const randomUser2 = users[Math.floor(Math.random() * users.length)];

        messageCount++;
        const newMessageQ: Message = {
          id: messageCount,
          user: randomUser1,
          avatar: `https://i.pravatar.cc/150?u=${randomUser1}`,
          text: randomQA.q,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Delay answer slightly
        setTimeout(() => {
          messageCount++;
          const newMessageA: Message = {
            id: messageCount,
            user: randomUser2,
            avatar: `https://i.pravatar.cc/150?u=${randomUser2}`,
            text: randomQA.a,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(current => [...current, newMessageA]);
        }, 2000);

        return [...prev, newMessageQ];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-[#0d1421] text-white flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center pt-32 pb-10 px-4">
        <div className="w-full max-w-3xl bg-[#17212d] border border-[#1a2535] rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[70vh]">
          {/* Chat Header */}
          <div className="bg-[#1e2d3d] p-4 flex items-center justify-between border-b border-[#1a2535]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3861fb] rounded-full flex items-center justify-center font-bold text-white shadow-lg">
                BV
              </div>
              <div>
                <h2 className="font-bold text-white flex items-center gap-1">
                  BlueVult Community <ShieldCheck className="w-4 h-4 text-blue-400" />
                </h2>
                <p className="text-xs text-gray-400">2,481 members, 142 online</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-400">
              <MoreVertical className="w-5 h-5 cursor-pointer hover:text-white" />
            </div>
          </div>

          {/* Messages Area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700"
          >
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.isBot ? "justify-center" : ""}`}>
                {!msg.isBot && (
                  <img src={msg.avatar} alt={msg.user} className="w-10 h-10 rounded-full border border-[#1a2535]" />
                )}
                <div className={`max-w-[80%] ${msg.isBot ? "bg-[#1e2d3d] border border-blue-500/30 rounded-full px-6 py-1 text-xs text-blue-300" : "bg-[#1e2d3d] rounded-2xl rounded-tl-none p-3 border border-[#1a2535]"}`}>
                  {!msg.isBot && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-blue-400">{msg.user}</span>
                      <span className="text-[10px] text-gray-500">{msg.timestamp}</span>
                    </div>
                  )}
                  <p className="text-sm text-gray-200 leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input Mock */}
          <div className="bg-[#1e2d3d] p-4 border-t border-[#1a2535] flex items-center gap-3">
            <Paperclip className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white" />
            <div className="flex-1 bg-[#0d1421] border border-[#1a2535] rounded-full px-4 py-2 flex items-center gap-2">
              <input
                type="text"
                placeholder="Write a message..."
                className="bg-transparent border-none outline-none text-sm w-full"
                readOnly
              />
              <Smile className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white" />
            </div>
            <div className="bg-[#3861fb] p-2 rounded-full cursor-not-allowed">
              <Send className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-gray-500 text-sm">
           <Check className="w-4 h-4" /> This is a live simulation of our active community.
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Community;
