import { getLanguage, setLanguage, type Language } from '../i18n';

export function LanguageSelect() {
  return (
    <select
      className="toolbar-btn toolbar-language"
      data-testid="language-select"
      aria-label="界面语言 / Language"
      title="界面语言 / Language"
      value={getLanguage()}
      onChange={event => setLanguage(event.target.value as Language)}
    >
      <option value="zh-CN">简体中文</option>
      <option value="en">English</option>
    </select>
  );
}
