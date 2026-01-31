export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
};

export const cryptoQuiz: QuizQuestion[] = [
  {
    question: 'What is the name of the first-ever cryptocurrency?',
    options: ['Ethereum', 'Ripple', 'Bitcoin', 'Litecoin'],
    correctAnswer: 'Bitcoin',
  },
  {
    question: 'What is a "blockchain"?',
    options: [
      'A type of cryptocurrency',
      'A distributed, immutable ledger',
      'A centralized database',
      'A physical chain of blocks',
    ],
    correctAnswer: 'A distributed, immutable ledger',
  },
  {
    question: 'Who is the anonymous creator of Bitcoin?',
    options: ['Vitalik Buterin', 'Satoshi Nakamoto', 'Elon Musk', 'John McAfee'],
    correctAnswer: 'Satoshi Nakamoto',
  },
  {
    question: 'What does "DeFi" stand for?',
    options: [
      'Decentralized Finance',
      'Digital Finance',
      'Default Finance',
      'Delegated Finance',
    ],
    correctAnswer: 'Decentralized Finance',
  },
  {
    question: 'What is a "private key" in cryptocurrency?',
    options: [
      'A public address for receiving funds',
      'A password for your email',
      'A secret code that proves ownership and allows spending',
      'A key to a physical vault',
    ],
    correctAnswer: 'A secret code that proves ownership and allows spending',
  },
  {
    question: 'What is "mining" in the context of cryptocurrencies like Bitcoin?',
    options: [
      'Digging for physical coins',
      'The process of creating new coins and verifying transactions',
      'Exchanging one crypto for another',
      'Storing coins in a digital wallet',
    ],
    correctAnswer: 'The process of creating new coins and verifying transactions',
  },
];
