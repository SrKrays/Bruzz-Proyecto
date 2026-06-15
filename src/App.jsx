import { useState, useCallback, useEffect, useRef } from 'react';
import './App.css';
import logo from './assets/logo.png';
import CategoriasPrincipales from './CategoriasPrincipales';
import Subcategorias         from './Subcategorias';
import Items, { CartChip, CartPanel }  from './Items';
import { Routes, Route } from 'react-router-dom';
import AdminPanel from './AdminPanel';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplashScreen from './SplashScreen';
import EmberParticles from './EmberParticles';
import FlyToCartLayer from './FlyToCartLayer';

gsap.registerPlugin(ScrollTrigger);
 //a
const SUBCATEGORIA_SCREENS = new Set(['comidas', 'bebidas']);

// ── Dirección de la navegación ────────────────────────────
// forward = va más profundo, back = vuelve arriba
function buildScreenVariants(direction) {
  const xOut  = direction === 'forward' ? -30 : 30;
  const xIn   = direction === 'forward' ?  30 : -30;
  return {
    initial: { opacity: 0, x: xIn,  filter: 'blur(4px)' },
    animate: { opacity: 1, x: 0,    filter: 'blur(0px)',
      transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
    exit:    { opacity: 0, x: xOut, filter: 'blur(2px)',
      transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } },
  };
}

