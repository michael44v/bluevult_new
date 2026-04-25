import TopBar from '@/components/dashboard/TopBar';
import { useState } from "react";
import { FaBars, FaChevronDown, FaChevronUp } from "react-icons/fa";
import Sidebar from "./dashboardWidgets/Sidebar";
import Footer from "@/components/landing/Footer";

interface QA {
  question: string;
  answer: string;
}

const cryptoQAs: QA[] = [
  { question: "What is Bitcoin?", answer: "Bitcoin is a decentralized cryptocurrency that allows peer-to-peer transactions without intermediaries." },
  { question: "How do I create a crypto wallet?", answer: "You can create a crypto wallet using software wallets, hardware wallets, or online wallets provided by exchanges." },
  { question: "What is Ethereum?", answer: "Ethereum is a decentralized blockchain platform that supports smart contracts and decentralized applications." },
  { question: "How does blockchain work?", answer: "Blockchain is a distributed ledger where transactions are recorded in blocks and linked chronologically using cryptography." },
  { question: "What is DeFi?", answer: "DeFi stands for Decentralized Finance, enabling financial services like lending and trading without intermediaries." },
  { question: "How secure is crypto trading?", answer: "Crypto trading is secure if you use reputable exchanges and enable security measures like 2FA." },
  { question: "What is a smart contract?", answer: "A smart contract is a self-executing program on the blockchain that enforces the rules of an agreement automatically." },
  { question: "How does staking work?", answer: "Staking involves locking up crypto assets to support the network and earn rewards." },
  { question: "What are NFTs?", answer: "NFTs (Non-Fungible Tokens) are unique digital assets representing ownership of digital or physical items." },
  { question: "Can I recover lost crypto?", answer: "Lost crypto cannot be recovered unless you have your private keys or backup seed phrase." },
  { question: "What is BlueVult?", answer: "BlueVult is a crypto platform providing trading, wallets, and portfolio management tools." },
  { question: "How do I deposit funds on BlueVult?", answer: "You can deposit crypto or fiat using the 'Deposit' feature on your wallet dashboard." },
  { question: "How do I withdraw funds from BlueVult?", answer: "Use the 'Withdraw' feature in your wallet to send funds to another wallet or bank account." },
  { question: "Is crypto trading risky?", answer: "Yes, crypto trading is volatile and can result in losses. Always trade responsibly." },
  { question: "What is market capitalization?", answer: "Market capitalization is the total value of a cryptocurrency calculated as price × circulating supply." },
  { question: "What are altcoins?", answer: "Altcoins are all cryptocurrencies other than Bitcoin." },
  { question: "What is liquidity?", answer: "Liquidity is how easily an asset can be bought or sold without affecting its price." },
  { question: "What are trading pairs?", answer: "Trading pairs allow you to trade one cryptocurrency for another on an exchange." },
  { question: "What is an ICO?", answer: "ICO (Initial Coin Offering) is a fundraising method for new crypto projects." },
  { question: "How does BlueVult protect user data?", answer: "We use encryption, 2FA, and secure servers to ensure all user data is safe." },
  { question: "What is a blockchain node?", answer: "A node is a computer that participates in the blockchain network, validating transactions." },
];

const CryptoFAQ: React.FC = () => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-[#0f111b]">
      {/* Sidebar */}
     <div
        className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#020617] shadow-lg z-50 transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      {/* Main Content */}
      {/* Main Content */}
<div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
  {/* Top Bar */}
  <TopBar title="FAQs" onSidebarToggle={() => setSidebarOpen(true)} />

  {/* Page Content */}
  <div className="p-6 space-y-6 mt-16">
    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {cryptoQAs.map((qa, idx) => (
        <div key={idx} className="bg-white dark:bg-[#0a1120] rounded-2xl shadow-lg p-4">
          <button
            onClick={() => setExpanded(expanded === idx ? null : idx)}
            className="w-full flex justify-between items-center text-lg md:text-xl font-semibold text-gray-900 dark:text-white hover:text-teal-400 transition"
          >
            {qa.question}
            {expanded === idx ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {expanded === idx && (
            <div className="mt-3 text-gray-700 dark:text-gray-300 text-sm md:text-base">
              {qa.answer}
            </div>
          )}
        </div>
      ))}
    </div>

    <p className="mt-6 text-gray-600 dark:text-gray-400 text-sm md:text-base">
      Disclaimer: The information provided here is for educational purposes. Trading cryptocurrencies carries risk and may result in losses.
    </p>
  </div>

  <div className="p-6 space-y-6">
    <Footer />
  </div>
</div>
    </div>
  );
};

export default CryptoFAQ;