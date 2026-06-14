// ============================================================
//  SplashScreen.jsx — Intro de marca con efecto "sello".
//  Se muestra una vez por sesión (sessionStorage) y luego
//  se desvanece revelando la carta.
// ============================================================

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from './assets/logo.png';

export default function SplashScreen({ onDone }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setExiting(true), 1150);
    const t2 = setTimeout(() => onDone(), 1750);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="splash-screen"
          exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }}
        >
          <motion.div
            className="splash-logo"
            initial={{ scale: 2.6, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.75, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <img src={logo} alt="Bruzz Pizza & Beer" />
            <motion.span
              className="splash-ring"
              initial={{ scale: 0.6, opacity: 0.8 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: 0.05 }}
            />
          </motion.div>
          <motion.p
            className="splash-tagline"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            Pizza &amp; Beer
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
