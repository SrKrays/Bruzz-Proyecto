// Escenario de la hamburguesa: PixiJS (WebGL) con respaldo automático a la burger CSS.
// - El motor Pixi se descarga recién al abrir el panel (lazy), no pesa en la carta.
// - Si no hay WebGL, falla la carga o se pierde el contexto → LiveBurger (CSS).
import { lazy, Suspense, useState, useEffect } from 'react';
import LiveBurger from './LiveBurger';

const PixiBurger = lazy(() => import('./PixiBurger'));
const PixiPhotoBurger = lazy(() => import('./PixiPhotoBurger'));

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

export default function BurgerStage(props) {
  const [failed, setFailed] = useState(() => (typeof document === 'undefined' ? true : !hasWebGL()));
  // foto viva → burger por capas → burger CSS
  const [photoFailed, setPhotoFailed] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('css') === '1') setFailed(true);
  }, []);

  if (failed) return <LiveBurger {...props} />;
  if (props.photoLive && !photoFailed) {
    return (
      <Suspense fallback={<div className="pb-loading" aria-hidden="true">🍔</div>}>
        <PixiPhotoBurger {...props} onError={() => setPhotoFailed(true)} />
      </Suspense>
    );
  }
  return (
    <Suspense fallback={<div className="pb-loading" aria-hidden="true">🍔</div>}>
      <PixiBurger {...props} onError={() => setFailed(true)} />
    </Suspense>
  );
}
