export type Puzzle = {
  question: string;
  answer: string;
  hint: string;
};

export const logicPuzzles: Puzzle[] = [
  {
    question: "I have no physical form, but I can be worth a fortune. I am secured by a chain of blocks, but I have no lock. What am I?",
    answer: "cryptocurrency",
    hint: "It's a digital or virtual currency."
  },
  {
    question: "I am a 'book' that everyone can see but no one can change. Every entry is linked to the one before it. What am I?",
    answer: "a blockchain",
    hint: "It's a distributed ledger technology."
  },
  {
    question: "I am a key that unlocks your digital treasure, but I am not made of metal. If you lose me, your treasure may be lost forever. What am I?",
    answer: "a private key",
    hint: "It's a secret alphanumeric password."
  },
  {
    question: "I am a place where digital assets are traded, but there are no crowded floors or shouting traders. What am I?",
    answer: "a cryptocurrency exchange",
    hint: "It's a platform for buying and selling digital currencies."
  },
  {
    question: "I am a 'smart' agreement that executes itself automatically when certain conditions are met, without needing a middleman. What am I?",
    answer: "a smart contract",
    hint: "It runs on a blockchain."
  }
];
