import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon.jsx';

export default function Modal({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => { if (dialog.open) dialog.close(); };
  }, []);
  return createPortal(<dialog ref={ref} className="modal" aria-label={title} onCancel={onClose} onClick={event => { if (event.target === ref.current) { const r = ref.current.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) onClose(); } }}><div className="modal-top"><span className="section-kicker">GEOQUEST / MANUAL DO EXPLORADOR</span><button className="icon-button" aria-label="Fechar" onClick={onClose}><Icon name="close" /></button></div><h2>{title}</h2>{children}</dialog>, document.body);
}
