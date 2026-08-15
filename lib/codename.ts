const adjectives = [
  "Silent",
  "Swift",
  "Shadow",
  "Crimson",
  "Phantom",
  "Rogue",
  "Velvet",
  "Iron",
  "Neon",
  "Lunar",
  "Frost",
  "Ember",
  "Cyber",
  "Chaos",
  "Stealth",
];

const nouns = [
  "Fox",
  "Hawk",
  "Viper",
  "Wolf",
  "Panther",
  "Raven",
  "Cobra",
  "Tiger",
  "Falcon",
  "Lynx",
  "Jaguar",
  "Orca",
  "Mantis",
  "Scorpion",
  "Phoenix",
];

const suffixes = [
  "Prime",
  "Zero",
  "Alpha",
  "Omega",
  "Nova",
  "Storm",
  "Blaze",
  "Drift",
  "Pulse",
  "Apex",
  "Core",
  "Edge",
  "Flux",
  "Surge",
  "Echo",
];

function pickRandom(words: string[]): string {
  return words[Math.floor(Math.random() * words.length)];
}

export function generateCodename(): string {
  return pickRandom(adjectives) + pickRandom(nouns) + pickRandom(suffixes);
}
