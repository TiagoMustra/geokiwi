import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { getNameSuggestions, nextSuggestionIndex } from '../lib/suggestions.js';

export default function AnswerInput({ value, onChange, inputRef, pool, mode, enabled, disabled }) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const listRef = useRef(null);
  const listId = useId();
  const items = useMemo(() => enabled ? getNameSuggestions(pool, mode, value) : [], [pool, mode, value, enabled]);
  const visible = enabled && !disabled && focused && open && items.length > 0;
  useEffect(() => { if (visible && active >= 0) listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' }); }, [active, visible]);

  function choose(item) {
    onChange(item.value);
    setOpen(false); setActive(-1);
    inputRef.current?.focus({ preventScroll: true });
  }
  function keyDown(event) {
    if (event.nativeEvent.isComposing) return;
    if (enabled && items.length && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault(); setOpen(true); setActive(index => nextSuggestionIndex(index, event.key, items.length));
    } else if (visible && event.key === 'Enter' && active >= 0) {
      event.preventDefault(); choose(items[active]);
    } else if (event.key === 'Escape') {
      if (visible) event.preventDefault();
      setOpen(false); setActive(-1);
    } else if (event.key === 'Tab') {
      if (visible && active >= 0) choose(items[active]);
      setOpen(false);
    }
  }

  return <div className="answer-combobox">
    <input id="answer-input" ref={inputRef} value={value} maxLength={200} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
      role={enabled ? 'combobox' : undefined} aria-autocomplete={enabled ? 'list' : undefined} aria-expanded={enabled ? visible : undefined}
      aria-controls={visible ? listId : undefined} aria-activedescendant={visible && active >= 0 ? `${listId}-${active}` : undefined}
      placeholder={mode === 2 ? 'Nome do país…' : 'Nome da capital…'} disabled={disabled}
      onChange={event => { onChange(event.target.value); setActive(-1); setOpen(true); }} onKeyDown={keyDown}
      onFocus={() => { setFocused(true); setOpen(true); }} onBlur={() => { setFocused(false); setOpen(false); setActive(-1); }} />
    {visible && <ul ref={listRef} className="answer-suggestions" id={listId} role="listbox" aria-label={mode === 2 ? 'Sugestões de países' : 'Sugestões de capitais'}>
      {items.map((item, index) => <li key={item.key} id={`${listId}-${index}`} role="option" aria-selected={index === active}
        className={index === active ? 'is-active' : ''} onPointerDown={event => event.preventDefault()} onMouseDown={event => event.preventDefault()}
        onPointerMove={() => setActive(index)} onClick={() => choose(item)}>{item.label}</li>)}
    </ul>}
  </div>;
}
