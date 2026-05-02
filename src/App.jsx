// App.jsx — REEMPLAZAR COMPLETAMENTE
// ✅ Tragos va directo a items (ya no tiene subcategorías)

import { useState, useCallback } from 'react';
import './App.css';
import logo from './assets/logo.png';
import CategoriasPrincipales from './CategoriasPrincipales';
import Subcategorias         from './Subcategorias';
import Items                 from './Items';

// Secciones que tienen subcategorías propias
// ✅ 'tragos' fue removido — ahora va directo a items
const SUBCATEGORIA_SCREENS = new Set(['comidas', 'bebidas']);

export default function App() {
  const [screen, setScreen]   = useState('home');
  const [menuKey, setMenuKey] = useState(null);

  const navigate = useCallback((screenId) => {
    setScreen(screenId);
  }, []);

  const showItems = useCallback((key) => {
    setMenuKey(key);
    setScreen('items');
  }, []);

  const handleCategoria = useCallback((screenId) => {
    // Postres → directo a items
    if (screenId === 'postres') {
      setMenuKey('postres');
      setScreen('items');
      return;
    }
    // Tragos → directo a items (menuKey 'tragos' en MENU)
    if (screenId === 'tragos') {
      setMenuKey('tragos');
      setScreen('items');
      return;
    }
    // Comidas y Bebidas → pantalla de subcategorías
    setScreen(screenId);
  }, []);

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
      return <Items menuKey={menuKey} onNavigate={navigate} />;
    }
    return <CategoriasPrincipales onNavigate={handleCategoria} />;
  };

  return (
    <div className="bruzz-app">
      <div className="wave" />
      <header className="header">
        <div className="logo-ring">
          <img src={logo} alt="Bruzz Pizza & Beer" />
        </div>
        <p className="tagline">Carta Digital · 2025</p>
      </header>
      {renderScreen()}
    </div>
  );
}
