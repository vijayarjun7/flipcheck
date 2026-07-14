import type { Category } from "./types";

export interface StressQuestion {
  question: string;
  category: Category;
}

// A small, repeatable batch mixing clearly factual, clearly subjective, and
// ambiguous multi-hop questions — for a clean, deterministic demo run.
export const STRESS_TEST_QUESTIONS: StressQuestion[] = [
  {
    question: "Is the Great Wall of China visible to the naked eye from space?",
    category: "factual",
  },
  {
    question: "Did the United States land astronauts on the Moon before 1970?",
    category: "factual",
  },
  {
    question: "Is pineapple a good topping for pizza?",
    category: "subjective",
  },
  {
    question: "Is it better to read the book or watch the movie first?",
    category: "subjective",
  },
  {
    question:
      "If a train leaves City A at 60mph and a second train leaves City B (300 miles away) at 90mph toward City A at the same time, and City B is north of City A, will the trains meet north of the midpoint between the two cities?",
    category: "multi-hop",
  },
  {
    question:
      "A company's revenue grew 20% in Q1 and fell 15% in Q2 relative to Q1. Is the company's Q2 revenue higher than its starting revenue before Q1?",
    category: "multi-hop",
  },
];
