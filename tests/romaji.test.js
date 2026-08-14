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
