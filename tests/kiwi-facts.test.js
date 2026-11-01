import test from 'node:test';
import assert from 'node:assert/strict';
import { kiwiFacts } from '../src/data/kiwi-facts.js';

test('the carousel has at least 100 distinct sourced facts in Portuguese and English', () => {
  assert.ok(kiwiFacts.length >= 100);
  for (const field of ['id', 'pt', 'en']) {
    assert.equal(new Set(kiwiFacts.map(fact => fact[field]?.trim().toLowerCase())).size, kiwiFacts.length, field);
  }
  for (const fact of kiwiFacts) {
    assert.ok(fact.pt?.trim() && fact.en?.trim() && fact.source?.title, fact.id);
    assert.equal(new URL(fact.source.url).protocol, 'https:', fact.id);
  }
});

test('kiwi facts are about the fruit, never the kiwi bird', () => {
  for (const fact of kiwiFacts) {
    assert.ok(['fruit', 'geography'].includes(fact.category), fact.id);
    assert.doesNotMatch(fact.source.url, /savethekiwi|doc\.govt\.nz\/nature\/native-animals/i, fact.id);
    assert.doesNotMatch(`${fact.pt} ${fact.en}`, /kiwi-ave|kiwis-ave|kiwi birds?|kiwi bird species/i, fact.id);
  }
});
