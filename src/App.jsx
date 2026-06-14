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

const SUBCATEGORIA_SCREENS = new Set(['comidas', 'bebidas']);

// ── Transición entre pantallas ───────────────────────────
const screenVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -14, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } },
};

export default function App() {
  const [screen, setScreen]       = useState('home');
  const [menuKey, setMenuKey]      = useState(null);
  const [cart, setCart]            = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [cartOpen, setCartOpen]         = useState(false);
  const waveRef = useRef(null);

  // ── Splash de marca: una vez por sesión ──────────────────
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem('bruzz_splash_shown');
  });

  const handleSplashDone = useCallback(() => {
    sessionStorage.setItem('bruzz_splash_shown', '1');
    setShowSplash(false);
  }, []);

  // ── Parallax sutil de la "wave" superior con GSAP ScrollTrigger ──
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
    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, []);

  useEffect(() => {
  console.log(
`%c
⠀
⢕⢅⠧⡱⡑⢕⠜⡌⡎⡪⣸⠢⡣⡪⠢⡃⡊⡢⢍⣢⢸⡸⣌⡆⡕⢜⢜⢌⠢⡑⡸⡠⠀⠠⠀⢁⠈⠀⡁⠈⡀⢁⢀⠁⠄⠁⠄⠁⠠⠈⠠⠈⠠⠁⠄⠂⠄⢢⠨⡐⠠⢂⢂⢐⠌⡂⡂⡢⢑⢀⠂⡂⡂⡢⢢⠢⠡⡂⡪⢐⠔⢌⠔⡁⡊⠔⡑⠔⢔⠱⡘⡜⢔⢜⢔⠕⢌⠪⡢⡂
⡇⡕⡝⡜⡜⡜⠜⠜⠘⢈⢎⢎⢮⠪⡊⠔⡨⢨⣗⠢⡑⠌⡌⡽⡜⢌⢎⡢⡑⠔⢌⢲⢈⠠⠐⢀⠀⡁⠀⠄⠠⢀⠐⠠⠈⠄⠂⡁⢐⠈⠠⠈⡀⠂⡐⠠⡈⢆⠕⡈⢌⢂⢊⢐⠈⢌⠌⠔⢐⠐⠨⢐⢌⠢⡑⢌⠪⣂⠪⡐⠡⢑⢐⢐⢌⠪⡘⢜⢐⠕⡌⡪⡘⢔⠅⡇⡇⡕⢜⠀
⠃⠐⠨⠈⡈⢀⢡⢤⣢⡪⡢⡫⡪⡱⣈⢂⠢⡱⡇⡑⢌⢊⢴⢏⠜⡌⢎⣆⠣⡡⢑⠌⠮⡄⠂⠄⠂⠠⢁⢂⠁⡀⠂⡁⠐⡀⢁⠠⠀⠂⡁⠐⡀⠂⡀⢂⢊⡂⢅⢂⠪⢐⣁⣂⣅⣢⡸⣀⠂⠅⢅⢕⢐⠅⡊⡢⡣⡣⡑⢌⠌⢔⢐⠔⠔⡅⡣⢱⠨⡪⡐⢅⠕⢅⠇⠕⡱⡡⢑⢔
⠈⠠⠑⢀⠀⣼⢑⠡⡂⢍⠻⣪⣪⣢⠞⢍⢋⠳⣳⠨⡂⢥⣻⢐⠕⢌⢒⢜⣕⢔⡡⣘⠬⢪⠱⢀⢑⠨⠠⡁⢐⠀⢂⠀⡁⠠⢀⠐⠈⠠⠀⡁⠀⢂⠐⣅⢅⢌⣢⢶⢝⢯⡺⣪⡺⣪⡫⡫⡯⣗⢶⣌⡆⠕⡌⡢⡣⡣⡣⡣⡑⡑⢔⢅⢣⠪⡪⢢⢣⢱⢸⢨⢊⠢⠡⡱⡐⢌⢢⠣
⠀⠂⠈⡀⢀⢺⡐⢅⠪⡐⢅⠢⡊⢔⢡⢑⠌⡌⡪⢇⡪⢐⠜⠳⡬⣊⠔⡡⠪⣂⠐⡀⠂⡐⢀⢂⠐⢅⠕⡨⢀⠂⡂⠄⠐⠀⠄⠠⠈⢀⠐⠀⡑⡷⣼⢺⢗⢯⢮⢳⢝⢵⡹⣪⡺⣪⡺⣹⡪⡺⣜⢎⢯⡳⣜⢜⢌⢎⢮⢢⢣⠪⡢⡑⡆⢕⠸⠨⡂⢇⢇⢎⡪⣨⣘⢌⠈⠂⠊⠌
⢁⠈⡀⠄⡢⠹⢎⢔⠡⡊⢔⢑⠌⡢⢑⠢⡕⡰⠨⡊⢕⢕⡌⡪⢐⢑⠝⡲⢵⢪⣊⣂⣁⢄⢢⢢⠱⢐⣀⡂⠄⠂⠄⠂⡁⠌⢀⠂⡈⢠⢸⣻⡺⣝⢵⡫⣫⢞⡎⣗⢽⡱⣝⢮⢮⡣⡯⡺⣜⣝⢎⣏⢧⡫⡞⡷⡱⡡⡣⡃⡇⡇⡇⣇⢊⠪⠨⡊⠊⢢⢞⢝⢼⢱⢽⣑⣀⡡⠈⠌
⢀⢂⠀⢂⠠⠐⠈⡣⣕⠨⡂⠆⢕⠨⠢⡑⢌⢊⠇⢎⢆⢕⡘⡜⠦⣱⢨⢐⠔⢅⠢⡡⢃⠍⠭⣙⡝⢣⠳⡹⢧⡈⠄⠁⠄⢐⠀⢂⠠⢑⣗⢯⢺⡪⣇⢯⢎⢧⡫⡮⡳⣹⢜⢮⣺⢜⢮⡫⣎⢮⢧⢳⡣⡯⣺⡽⡇⣗⢵⢱⣣⡳⡱⡱⠐⡀⠅⡐⢈⣞⢕⡕⣇⡿⡱⣕⠗⠋⠌⠐
⡢⡑⡈⠀⠄⠂⡥⡪⡪⢳⣜⣌⠢⡑⡑⢌⠢⡑⢌⠢⡊⢔⠡⡑⢍⠌⢕⢑⢍⢎⠬⣒⢕⢕⢕⢷⡐⠡⠨⢨⢠⡃⠄⠡⢈⠠⠐⢀⢂⡿⡜⡮⣳⢹⣜⢮⡫⣗⣝⣾⡹⡪⡯⣧⣫⢯⡳⠏⠾⢽⡳⡳⡹⣯⢫⡪⡺⡸⠪⠣⠣⡳⠁⠂⠁⠀⢂⠐⢼⢪⡣⣳⢏⡮⡋⢂⠐⠐⡀⡁
⢑⠨⠀⠌⠠⠑⠀⠂⠐⠐⣕⡌⡫⠲⡱⢥⢪⣐⣅⢪⢐⢅⢪⢨⣂⢥⢕⢔⢕⠪⡩⣊⠆⡓⢁⠁⡙⡦⠡⢈⢸⢐⠈⡐⢀⠂⠌⡀⣶⡫⡮⡳⡵⣝⡎⠷⡽⢑⠓⠡⢙⠫⢃⠂⠅⢂⣨⠰⠈⠌⣷⡹⡵⢽⠪⢊⠊⠄⠂⠐⠀⠄⠂⠐⠈⠀⠄⠀⣟⢮⣺⣺⠝⠠⠈⠠⠈⠄⡰⡘
⠂⠐⠈⡀⠂⠄⢁⠁⠌⠀⠄⡙⡚⠮⣆⣕⢰⢐⢌⠪⡑⡑⢅⢃⠢⣑⢔⡔⠦⠓⠑⠀⢂⠀⡂⢐⠼⠠⢁⠂⡎⠄⢂⢐⢀⢂⠡⢀⢷⢝⢮⡫⡺⣜⡇⠐⢔⢄⣌⢌⢔⠬⠦⠚⠘⠉⢢⠨⠀⠅⢺⡺⡪⡯⡧⡀⠄⠂⠈⡀⢈⠀⠐⢀⠨⠐⢰⢋⠩⠹⡬⢻⡌⠄⡁⢌⡰⡱⡱⡱
⡐⠈⠠⠐⠈⡀⢂⠐⢈⠀⡂⠠⠈⠐⡀⠈⠌⠙⠘⡚⠚⡚⠚⡊⠋⡈⠄⠂⢁⠐⢀⠡⠀⢂⠐⡸⠡⠨⠠⢈⡇⢐⠠⠐⢀⠂⡐⠠⣻⢕⡗⣝⢽⡸⣇⢁⠂⡪⠀⢠⠀⠈⡇⠁⠒⠈⢠⡱⢈⠐⠨⣯⢺⡪⡯⣆⠀⠐⢀⠠⠀⠄⠁⠄⠂⠄⣻⠀⡪⠳⡍⡆⡹⠌⡊⢃⠊⡊⠡⠁
⡀⠌⠐⢈⠠⠐⡀⢂⠐⡀⠂⠄⡁⠁⠄⠨⠀⡁⢂⠂⡐⠈⡂⠄⢁⠠⠀⠌⢀⠐⢀⠐⢈⠠⢐⡍⢂⠡⠈⠄⡇⠂⠠⠈⠠⠐⠀⠌⣗⢗⣝⢮⡣⣏⢗⠠⠘⢔⣄⠀⢤⢑⠩⣉⠲⡜⠎⡂⡐⠈⠌⣗⢗⡵⡝⣞⣆⠁⡀⠄⠐⡀⠅⠨⠠⢁⡜⢐⠨⠐⡭⠪⠡⡁⡐⢀⠂⠄⠡⠈
⠀⡂⠡⠐⡀⢂⠐⡀⠂⠄⠡⠐⢀⠡⠈⡀⠂⠄⠂⡀⠂⡐⢀⠐⠀⠄⠂⡐⠀⡂⠄⠂⡀⢂⢸⠐⡀⢂⠡⠁⢯⠀⠂⢁⠀⠂⠁⠄⢽⢵⢕⢧⡫⣎⢿⡌⠨⢐⠊⠝⠱⠨⢐⠠⠑⡐⣐⣄⣒⠥⡈⣯⡣⣗⢝⢮⡺⡦⠀⠄⢁⠠⠀⠅⠨⡰⡁⠂⠄⠅⡯⢈⢂⠐⡀⡂⠌⡈⠌⠨
⢂⠐⡈⠄⠂⡐⠐⡀⠡⢈⠐⢈⠠⠐⠀⠂⡁⠐⡀⠂⢁⠠⠀⠂⡁⠄⡁⠄⠂⠄⠂⡁⢐⠀⡗⡐⠠⠁⠄⠅⢹⠄⠁⢄⣂⣡⣐⡠⠸⣳⡹⣕⣝⢮⢮⣳⠡⡃⣵⣟⣾⠨⠰⠐⢱⣎⢼⣽⠞⢌⠔⢸⡺⣪⣏⢧⢟⠾⠁⠐⡀⢐⠈⢌⢰⢃⠂⠡⡈⠄⣏⠢⠂⡂⢂⢔⠀⡂⠌⠄
⠀⠂⡀⠄⠁⠄⢂⠐⡈⠠⠐⡀⢂⢈⠈⠄⠄⠁⠄⡈⠄⠐⢈⠠⠐⠀⠄⠂⡁⢂⢁⠐⡀⢂⢳⠀⠅⡁⠅⠨⠐⡣⠋⠅⢂⠐⡀⡊⠩⣳⢽⢗⢮⢳⢷⡹⡅⠅⡘⢚⢷⢓⢹⢋⡹⠆⠎⢑⠈⠄⢂⠑⡯⡾⢈⠳⠿⠦⣁⢔⠴⠦⠮⡤⡎⡐⢈⢐⠠⢸⢁⠊⡀⢂⢐⠀⠄⠄⠂⡈
⢈⠠⠀⢂⠡⠈⠄⠂⠄⡁⢂⠐⠠⠐⢈⠠⠈⠄⠁⠄⠠⠁⠄⠂⡈⠄⡁⢂⠐⠠⠐⠐⠈⡀⠺⡌⡐⡀⠊⠄⡁⡂⠡⢁⠂⠌⠠⠠⠁⠌⠟⠌⢟⣮⠯⠙⢃⠡⠐⡀⢂⠐⠄⠡⠐⡈⡐⢐⠈⡐⢐⠠⠨⠈⠄⢂⠂⠌⡈⡐⢐⠐⢐⠈⡐⢐⢀⢂⢐⡜⡀⢂⠠⠁⢂⠈⠠⠐⠀⠄
⠀⠄⠂⡀⠄⠂⢈⠀⢂⠠⠠⠈⠄⠡⠐⢀⠡⠈⠠⠁⠂⡁⠄⠁⠄⠢⠂⡂⠌⡐⠈⠄⠂⠠⠀⠹⢤⡠⣁⠂⡂⠄⡁⡂⠨⠠⠡⠈⠌⠠⠡⠈⠄⠌⠌⠨⡀⡂⠡⠐⡐⠨⠠⡁⡂⡂⠔⢐⠐⣐⠆⠂⠌⠄⠅⢢⠨⠐⡀⢂⠐⡈⠄⠂⡂⢂⢐⣄⠞⠠⠐⠀⠄⢈⠀⡐⢀⠂⡁⡐
⠂⠐⠀⠄⠂⢈⠠⠈⠀⠠⠀⠂⠈⢀⠈⠀⠄⠈⠄⠁⠂⠀⠄⠁⡈⢀⠁⠠⠐⠀⡈⠄⠂⠐⢈⠠⠀⡈⠕⠦⣂⢅⠄⡂⠡⠈⢄⢅⡬⠨⠀⠅⠡⠈⠄⠡⠠⠑⠥⣁⢐⠨⠐⡈⢐⢈⢐⠤⢚⢀⠂⠅⠌⡐⢈⠐⣧⡁⠔⠠⢁⢐⢈⠐⡀⣂⠖⠅⠅⠡⢈⠂⠅⠂⠌⢀⠂⠁⠄⠂
⠂⠁⠐⠀⠌⠀⠠⠀⡁⠄⠂⢀⠁⢀⠀⠂⠀⠂⠀⠂⠈⠀⡀⠂⠀⡀⠐⢀⠐⠀⠄⠠⠈⢠⠠⠠⠐⠠⠐⠠⠀⠅⡩⠙⡉⠋⠅⡽⢀⠂⠅⡇⡁⠅⡁⠅⠌⠄⠡⠠⢉⠊⡒⢂⠣⠊⠡⢈⠄⢂⠨⠀⠅⡐⠠⣱⠅⠊⠙⡑⢒⠒⡒⠚⡊⠡⢈⠐⢈⠐⡀⠂⠄⢁⠂⠄⠂⢁⠐⢀
⢀⠈⢀⠁⠠⠈⠀⠄⠀⠄⠠⠀⠠⠀⠀⠂⠁⠀⠈⠀⡀⠁⠀⠀⠂⢀⠈⡀⠠⡐⠐⠁⡁⢁⠐⢈⠠⠁⠌⠠⠁⠂⠄⠂⠠⢁⢸⠅⠂⠌⠠⠑⡆⡂⢐⠈⠄⡁⠅⠌⠠⢂⠐⡀⡂⡁⠅⢂⢐⠠⠂⡁⠅⠤⢓⠉⣆⠄⠁⡀⠄⠂⡀⠡⠀⠌⡀⢐⠀⡂⠄⠂⢈⠀⠄⠂⢈⠀⡐⠀
⠀⠠⠀⠐⠀⡀⠁⡀⠂⠀⠄⠠⠀⡀⡁⡠⠠⠈⠄⠂⠄⢄⠢⠡⠊⠄⡁⠂⡁⠄⠨⠠⠐⢀⠐⠠⠐⠈⡀⠂⢁⠨⠀⠌⠐⠀⢜⠄⠡⠨⢈⠐⡈⠕⠢⠪⡰⠔⡌⠆⠅⢂⢐⢀⢂⠐⡈⠄⡐⠀⠅⡐⠈⠌⡀⡂⢼⡀⠄⠠⠐⠀⢂⠈⠄⠁⠄⠂⠠⢀⠐⡈⠀⡀⠂⠈⠀⡀⢀⠐
⠐⡀⢂⢁⢂⠐⡐⠐⡈⢐⠁⠌⠐⡀⢂⠠⠐⠈⡀⠡⠐⢀⠐⠐⠐⠠⠐⠠⠀⢂⠐⠠⠈⠠⠐⢀⠂⢁⠠⠈⡀⠄⠂⠄⠁⠌⢸⠠⠑⡈⠄⢂⠂⠌⠄⠅⡐⡀⢂⠂⠡⠐⡀⠂⠄⡂⢐⠐⠠⠁⠅⠄⠡⠁⠄⢂⢸⡂⠄⠂⠄⡁⢂⠐⢈⠀⡂⢁⠐⡀⠄⠂⠠⠀⠂⠁⠄⠠⠀⠠
⡂⠔⢀⠂⠄⠂⠄⠡⠐⡀⠂⠌⡀⠂⠄⠐⡀⠡⠐⢀⠡⠀⠌⠀⠅⠂⡈⠄⠈⠄⠠⠁⡈⠄⢈⠀⠐⠀⠄⠂⡀⠐⡀⠂⠁⠄⠈⢧⠡⠐⡈⠄⢂⠁⡂⠡⢀⢂⠐⡈⠄⠅⠄⠅⢂⠢⡢⠨⠐⡁⠌⠄⠡⠡⠈⢄⡺⢀⠂⡁⢂⠐⠠⠈⠄⢂⠐⡀⠂⠠⠐⠈⠀⠄⠁⠈⡀⠄⠂⠀
⠐⡈⠄⢂⠡⠨⠈⠄⠅⢂⠁⡂⠄⠡⠈⠄⠂⡐⠈⡀⠄⠂⡈⠄⠂⡐⠀⠄⠡⠐⡀⡁⠠⠐⠀⠄⠡⠈⠄⢂⠠⠁⠄⠨⠐⢈⠐⣸⡻⣔⡄⠌⡀⡂⠄⠅⢂⠐⡐⠐⡈⢐⢈⠐⡀⡂⠌⠠⢁⢐⠠⠁⠅⡨⣬⡞⠈⠄⢂⠐⠠⠈⠄⠡⢈⠠⠠⠐⠈⢀⠐⠈⠀⠐⠈⠀⠀⡀⠠⠐
⡂⡐⡈⠄⢂⠡⠁⠅⠌⡐⢐⠠⠈⠄⡁⢂⠁⠄⢂⠐⡀⠅⡀⢂⠡⠐⡈⠄⡁⡂⡐⠠⠁⠌⠨⠠⠁⢅⠨⢀⠂⠌⠄⡡⠈⠄⢂⠘⣮⢎⢯⢯⣲⢴⣨⣐⡐⡐⠠⢁⢐⠠⠂⢂⢐⠠⠨⢈⢄⣂⣔⢵⢳⢫⡗⠕⠚⠘⠢⢌⢄⢁⠈⡐⠀⠄⠐⠀⡈⢀⠀⠂⠁⡀⠂⠈⡀⠄⠠⠀
⡐⡀⠂⠌⡐⠠⢁⠅⢂⢂⠡⠐⡁⠅⢂⠂⠌⠄⠅⢂⢐⢐⠠⠡⠠⠡⢐⠐⡐⠠⢂⠡⠁⢅⠡⢁⠊⠌⡂⠢⠨⢐⠡⠠⠡⢁⢂⠂⠌⣛⡮⣪⢪⢝⢆⡇⡏⣏⢯⢳⢳⢺⢺⢲⢳⢹⡹⡹⡱⡕⣵⢱⡓⡯⢦⢤⣀⠐⠈⠀⠈⡈⠑⠔⢄⣂⢀⠁⢀⠀⠄⠂⠁⡀⠄⢁⠠⢀⠐⡀
⢐⠠⠡⢁⠂⠅⡂⠌⡐⠄⠌⡂⡂⠅⡂⠌⡂⠅⢌⢐⢐⠠⠨⢐⠁⢅⠢⠨⠠⠡⠊⡾⣨⢆⢂⠅⠌⡂⠌⠌⡨⢀⠂⠅⡊⡐⢐⢨⡺⣱⢱⣵⡫⡳⠗⠵⠽⢼⢜⡮⣪⣣⣫⢎⡧⠷⠵⢛⠚⠉⡈⠉⠚⢮⢧⢳⢹⡣⣆⠈⠀⡀⠐⠀⠠⠀⠉⠘⠰⠤⣂⠠⠁⠄⡐⢀⠂⠄⢂⠠
⡐⠨⠠⠡⡈⡂⡂⠅⡂⠅⠅⡂⠂⠅⡂⠅⠂⠅⡂⢂⠂⠌⠌⢄⢑⢐⠨⠨⠨⢈⠺⡼⡪⡹⡔⠈⠔⠠⠡⡁⣂⡢⡡⠥⠢⠒⢵⢏⢮⣪⠃⡀⠀⡀⠀⠄⠈⠀⡀⠠⠀⢀⠀⡀⠄⠐⠀⡀⠄⠠⠀⠐⠀⠠⠈⢻⡜⣜⢽⠄⠠⠀⡀⠁⠠⠐⠈⠀⠄⢀⠀⠉⠙⠒⠔⡔⣈⢐⠠⠂
⠂⠡⠁⠅⡐⡀⡂⠡⢐⠨⢐⠠⠡⢁⢂⠡⠁⠅⡂⠅⠌⠌⠌⡐⠠⠂⠌⡐⢡⢡⢢⣫⢪⠪⡖⠕⠓⠉⠉⠉⠀⡀⠄⢀⠐⠀⣟⢜⡕⡧⠀⠠⠀⠠⠀⠂⠈⠀⡀⠠⠐⠀⠀⡀⠀⠄⠂⠀⡀⠄⠐⠀⠁⡀⠂⢸⡣⣣⢳⢇⠐⠀⢀⠈⠀⡀⠄⠂⠀⠄⢀⠈⢀⠐⠀⠠⠈⠑⠊⠦
⠌⠨⠠⠡⠐⡀⢂⢁⢂⢐⠐⡈⠄⠡⠐⡈⠨⢐⠠⠡⠨⠈⠔⡈⠄⢅⠗⠉⠁⠁⠁⢸⢸⠱⡅⠀⠄⠂⠁⠀⠁⠀⡀⢀⠠⠈⣗⠵⣍⢗⠀⠂⠈⢀⠀⠂⠈⢀⠀⠄⠀⠄⠁⠀⠠⠀⠐⠀⡀⠠⠐⠈⠀⢀⢠⡟⡼⡸⣼⠁⢀⠈⠀⠀⠂⠀⢀⠀⠂⠀⠄⠀⠄⠀⠐⠀⠐⠀⠂⠀
⠡⠁⠌⠠⢁⢐⠐⠠⠐⡀⠂⠄⠡⢁⠂⡂⡁⡂⠄⠅⠌⠌⡐⣐⠬⠚⠀⡈⠀⠁⠐⢸⢸⢘⠎⠀⠠⠀⠂⠁⠈⠀⡀⢀⠀⢀⠺⣝⣜⢎⣧⠀⠁⢀⠀⠂⠁⢀⠠⠀⠂⠀⠂⠁⠀⠂⠁⢀⠀⠄⠀⠄⠈⠀⣸⡾⣾⣋⣁⣴⢴⡄⠈⠀⠂⠁⢀⠠⠈⠀⠐⠀⠐⠈⠀⡈⠀⠂⠈⢀
⠄⠡⢁⠁⡂⢐⠈⠄⠡⠠⠁⠅⠡⠐⡀⡂⡐⡀⡊⠄⡑⡈⡐⡜⠀⠐⠀⠠⠈⠀⠁⣸⢸⡸⠐⠈⠀⠀⠂⢀⠁⠠⠀⢀⡶⡶⣴⢤⣾⣻⡽⡄⠈⠀⡀⠐⠈⠀⠀⠠⠀⢁⠀⠂⠁⠀⠂⢀⠠⠀⠂⠠⠈⠠⡾⡽⠓⢯⠿⠞⠏⢁⠀⢁⠀⠂⢀⠀⠄⠈⡀⢈⠀⠂⠁⠀⠐⠈⠀⡀
⠨⠐⡀⢂⢐⠐⡈⠨⠠⠡⠨⠈⠄⠅⡂⡐⡐⡐⠠⡁⡂⡂⡂⢯⡀⠂⠁⠢⢂⡈⢠⢇⢇⠇⠐⠀⢈⠀⡈⠀⡀⠄⠂⠀⠛⠽⠞⠟⠞⠅⠛⠁⢈⠀⠀⠄⠂⠈⠀⠄⠂⠀⠠⠐⠈⠀⡈⠀⠀⠠⠐⠀⠐⠀⠐⠀⠠⠀⠠⠐⠀⠠⠀⠄⢀⠈⠀⢀⠀⠂⠀⡀⠠
% Oh No Hermano`,
'color: #00ffcc; font-family: monospace; font-size: 10px;',
  );
}, []);

  const navigate = useCallback((screenId) => setScreen(screenId), []);

  const showItems = useCallback((key) => {
    setMenuKey(key);
    setScreen('items');
  }, []);

  const handleCategoria = useCallback((screenId) => {
    if (screenId === 'postres') { setMenuKey('postres'); setScreen('items'); return; }
    if (screenId === 'tragos')  { setMenuKey('tragos');  setScreen('items'); return; }
    if (screenId === 'cafeteria') { setMenuKey('cafeteria'); setScreen('items'); return; }
    setScreen(screenId);
  }, []);

  // ── Carrito: agregar (con qty y note opcionales) ─────
const handleCartAdd = useCallback((item) => {
  const qty             = item.qty             ?? 1;
  const note            = item.note            ?? '';
  const medallon        = item.medallon        ?? '';
  const sintaccVariedad = item.sintaccVariedad ?? '';
  // Clave única: nombre + nota + medallón + variedad sinTacc
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

  // ── Carrito: quitar una unidad ───────────────────────
  const handleCartRemove = useCallback((key) => {
    setCart((prev) =>
      prev
        .map((c) => (c._key === key ? { ...c, qty: c.qty - 1 } : c))
        .filter((c) => c.qty > 0)
    );
  }, []);

  // ── Carrito: vaciar ──────────────────────────────────
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

 return (
    <Routes>
      <Route path="/admin/*" element={<AdminPanel />} />
      <Route path="/*" element={
        <div className="bruzz-app">
          {showSplash && <SplashScreen onDone={handleSplashDone} />}
          <EmberParticles />
          <FlyToCartLayer />
          <div className="wave" ref={waveRef} />
          <header className="header">
            <motion.div
              className="logo-ring"
              initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
        </div>
      } />
    </Routes>
  );
}
