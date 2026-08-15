const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const window = {};
const context = { window };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "js", "romaji.js"), "utf8"), context);
const { RomajiEngine } = window.Romaji;

function type(kana, roman) {
  const engine = new RomajiEngine(kana);
  let result;
  for (const ch of roman) result = engine.feed(ch);
  return { engine, result };
}

test("accepts both Hepburn and Kunrei spellings", () => {
  assert.equal(type("しゃしん", "shashin").engine.done, true);
  assert.equal(type("しゃしん", "syasin").engine.done, true);
});

test("handles sokuon, syllabic n, and katakana words", () => {
  assert.equal(type("がっこう", "gakkou").engine.done, true);
  assert.equal(type("せんせい", "sensei").engine.done, true);
  assert.equal(type("ロボット", "robotto").engine.done, true);
});

test("does not advance on a wrong key", () => {
  const engine = new RomajiEngine("ねこ");
  const result = engine.feed("x");
  assert.equal(result.ok, false);
  assert.equal(engine.pos, 0);
  assert.equal(engine.typedDisplay(), "");
});

test("requires Japanese punctuation only in advanced mode", () => {
  assert.equal(type("はい、そうです。", "haisoudesu").engine.done, true);

  const engine = new RomajiEngine("はい、そうです。", { punct: true });
  for (const ch of "hai,soudesu.") engine.feed(ch);
  assert.equal(engine.done, true);
});

test("accepts question and exclamation marks in advanced mode", () => {
  const question = new RomajiEngine("ほんとう？", { punct: true });
  for (const ch of "hontou?") question.feed(ch);
  assert.equal(question.done, true);

  const exclamation = new RomajiEngine("やった！", { punct: true });
  for (const ch of "yatta!") exclamation.feed(ch);
  assert.equal(exclamation.done, true);
});
