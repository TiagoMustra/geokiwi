import { useEffect, useState } from 'react';
import { kiwiFacts } from '../data/kiwi-facts.js';
import { Icon, KiwiMark } from './Icon.jsx';
import '../facts.css';

const COPY = {
  pt: { label: 'Curiosidade sobre kiwi-fruta', previous: 'Curiosidade anterior', next: 'Próxima curiosidade', pause: 'Pausar curiosidades', play: 'Rodar curiosidades', source: 'Fonte', position: 'de', category: { fruit: 'FRUTA', geography: 'GEOGRAFIA' } },
  en: { label: 'Kiwifruit fact', previous: 'Previous fact', next: 'Next fact', pause: 'Pause facts', play: 'Rotate facts', source: 'Source', position: 'of', category: { fruit: 'FRUIT', geography: 'GEOGRAPHY' } },
};

/** A quiet carousel: automatic changes never interrupt screen-reader speech. */
export default function KiwiFacts({ locale = 'pt' }) {
  const language = locale === 'en' ? 'en' : 'pt';
  const copy = COPY[language];
  const [index, setIndex] = useState(() => Math.floor(Math.random() * kiwiFacts.length));
  const [automatic, setAutomatic] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visible, setVisible] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [announce, setAnnounce] = useState(false);
  const fact = kiwiFacts[index];

  useEffect(() => {
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(Boolean(preference?.matches));
    const updateVisibility = () => setVisible(!document.hidden);
    updateMotion(); updateVisibility();
    preference?.addEventListener?.('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      preference?.removeEventListener?.('change', updateMotion);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  const rotating = automatic && !reducedMotion && visible && !hovered && !focused;
  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(() => {
      setAnnounce(false);
      setIndex(current => (current + 1) % kiwiFacts.length);
    }, 12000);
    return () => window.clearInterval(timer);
  }, [rotating, index]);

  const changeFact = direction => {
    setAnnounce(true);
    setIndex(current => (current + direction + kiwiFacts.length) % kiwiFacts.length);
  };

  return <aside className="kiwi-facts" aria-label={copy.label}
    onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true); }}
    onPointerLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <KiwiMark size={24} />
    <div className="kiwi-facts-content">
      <div className="kiwi-facts-heading"><span>{copy.label}</span><small>{copy.category[fact.category]}</small></div>
      <p className="kiwi-fact-text" key={`${fact.id}-${language}`} aria-live={announce ? 'polite' : 'off'} aria-atomic="true">{fact[language]}</p>
      <div className="kiwi-facts-meta"><a href={fact.source.url} target="_blank" rel="noopener noreferrer" aria-label={`${copy.source}: ${fact.source.title}`}>{copy.source}: {fact.source.title} <Icon name="northeast" size={9} /></a><span>{index + 1} {copy.position} {kiwiFacts.length}</span></div>
    </div>
    <div className="kiwi-facts-controls">
      <button type="button" onClick={() => changeFact(-1)} aria-label={copy.previous} title={copy.previous}><Icon name="back" size={12} /></button>
      <button type="button" onClick={() => setAutomatic(value => !value)} aria-label={automatic && !reducedMotion ? copy.pause : copy.play} aria-pressed={!automatic || reducedMotion} title={automatic && !reducedMotion ? copy.pause : copy.play} disabled={reducedMotion}><Icon name={automatic && !reducedMotion ? 'pause' : 'play'} size={11} /></button>
      <button type="button" onClick={() => changeFact(1)} aria-label={copy.next} title={copy.next}><Icon name="arrow" size={12} /></button>
    </div>
  </aside>;
}
