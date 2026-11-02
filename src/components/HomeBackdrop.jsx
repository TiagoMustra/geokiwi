import { useEffect, useRef, useState } from 'react';
import '../scenery-motion.css';
import AnimatedScenery from './AnimatedScenery.jsx';

function Sailboat() {
  return <svg className="scene-sailboat" viewBox="0 0 80 90" shapeRendering="crispEdges">
    <path fill="#70553c" d="M40 3h2v69h-2Z" />
    <path fill="#e8d8b2" d="M38 10v56H9v-3h2v-5h3v-5h3v-5h3v-6h3v-6h3v-6h3v-6h3v-6h3v-8Z" />
    <path fill="#fff1d0" d="M37 18v45H16v-4h3v-5h3v-6h3v-6h3v-6h3v-6h3V18Z" />
    <path fill="#e7d0a7" d="M45 20v45h21v-5h-3v-7h-3v-7h-3v-7h-3v-7h-3v-7h-3v-5Z" />
    <path fill="#fbebc7" d="M46 25v37h14v-5h-3v-7h-3v-7h-3v-7h-3V25Z" />
    <path fill="#514936" d="M5 70h70v4h-4v5H16v-3h-6v-3H5Z" />
    <path fill="#a17a50" d="M11 70h58v4H17v-2h-6Z" />
    <path fill="#ead5aa" d="M8 68h65v2H8ZM24 66h17v2H24Z" />
    <path fill="#9cb5b4" d="M16 82h48v2H16Z" opacity=".6" />
  </svg>;
}
function Fern({ right = false }) {
  return <svg className={`scene-fern ${right ? 'scene-fern-right' : ''}`} viewBox="0 0 90 90" shapeRendering="crispEdges">
    <path fill="#536947" d="M40 89h4V55h4V39h4V25h4V9h-4v16h-4v14h-4v16h-4Z" />
    <g className="fern-fronds fern-fronds-left" fill="#7f9757"><path d="M42 68H27v-4H14v-5H5v-5h12v4h13v5h12Zm3-13H32v-6H20v-5H10v-6h13v5h12v6h10Zm4-16H37v-6H26v-5h-8v-6h12v6h12v6h7Z" /></g>
    <g className="fern-fronds fern-fronds-right" fill="#7f9757"><path d="M45 65h15v-5h15v-5h12v6H76v5H63v5H45Zm4-17h14v-5h12v-5h10v6H75v5H63v5H49Zm4-16h12v-6h11v-5h7v6h-8v5H64v5H53Z" /></g>
  </svg>;
}

/** Decorative layers never handle pointer events or cover the game map. */
export default function HomeBackdrop() {
  const [hidden, setHidden] = useState(false);
  const imageRef=useRef(null);
  useEffect(() => {
    const update = () => setHidden(document.hidden);
    update(); document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  return <div className="home-scenery" aria-hidden="true" data-paused={hidden ? 'true' : 'false'}>
    <picture>
      <source media="(max-width: 680px)" srcSet="/art/kiwi-islands-mobile-v2.png" />
      <img ref={imageRef} src="/art/kiwi-islands-v2.png" width="1536" height="1024" alt="" fetchPriority="high" />
    </picture>
    <AnimatedScenery imageRef={imageRef}/>
    <div className="scene-motion">
      <div className="scene-boat-route"><div className="scene-boat-bob"><Sailboat /></div><i className="scene-boat-wake" /></div>
      <svg className="scene-waves" viewBox="0 0 1000 700" preserveAspectRatio="none"><g fill="#c9dcd0">
        <path className="wave-shimmer wave-one" d="M390 340h26v2h-26Zm36 4h17v2h-17ZM580 420h32v2h-32Zm43-3h18v2h-18ZM350 520h23v2h-23Z" />
        <path className="wave-shimmer wave-two" d="M490 390h30v2h-30Zm41 3h15v2h-15ZM470 490h22v2h-22Zm32-2h20v2h-20ZM770 560h19v2h-19Z" />
        <path className="wave-shimmer wave-three" d="M640 350h24v2h-24Zm36 2h17v2h-17ZM590 570h32v2h-32Zm44-2h18v2h-18ZM290 460h20v2h-20Z" />
      </g></svg>
      <div className="scene-birds"><svg viewBox="0 0 80 25" shapeRendering="crispEdges"><g className="scene-wing-up" fill="#777d68"><path d="M1 4h5v3h5v3h4v3h4v-3h4V7h5V4h5v4h-5v3h-5v3h-4v3h-4v-3h-4v-3H6V8H1Zm45 8h4v3h4v3h4v-3h4v-3h4v3h-4v3h-4v3h-4v-3h-4v-3h-4Z" /></g><g className="scene-wing-down" fill="#777d68"><path d="M1 14h5v-3h5V8h4V5h4v3h4v3h5v3h5v4h-5v-3h-5v-3h-4V9h-4v3h-4v3H6v3H1Zm45 5h4v-3h4v-3h4v3h4v3h4v3h-4v-3h-4v-3h-4v3h-4v3h-4Z" /></g></svg></div>
      <Fern /><Fern right />
    </div>
  </div>;
}
