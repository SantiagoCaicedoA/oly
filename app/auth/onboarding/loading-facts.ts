/**
 * Athlete stories shown during the onboarding loading screen.
 *
 * Tagged by sex and experience so we can filter to the user's profile.
 * "all" tags are shown to everyone. Stories are shuffled on mount.
 *
 * Only real athlete stories — no generic sport facts.
 */

export interface LoadingFact {
  text: string;
  tags: {
    sex: "female" | "male" | "all";
    experience: "beginner" | "intermediate" | "advanced" | "all";
  };
}

export const LOADING_FACTS: LoadingFact[] = [
  // ─── Female athlete stories ───────────────────────────────

  {
    text: "Hidilyn Diaz became the Philippines' first-ever Olympic gold medalist in any sport — through weightlifting in 2021.",
    tags: { sex: "female", experience: "all" },
  },
  {
    text: "India's Mirabai Chanu won silver at Tokyo 2020 and sparked a nationwide weightlifting boom — she was awarded India's highest sporting honor.",
    tags: { sex: "female", experience: "all" },
  },
  {
    text: "Sara Ahmed of Egypt became the first African and Arab woman to win an Olympic weightlifting medal, taking bronze at Rio 2016 at just 18 years old.",
    tags: { sex: "female", experience: "all" },
  },
  {
    text: "Neisi Dajomes became Ecuador's first female Olympic gold medalist through weightlifting — putting her country on the map in the sport.",
    tags: { sex: "female", experience: "all" },
  },
  {
    text: "Maude Charron of Canada quietly dominated the sport for years before winning Olympic gold in Tokyo — proving consistency beats hype.",
    tags: { sex: "female", experience: "all" },
  },
  {
    text: "Giorgia Bordignon of Italy won silver at Tokyo 2020 at 33 years old — proving longevity and late peaks are real in this sport.",
    tags: { sex: "female", experience: "all" },
  },

  // ─── Male athlete stories ─────────────────────────────────

  {
    text: "Naim Suleymanoglu, 'Pocket Hercules,' stood 4'11\" and won 3 consecutive Olympic golds. He defected from Bulgaria to Turkey in 1986 to chase his dream.",
    tags: { sex: "male", experience: "all" },
  },
  {
    text: "Lu Xiaojun of China won Olympic gold at age 37 — one of the oldest weightlifting champions in modern history. He didn't compete internationally until 22.",
    tags: { sex: "male", experience: "all" },
  },
  {
    text: "Oscar Figueroa of Colombia won gold at Rio 2016, then removed his shoes on the platform — a symbolic retirement from the sport he dedicated his life to.",
    tags: { sex: "male", experience: "all" },
  },
  {
    text: "Eko Yuli Irawan of Indonesia competed in 5 consecutive Olympics from 2004 to 2020 — one of the longest Olympic careers in the sport.",
    tags: { sex: "male", experience: "all" },
  },
  {
    text: "Lasha Talakhadze of Georgia holds the all-time total record at 492 kg. He didn't compete internationally until age 20.",
    tags: { sex: "male", experience: "all" },
  },
  {
    text: "Shi Zhiyong of China is known for his dramatic celebrations after world-record lifts — reminding everyone that emotion belongs on the platform.",
    tags: { sex: "male", experience: "all" },
  },
  {
    text: "Mohamed Ehab of Egypt has one of the most technically precise snatches in the history of the sport — studied by coaches worldwide.",
    tags: { sex: "male", experience: "all" },
  },

  // ─── Universal athlete stories ────────────────────────────

  {
    text: "Pyrros Dimas started weightlifting at 14 in Albania and went on to win 3 Olympic golds for Greece — becoming one of the country's greatest athletes.",
    tags: { sex: "all", experience: "beginner" },
  },
  {
    text: "Kakhi Kakhiashvili won Olympic gold representing three different countries throughout his career — a unique feat in any sport.",
    tags: { sex: "all", experience: "all" },
  },
  {
    text: "Laurel Hubbard of New Zealand became the first openly transgender athlete to compete in Olympic weightlifting at Tokyo 2020.",
    tags: { sex: "all", experience: "all" },
  },
  {
    text: "David Rigert of the Soviet Union set 68 world records during his career in the 1970s — a number that may never be matched.",
    tags: { sex: "all", experience: "all" },
  },
  {
    text: "Halil Mutlu of Turkey won 3 Olympic golds while competing at just 56 kg bodyweight — proving size has nothing to do with greatness.",
    tags: { sex: "all", experience: "all" },
  },
];

/**
 * Returns a shuffled list of fact strings filtered by the user's sex and experience level.
 * Falls back to "all" tags, so every user gets a healthy pool.
 */
export function getFilteredFacts(
  sex?: string,
  experienceYears?: number
): string[] {
  const expLevel =
    experienceYears == null || experienceYears <= 1
      ? "beginner"
      : experienceYears <= 4
        ? "intermediate"
        : "advanced";

  const userSex = sex === "Female" ? "female" : sex === "Male" ? "male" : "all";

  const filtered = LOADING_FACTS.filter((fact) => {
    const sexMatch = fact.tags.sex === "all" || fact.tags.sex === userSex;
    const expMatch =
      fact.tags.experience === "all" || fact.tags.experience === expLevel;
    return sexMatch && expMatch;
  });

  // Fisher-Yates shuffle
  const shuffled = [...filtered];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.map((f) => f.text);
}
