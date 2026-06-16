import { computeScores, bandFor } from "../shared/scoring";
import { defaultContent as C } from "../shared/defaultContent";

let pass = 0, fail = 0;
function eq(label: string, a: any, b: any) {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  console.log(`${ok ? "✅" : "❌"} ${label} → got ${JSON.stringify(a)} expected ${JSON.stringify(b)}`);
  ok ? pass++ : fail++;
}

// --- Test 1: all best answers → perfect 5.0, AI-First ---
const best = {
  q1: "q1a", q3: "q3a",                  // knowledge 5+5 /10*5 = 5
  q4: "q4a", q5: "q5a", q6: "q6a",       // mindset 15/15*5 = 5
  q7: ["q7a","q7b","q7c","q7d","q7e","q7f"], q8: "q8a", // skills 5+5 /10*5 = 5
  q9: "q9a", q10: "q10a", q11: "q11a",   // leadership 15/15*5 = 5
};
const r1 = computeScores(C, best);
eq("perfect knowledge", r1.knowledge, 5);
eq("perfect mindset", r1.mindset, 5);
eq("perfect skills", r1.skills, 5);
eq("perfect leadership", r1.leadership, 5);
eq("perfect overall", r1.overall, 5);
eq("perfect tier", r1.tier, "AI-First Leaders");

// --- Test 2: all lowest answers → 1.0, AI Aware ---
const worst = {
  q1: "q1e", q3: "q3d",                  // 1 + 1 /10*5 = 1.0
  q4: "q4e", q5: "q5d", q6: "q6d",       // 1+1+1 /15*5 = 1.0
  q7: ["q7g"], q8: "q8d",                // none→1, q8→1 ; 1+1/10*5 = 1.0
  q9: "q9d", q10: "q10d", q11: "q11c",   // 1+1+1 /15*5 = 1.0
};
const r2 = computeScores(C, worst);
eq("worst overall", r2.overall, 1);
eq("worst tier", r2.tier, "AI Aware");

// --- Test 3: "not sure" excluded from max ---
// Knowledge: q1=very well(5), q3=not sure(null) → max=5, earned=5 → 5.0
const notsure = { ...best, q3: "q3e" };
const r3 = computeScores(C, notsure);
eq("knowledge with null excluded", r3.knowledge, 5);
eq("notSureCount", r3.notSureCount, 1);

// --- Test 4: skills count banding (3 skills → 3 pts) ---
const band = { ...worst, q7: ["q7a","q7b","q7c"], q8: "q8a" }; // 3pts + 5pts = 8/10*5 = 4.0
const r4 = computeScores(C, band);
eq("skills banded (3 skills+top q8)", r4.skills, 4);

// --- Test 5: interests captured, not scored ---
const withInterest = { ...best, q2: ["q2a","q2e"] };
const r5 = computeScores(C, withInterest);
eq("interests captured", r5.interests, ["Improve efficiency", "Reduce costs"]);
eq("interests don't affect overall", r5.overall, 5);

// --- Test 6: lowest category surfaced ---
const mixed = {
  q1: "q1a", q3: "q3a",                  // knowledge 5
  q4: "q4e", q5: "q5d", q6: "q6d",       // mindset 1.0 (lowest)
  q7: ["q7a","q7b","q7c","q7d","q7e","q7f"], q8: "q8a", // skills 5
  q9: "q9a", q10: "q10a", q11: "q11a",   // leadership 5
};
const r6 = computeScores(C, mixed);
eq("lowest category = Mindset", r6.lowestCategoryLabel, "Mindset");

// --- band helper ---
eq("band 4.3 → high", bandFor(4.3), "high");
eq("band 3.0 → medium", bandFor(3.0), "medium");
eq("band 2.0 → low", bandFor(2.0), "low");

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
