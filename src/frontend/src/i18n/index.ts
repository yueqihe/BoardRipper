import chinese from './zh-CN.json';
declare const __APP_DEFAULT_LANGUAGE__: string;

export type Language = 'zh-CN' | 'en';
const LANGUAGE_KEY = 'boardripper-language';
const catalog: Readonly<Record<string, string>> = chinese;

export function resolveLanguage(value: unknown): Language {
  return value === 'en' ? 'en' : 'zh-CN';
}

function readLanguage(): Language {
  // Keep upstream's non-browser unit tests and CLI tooling in English.
  if (typeof window === 'undefined') return 'en';
  try { return resolveLanguage(localStorage.getItem(LANGUAGE_KEY) ?? __APP_DEFAULT_LANGUAGE__); }
  catch { return 'zh-CN'; }
}

const language = readLanguage();
export function getLanguage(): Language { return language; }

/** Reload so module-level labels, search indexes and popout panels agree. */
export function setLanguage(next: Language): void {
  try { localStorage.setItem(LANGUAGE_KEY, next); }
  catch {
    window.alert('无法保存语言设置，请允许此页面使用本地存储。\nAllow local storage to save the interface language.');
    return;
  }
  window.location.reload();
}

/** Translate source-owned UI text only. Dynamic filenames, reference
 * designators, net names and user notes are substituted verbatim, once. */
export function translateMessage(source: string, values: readonly unknown[] = [], locale: Language = language): string {
  const key = source.replace(/\s+/g, ' ').trim();
  let message = source;
  if (locale === 'zh-CN' && Object.hasOwn(catalog, key)) {
    const leading = source.match(/^\s*/)?.[0] ?? '';
    const trailing = source.match(/\s*$/)?.[0] ?? '';
    message = leading + catalog[key] + trailing;
  } else if (key.startsWith('plural.')) {
    message = key.slice('plural.'.length);
  }
  return message.replace(/\{\{(\d+)\}\}/g, (token, index: string) =>
    Number(index) < values.length ? String(values[Number(index)]) : token);
}

export function uiText(source: string): string;
export function uiText(parts: TemplateStringsArray, ...values: unknown[]): string;
export function uiText(source: string | TemplateStringsArray, ...values: unknown[]): string {
  if (typeof source === 'string') return translateMessage(source);
  const message = source.reduce((text, part, index) => text + (index ? `{{${index - 1}}}` : '') + part, '');
  return translateMessage(message, values);
}

export function initLanguage(): void {
  document.documentElement.lang = language;
  document.title = language === 'zh-CN' ? 'BoardRipper 中文版' : 'BoardRipper';
}
