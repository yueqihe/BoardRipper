import { describe, it, expect } from 'vitest';
import { resolveLanguage, translateMessage } from './index';
import chinese from './zh-CN.json';

describe('Chinese UI localization', () => {
  it('defaults to Chinese and accepts only supported saved locales', () => {
    expect(resolveLanguage(null)).toBe('zh-CN');
    expect(resolveLanguage('fr')).toBe('zh-CN');
    expect(resolveLanguage('en')).toBe('en');
  });

  it('preserves filenames, net names and placeholder-looking user input', () => {
    const filename = 'Top_GND_核心板_{{1}}.brd';
    expect(translateMessage('Could not open {{0}}', [filename], 'zh-CN')).toBe(`无法打开${filename}`);
    expect(translateMessage("Copied '{{0}}'", ['Power {{0}} / VDD_3V3'], 'zh-CN')).toBe('已复制“Power {{0}} / VDD_3V3”');
  });

  it('preserves English, fallbacks, spacing and plural suffixes', () => {
    expect(translateMessage(' Components: ', [], 'zh-CN')).toBe(' 元件： ');
    expect(translateMessage('Components:', [], 'en')).toBe('Components:');
    expect(translateMessage('Not translated {{0}}', ['U100'], 'zh-CN')).toBe('Not translated U100');
    expect(translateMessage('plural.s', [], 'zh-CN')).toBe('');
    expect(translateMessage('plural.s', [], 'en')).toBe('s');
  });

  it('keeps every interpolation token in every translation', () => {
    const tokens = (s: string) => (s.match(/\{\{\d+\}\}/g) ?? []).sort();
    for (const [source, translated] of Object.entries(chinese)) {
      expect(tokens(translated), source).toEqual(tokens(source));
    }
  });
});
