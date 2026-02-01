export type Puzzle = {
  question: string;
  answer: string;
  hint: string;
};

export const logicPuzzles: Puzzle[] = [
  {
    question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
    answer: "a map",
    hint: "I am a representation of the world."
  },
  {
    question: "What has to be broken before you can use it?",
    answer: "an egg",
    hint: "It's often eaten for breakfast."
  },
  {
    question: "I’m tall when I’m young, and I’m short when I’m old. What am I?",
    answer: "a candle",
    hint: "I provide light."
  },
  {
    question: "What is always in front of you but can’t be seen?",
    answer: "the future",
    hint: "It hasn't happened yet."
  },
  {
    question: "What is full of holes but still holds water?",
    answer: "a sponge",
    hint: "It's used for cleaning."
  }
];
