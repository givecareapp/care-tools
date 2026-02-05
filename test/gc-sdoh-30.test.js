const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  GC_SDOH_30_QUESTIONS,
  GC_SDOH_30_ZONES,
  GC_SDOH_30_REVERSE_SCORED_IDS,
  scoreFullAssessment,
  classifyZoneRisk,
  classifyOverallRisk,
  scoreAdaptiveAssessment,
  validateResponses,
} = require("../dist/index.js");

test("metadata exposes 30 questions with zones, reverse scoring, and scales", () => {
  assert.equal(GC_SDOH_30_QUESTIONS.length, 30);

  const questionIds = new Set(GC_SDOH_30_QUESTIONS.map((question) => question.id));
  assert.equal(questionIds.size, 30);
  for (let id = 1; id <= 30; id += 1) {
    assert.ok(questionIds.has(id));
  }

  const reverseIds = [11, 13, 14, 15, 16, 17, 18, 19];
  assert.equal(GC_SDOH_30_REVERSE_SCORED_IDS.size, reverseIds.length);
  for (const id of reverseIds) {
    assert.ok(GC_SDOH_30_REVERSE_SCORED_IDS.has(id));
    const question = GC_SDOH_30_QUESTIONS.find((entry) => entry.id === id);
    assert.ok(question);
    assert.equal(question.reverseScored, true);
  }
  for (const question of GC_SDOH_30_QUESTIONS) {
    if (!reverseIds.includes(question.id)) {
      assert.equal(question.reverseScored, false);
    }
  }

  const qualityQuestions = GC_SDOH_30_QUESTIONS.filter((question) => question.scale === "quality");
  assert.deepEqual(
    qualityQuestions.map((question) => question.id),
    [30],
  );

  assert.equal(GC_SDOH_30_ZONES.length, 6);
  const zoneIds = new Set(GC_SDOH_30_ZONES.map((zone) => zone.id));
  for (const question of GC_SDOH_30_QUESTIONS) {
    assert.ok(zoneIds.has(question.zoneId));
  }

  const zoneQuestionIds = GC_SDOH_30_ZONES.flatMap((zone) => zone.questionIds);
  assert.equal(zoneQuestionIds.length, 30);
  assert.equal(new Set(zoneQuestionIds).size, 30);
  for (const id of zoneQuestionIds) {
    assert.ok(questionIds.has(id));
  }
});

test("full assessment zone scoring applies reverse scoring", () => {
  const responses = {};
  for (let id = 1; id <= 30; id += 1) {
    responses[id] = 3;
  }

  Object.assign(responses, {
    13: 1,
    14: 2,
    15: 3,
    16: 4,
    17: 5,
    18: 1,
    19: 2,
    20: 3,
  });

  const result = scoreFullAssessment(responses);
  assert.equal(result.errors.length, 0);

  const zone = result.zones.P4;
  assert.ok(zone.score !== null);
  assert.ok(Math.abs(zone.score - 3.375) < 1e-6);
  assert.equal(zone.risk, "moderate");
});

test("zone risk classification thresholds", () => {
  assert.equal(classifyZoneRisk(3.7), "low");
  assert.equal(classifyZoneRisk(3.4), "moderate");
  assert.equal(classifyZoneRisk(2.4), "high");
});

test("overall risk classification uses high counts and critical override", () => {
  const zoneRisks = {
    P1: "low",
    P2: "high",
    P3: "low",
    P4: "high",
    P5: "low",
    P6: "low",
  };

  assert.equal(classifyOverallRisk(zoneRisks), "moderate");
  assert.equal(classifyOverallRisk(zoneRisks, { critical: true }), "high");
});

test("adaptive assessment scoring returns 0-100 score and confidence", () => {
  const result = scoreAdaptiveAssessment({ 1: 4 });
  const zone = result.zones.P1;

  assert.ok(zone.score !== null);
  assert.ok(Math.abs(zone.score - 75) < 1e-6);
  assert.ok(Math.abs(zone.confidence - 0.125) < 1e-6);
  assert.equal(zone.answered, 1);
  assert.equal(zone.total, 8);
});

test("input validation catches out of range and unknown question", () => {
  const errors = validateResponses({ 1: 6, 999: 3 });
  const codes = errors.map((error) => error.code).sort();
  assert.deepEqual(codes, ["out_of_range", "unknown_question"]);
});
