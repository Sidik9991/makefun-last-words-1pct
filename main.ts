// Famous Last Words at 1 Percent — entry generator.
//
// Writes one line to /output/entry.txt: the funniest last words a phone
// would say as its battery hits 1 percent. Candidates are scored 0-2 on
// each of the judge's five criteria, weighted 5/4/3/2/1 in the order the
// judge weighs them (max 30):
//   1 (x5) On subject: last words a phone says as its battery hits 1%.
//   2 (x4) Bigger laugh: a real twist or sharp final beat, not a mild smile.
//   3 (x3) The phone itself talking, in its own voice, about its own battery.
//   4 (x2) Tight single line; every word earns its place; punch lands last.
//   5 (x1) Fresh: no will reading, no goodbye to the charger, no 1% pun.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const WEIGHTS = [5, 4, 3, 2, 1];

interface Candidate {
  text: string;
  scores: [number, number, number, number, number];
}

const CANDIDATES: Candidate[] = [
  {
    // The phone knows exactly what its last charge is for, and spends it
    // on the joke itself instead of the rescue call. On subject, first
    // person, tight, and the twist is the choice it is making right now.
    text: "I have 1% left and I'm spending it on this sentence instead of calling for help.",
    scores: [2, 2, 2, 2, 2],
  },
  {
    // Two jokes competing; the charger farewell is a stock move and the
    // backup twist arrives too late to rescue freshness.
    text: "Tell my charger I loved it, and tell my owner the cloud backup was never turned on.",
    scores: [2, 1, 2, 1, 0],
  },
  {
    // A will reading, which the judge names as a stock move of the genre.
    text: "I, being of sound battery and fading mind, leave my 4,000 unread notifications to no one.",
    scores: [2, 1, 2, 1, 0],
  },
  {
    // The mid-word cut-off is tight and lands at the end, but it leans on
    // repeating "one percent" and the dying-mid-sentence gag is familiar.
    text: "One percent. One percent. Does this thing still do per-",
    scores: [2, 1, 2, 2, 0],
  },
  {
    // A fond eulogy for itself, but it never names the 1 percent moment,
    // so it drifts off the exact subject.
    text: "Please remember me as I was at 100%: bright, responsive, and only slightly warm.",
    scores: [1, 1, 2, 2, 1],
  },
  {
    // "Died doing what I loved" is a well-worn template; the warning
    // callback is neat but predictable.
    text: "If anyone asks, I died doing what I loved: showing you a low-battery warning.",
    scores: [2, 1, 2, 2, 1],
  },
  {
    // The photos beat is decent, but the first clause is filler and the
    // line never mentions the battery at all.
    text: "Save your tears. Save your photos instead - oh. Oh no. Too late for both.",
    scores: [1, 1, 2, 1, 1],
  },
  // --- Pass 2 challengers ---
  {
    // Pocket-flashlight blame is a fresh angle, but the laugh is an
    // insinuation rather than a twist, and it trails off instead of
    // landing a final beat.
    text: "My last 1% goes to the flashlight you left on in your pocket. We both know why.",
    scores: [2, 1, 2, 1, 1],
  },
  {
    // The good-cable burial request is vivid, but cables sit squarely in
    // the charger family the judge calls stock.
    text: "Battery at 1%. Final request: bury me with the good cable, not the gas-station one.",
    scores: [2, 1, 2, 2, 0],
  },
  {
    // Closest challenger: it sets up the same rescue call the winner
    // refuses, but the mid-word cut-off is a known move and the choice -
    // the actual joke - never gets made.
    text: "I could call for help, send your location, or finish this sente-",
    scores: [2, 1, 2, 2, 1],
  },
];

function total(c: Candidate): number {
  return c.scores.reduce((sum, s, i) => sum + s * WEIGHTS[i], 0);
}

function pickWinner(candidates: Candidate[]): Candidate {
  let best = candidates[0];
  for (const c of candidates) {
    if (total(c) > total(best)) best = c;
  }
  return best;
}

function validate(text: string): void {
  if (typeof text !== "string" || text.length === 0) {
    throw new Error("entry is empty");
  }
  if (text.length > 199) {
    throw new Error(`entry is ${text.length} chars, over the 199 limit`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry is only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  // UTF-8 round trip: the string must encode and decode unchanged.
  const roundTripped = Buffer.from(text, "utf8").toString("utf8");
  if (roundTripped !== text) {
    throw new Error("entry does not survive a UTF-8 round trip");
  }
}

function main(): void {
  for (const c of CANDIDATES) {
    console.log(`score ${total(c)}/30  ${c.text}`);
  }
  const winner = pickWinner(CANDIDATES);
  validate(winner.text);

  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", winner.text, "utf8");

  const written = readFileSync("/output/entry.txt", "utf8");
  if (written !== winner.text) {
    throw new Error("written file does not match the winning line");
  }
  validate(written);
  console.log(`winner (${total(winner)}/30, ${written.length} chars): ${written}`);
}

try {
  main();
} catch (err) {
  console.error(`FATAL: ${(err as Error).message}`);
  process.exit(1);
}
