import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { readTheme, saveTheme, readMapView, saveMapView, readKeepCorrect, saveKeepCorrect } from '../src/lib/game.js';

function memoryStorage() {
  const values = new Map();
  return { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value) };
}

test('theme choice survives reload without overwriting globe or answer-color preferences', () => {
  const storage = memoryStorage();
  assert.equal(readTheme(storage), 'dark');
  saveMapView('globe', storage);
  saveKeepCorrect(false, storage);
  saveTheme('light', storage);
  assert.equal(readTheme(storage), 'light');
  assert.equal(readMapView(storage), 'globe');
  assert.equal(readKeepCorrect(storage), false);
  saveMapView('flat', storage);
  saveKeepCorrect(true, storage);
  assert.equal(readTheme(storage), 'light');
  saveTheme('dark', storage);
  assert.equal(readTheme(storage), 'dark');
  assert.equal(readMapView(storage), 'flat');
  assert.equal(readKeepCorrect(storage), true);
});

test('blocked or malformed preferences safely retain the default dark theme', () => {
  for (const value of ['null', '[]', '{bad', '{"theme":"invalid"}']) assert.equal(readTheme({ getItem: () => value }), 'dark');
  const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  assert.equal(readTheme(blocked), 'dark');
  assert.doesNotThrow(() => saveTheme('light', blocked));
});

test('saved light mode is applied before app startup, including safe fallbacks', () => {
  const script = readFileSync(new URL('../public/theme-init.js', import.meta.url), 'utf8');
  for (const [raw, expected] of [['{"theme":"light"}', 'light'], ['{"theme":"dark"}', 'dark'], ['null', 'dark'], ['{bad', 'dark']]) {
    const document = { documentElement: { dataset: {} } };
    runInNewContext(script, { document, localStorage: { getItem: () => raw } });
    assert.equal(document.documentElement.dataset.theme, expected);
  }
});

test('land has substantially different luminance from every ocean-gradient stop in both palettes', () => {
  const css = readFileSync(new URL('../src/themes.css', import.meta.url), 'utf8');
  function luminance(hex) {
    const channels = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  }
  for (const [selector, minimum] of [[':root {', 4.5], [':root[data-theme="light"] {', 2.8]]) {
    const block = css.split(selector)[1].split('}')[0];
    const colors = Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[\da-f]{6})/g)].map(match => [match[1], match[2]]));
    const land = luminance(colors['map-land']);
    for (const stop of ['ocean-near', 'ocean-mid', 'ocean-far']) {
      const sea = luminance(colors[stop]);
      const contrast = (Math.max(land, sea) + 0.05) / (Math.min(land, sea) + 0.05);
      assert.ok(contrast >= minimum, `${selector} ${stop} land/sea separation is too low: ${contrast}`);
    }
  }
});
