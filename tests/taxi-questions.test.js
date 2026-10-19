const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const context = {};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "taxi", "questions.js"), "utf8"), context);
const { SUBJECTS, makeQuestion } = context.TaxiQuestions;

test("every subject yields 3 distinct choices containing exactly one answer", () => {
  for (const key of Object.keys(SUBJECTS)) {
    for (let level = 0; level < 5; level++) {
      for (let n = 0; n < 200; n++) {
        const q = makeQuestion(key, level);
        assert.equal(q.choices.length, 3, key);
        assert.equal(new Set(q.choices).size, 3, `${key}: ${q.prompt} ${q.choices}`);
        assert.equal(q.choices.filter((c) => c === q.answer).length, 1, key);
      }
    }
  }
});

test("arithmetic answers are correct and non-negative", () => {
  for (let n = 0; n < 300; n++) {
    const q = makeQuestion("add", 3);
    const [, a, op, b] = q.prompt.match(/(\d+) ([＋−]) (\d+)/);
    const expected = op === "＋" ? +a + +b : +a - +b;
    assert.equal(Number(q.answer), expected);
    assert.ok(expected >= 0);
  }
});