export default function App() {
  const [screen, setScreen]             = useState('home');
  const [menuKey, setMenuKey]           = useState(null);
  const [cart, setCart]                 = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [cartOpen, setCartOpen]         = useState(false);
  const [navDirection, setNavDirection] = useState('forward');  // NEW
  const [headerShrunk, setHeaderShrunk] = useState(false);      // NEW
  const [logoWiggle, setLogoWiggle]     = useState(0);          // NEW: key for re-trigger

  const waveRef   = useRef(null);
  const headerRef = useRef(null);

  // ── Splash de marca: una vez por sesión ──────────────────
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem('bruzz_splash_shown');
  });

  const handleSplashDone = useCallback(() => {
    sessionStorage.setItem('bruzz_splash_shown', '1');
    setShowSplash(false);
  }, []);

  // ── Parallax de la wave con GSAP ScrollTrigger ───────────
  useEffect(() => {
    if (!waveRef.current) return;
    const anim = gsap.to(waveRef.current, {
      yPercent: -35,
      ease: 'none',
      scrollTrigger: {
        trigger: waveRef.current,
        start: 'top top',
        end: '+=300',
        scrub: true,
      },
    });
    return () => { anim.scrollTrigger?.kill(); anim.kill(); };
  }, []);

  // ── MEDIA 7: Header que encoge al hacer scroll ────────────
  useEffect(() => {
    const handleScroll = () => {
      setHeaderShrunk(window.scrollY > 55);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Console easter egg ────────────────────────────────────
  useEffect(() => {
    console.log(
      '%c\n⠀\n⢕⢅⠧⡱⡑⢕⠜⡌⡎⡪⣸⠢⡣⡪⠢⡃⡊⡢⢍⣢⢸⡸⣌⡆⡕⢜⢜⢌⠢⡑⡸⡠⠀⠠⠀⢁⠈⠀⡁⠈⡀⢁⢀⠁⠄⠁⠄⠁⠠⠈⠠⠈⠠⠁⠄⠂⠄⢢⠨⡐⠠⢂⢂⢐⠌⡂⡂⡢⢑⢀⠂⡂⡂⡢⢢⠢⠡⡂⡪⢐⠔⢌⠔⡁⡊⠔⡑⠔⢔⠱⡘⡜⢔⢜⢔⠕⢌⠪⡢⡂',
      'color: #f5c842; font-family: monospace; font-size: 10px;'
    );
  }, []);

  // ── Navegación con dirección ──────────────────────────────
  const navigate = useCallback((screenId) => {
    setNavDirection('back');
    setLogoWiggle((k) => k + 1);
    setScreen(screenId);
  }, []);

  const showItems = useCallback((key) => {
    setNavDirection('forward');
    setLogoWiggle((k) => k + 1);
    setMenuKey(key);
    setScreen('items');
  }, []);

  const handleCategoria = useCallback((screenId) => {
    setNavDirection('forward');
    setLogoWiggle((k) => k + 1);
    if (screenId === 'postres')   { setMenuKey('postres');   setScreen('items'); return; }
    if (screenId === 'tragos')    { setMenuKey('tragos');    setScreen('items'); return; }
    if (screenId === 'cafeteria') { setMenuKey('cafeteria'); setScreen('items'); return; }
    setScreen(screenId);
  }, []);

  // ── Carrito ───────────────────────────────────────────────
  const handleCartAdd = useCallback((item) => {
    const qty             = item.qty             ?? 1;
    const note            = item.note            ?? '';
    const medallon        = item.medallon        ?? '';
    const sintaccVariedad = item.sintaccVariedad ?? '';
    const key = item.name + '||' + note + '||' + medallon + '||' + sintaccVariedad;
    setCart((prev) => {
      const exists = prev.find((c) => c._key === key);
      if (exists) {
        return prev.map((c) =>
          c._key === key ? { ...c, qty: c.qty + qty } : c
        );
      }
      return [...prev, { _key: key, name: item.name, price: item.price, note, medallon, sintaccVariedad, sinTacc: item.sinTacc ?? false, qty }];
    });
  }, []);

  const handleCartRemove = useCallback((key) => {
    setCart((prev) =>
      prev
        .map((c) => (c._key === key ? { ...c, qty: c.qty - 1 } : c))
        .filter((c) => c.qty > 0)
    );
  }, []);

  const handleCartClear = useCallback(() => setCart([]), []);

  const renderScreen = () => {
    if (screen === 'home') {
      return <CategoriasPrincipales onNavigate={handleCategoria} />;
    }
    if (SUBCATEGORIA_SCREENS.has(screen)) {
      return (
        <Subcategorias
          seccion={screen}
          onNavigate={navigate}
          onShowItems={showItems}
        />
      );
    }
    if (screen === 'items') {
      return (
        <Items
          menuKey={menuKey}
          onNavigate={navigate}
          cart={cart}
          onCartAdd={handleCartAdd}
          onCartRemove={handleCartRemove}
          onCartClear={handleCartClear}
          showCheckout={showCheckout}
          onOpenCheckout={() => setShowCheckout(true)}
          onCloseCheckout={() => setShowCheckout(false)}
          cartOpen={cartOpen}
          onOpenCart={() => setCartOpen(true)}
          onCloseCart={() => setCartOpen(false)}
        />
      );
    }
    return <CategoriasPrincipales onNavigate={handleCategoria} />;
  };

  const screenVariants = buildScreenVariants(navDirection);

  return (
    <Routes>
      <Route path="/admin/*" element={<AdminPanel />} />
      <Route path="/*" element={
        <div className="bruzz-app">
          {showSplash && <SplashScreen onDone={handleSplashDone} />}
          <EmberParticles />
          <FlyToCartLayer />
          <div className="wave" ref={waveRef} />

          {/* MEDIA 7: header que encoge al scroll */}
          <header
            ref={headerRef}
            className={`header${headerShrunk ? ' header--shrunk' : ''}`}
          >
            {/* ALTA 9: logo con wiggle al navegar */}
            <motion.div
              className="logo-ring"
              key={`logo-${logoWiggle}`}
              initial={{ opacity: logoWiggle === 0 ? 0 : 1, scale: logoWiggle === 0 ? 0.6 : 1, rotate: logoWiggle === 0 ? -8 : 0 }}
              animate={{ opacity: 1, scale: 1, rotate: [0, -5, 4, -2, 0] }}
              transition={
                logoWiggle === 0
                  ? { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
                  : { duration: 0.45, ease: 'easeInOut', times: [0, 0.25, 0.55, 0.75, 1] }
              }
            >
              <img src={logo} alt="Bruzz Pizza & Beer" />
            </motion.div>

            <motion.p
              className="tagline"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              Carta Digital · 2026
            </motion.p>

            {/* ALTA 3: CartChip con spring bounce — se maneja dentro de CartChip */}
            <CartChip cart={cart} onOpen={() => setCartOpen(true)} />
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={screen === 'items' ? `items-${menuKey}-${showCheckout}` : screen}
              className="screen-transition"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>

          {/* MEDIA 8: CartPanel con spring lateral — manejado en el componente */}
          <AnimatePresence>
            {cartOpen && (
              <CartPanel
                cart={cart}
                onClose={() => setCartOpen(false)}
                onCartAdd={handleCartAdd}
                onCartRemove={handleCartRemove}
                onCartClear={handleCartClear}
                onCheckout={() => {
                  setCartOpen(false);
                  setShowCheckout(true);
                  if (screen !== 'items') { setScreen('items'); }
                }}
              />
            )}
          </AnimatePresence>
        </div>
      } />
    </Routes>
  );
}
