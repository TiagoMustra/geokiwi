import { useEffect, useState } from 'react';
import { KiwiMark } from '../components/Icon.jsx';

export default function Avatar({ src, size = 32 }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return <span className="profile-avatar" style={{ width: size, height: size }} aria-hidden="true">{src && !failed ? <img src={src} alt="" onError={() => setFailed(true)} /> : <KiwiMark size={Math.round(size * 0.55)} />}</span>;
}
