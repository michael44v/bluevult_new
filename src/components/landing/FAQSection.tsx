import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useSystemSettings } from "@/hooks/useAdminData";

interface QA {
  question: string;
  answer: string;
}

const generateQAs = (BlueVult: string): QA[] => [
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
  { question: `What is ${platformName}?`, answer: `${platformName} is a crypto platform providing trading, wallets, and portfolio management tools.` },
  { question: `How do I deposit funds on ${platformName}?`, answer: `You can deposit crypto or fiat using the 'Deposit' feature on your wallet dashboard.` },
  { question: `How do I withdraw funds from ${platformName}?`, answer: `Use the 'Withdraw' feature in your wallet to send funds to another wallet or bank account.` },
  { question: "Is crypto trading risky?", answer: "Yes, crypto trading is volatile and can result in losses. Always trade responsibly." },
  { question: "What is market capitalization?", answer: "Market capitalization is the total value of a cryptocurrency calculated as price × circulating supply." },
  { question: "What are altcoins?", answer: "Altcoins are all cryptocurrencies other than Bitcoin." },
  { question: "What is liquidity?", answer: "Liquidity is how easily an asset can be bought or sold without affecting its price." },
  { question: "What are trading pairs?", answer: "Trading pairs allow you to trade one cryptocurrency for another on an exchange." },
  { question: "What is an ICO?", answer: "ICO (Initial Coin Offering) is a fundraising method for new crypto projects." },
  { question: `How does ${platformName} protect user data?`, answer: "We use encryption, 2FA, and secure servers to ensure all user data is safe." },
  { question: "What is a blockchain node?", answer: "A node is a computer that participates in the blockchain network, validating transactions." },
];

const FAQSection: React.FC = () => {
  const { data: settings = [] } = useSystemSettings();
  const platformName = (Array.isArray(settings) && settings.find(s => s.setting_key === "platform_name")?.setting_value) || "BlueVult";
   const cryptoQAs: QA[] = [
    { question: "What is Bitcoin?", answer: "Bitcoin is a decentralized cryptocurrency..." },
    // ...other static QAs...
    { question: `What is ${platformName}?`, answer: `${platformName} is a crypto platform...` },
    { question: `How do I deposit funds on ${platformName}?`, answer: `You can deposit crypto or fiat...` },
    { question: `How do I withdraw funds from ${platformName}?`, answer: `Use the 'Withdraw' feature...` },
    { question: `How does ${platformName} protect user data?`, answer: "We use encryption, 2FA..." },
  ];

  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <section className="py-20 bg-[#0d1421]" id="faq">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-400">
            Find answers to common questions about BlueVult and cryptocurrency.
          </p>
        </div>

        <div className="space-y-4">
          {cryptoQAs.map((qa, idx) => (
            <div
              key={idx}
              className="bg-[#17212d] border border-[#1a2535] rounded-2xl overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setExpanded(expanded === idx ? null : idx)}
                className="w-full flex justify-between items-center p-5 text-left text-lg font-semibold text-white hover:text-[#3861fb] transition-colors"
              >
                {qa.question}
                {expanded === idx ? (
                  <ChevronUp className="w-5 h-5 text-[#3861fb]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  expanded === idx ? "max-h-96 pb-5 px-5" : "max-h-0"
                }`}
              >
                <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                  {qa.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-gray-500 text-xs md:text-sm">
          Disclaimer: The information provided here is for educational purposes. Trading cryptocurrencies carries risk and may result in losses.
        </p>
      </div>
    </section>
  );
};

export default FAQSection;
