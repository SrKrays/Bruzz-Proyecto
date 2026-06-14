import { useState, useEffect } from 'react';
import logo from './assets/logo.png';

const API = 'https://bruzz-api.onrender.com';

/* ─── Estilos globales inyectados una sola vez ─────────────── */
const ADMIN_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --black:       #0a0a0a;
    --dark:        #111111;
    --dark2:       #161616;
    --dark3:       #1c1c1c;
    --green:       #1a4a2e;
    --green-mid:   #2d6b45;
    --green-light: #3d8a5a;
    --gold:        #f5c842;
    --gold-dim:    #c9a230;
    --gold-ghost:  rgba(245,200,66,0.12);
    --gold-border: rgba(245,200,66,0.22);
    --cream:       #f0ead8;
    --muted:       #888880;
    --danger:      #e05252;
    --success:     #4caf50;
    --fast: 200ms cubic-bezier(.4,0,.2,1);
    --mid:  400ms cubic-bezier(.4,0,.2,1);
  }

  .adm-root * { box-sizing: border-box; margin: 0; padding: 0; }
  .adm-root { font-family: 'DM Sans', sans-serif; background: var(--black); color: var(--cream); min-height: 100vh; }
  .adm-root button { font-family: 'DM Sans', sans-serif; cursor: pointer; }

  /* ── Login ─────────────────────────────────────────── */
  .adm-login-wrap {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: var(--black); position: relative; overflow: hidden;
  }
  .adm-login-wave {
    position: absolute; top: 0; left: 0; right: 0; height: 260px;
    background: var(--green);
    clip-path: ellipse(120% 100% at 50% 0%);
    z-index: 0;
  }
  .adm-login-box {
    position: relative; z-index: 2;
    background: var(--dark2); border: 1px solid var(--gold-border);
    border-radius: 20px; padding: 2.5rem 2rem; width: 380px;
    text-align: center; box-shadow: 0 24px 60px rgba(0,0,0,0.6);
    animation: admFadeUp var(--mid) both;
  }
  .adm-login-logo { width: 80px; height: 80px; object-fit: contain; margin-bottom: 1rem; }
  .adm-login-title {
    font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 900;
    color: var(--gold); margin-bottom: 0.25rem;
  }
  .adm-login-sub { color: var(--muted); font-size: 0.85rem; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 2rem; }
  .adm-form { display: flex; flex-direction: column; gap: 0.9rem; }
  .adm-input {
    padding: 0.8rem 1rem; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04);
    color: var(--cream); font-family: 'DM Sans', sans-serif; font-size: 1rem; width: 100%;
    transition: border-color var(--fast); outline: none;
  }
  .adm-input:focus { border-color: var(--gold-dim); }
  .adm-input::placeholder { color: var(--muted); }
  .adm-input option { background: var(--dark2); }
  .adm-error { color: var(--danger); font-size: 0.85rem; }
  .adm-btn-primary {
    padding: 0.85rem; border-radius: 10px; background: var(--gold); color: var(--black);
    font-weight: 700; border: none; font-size: 1rem; letter-spacing: 0.5px;
    transition: filter var(--fast), transform var(--fast);
  }
  .adm-btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
  .adm-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  /* ── Dashboard layout ───────────────────────────────── */
  .adm-dash { display: flex; min-height: 100vh; background: var(--black); }

  /* ── Sidebar ────────────────────────────────────────── */
  .adm-sidebar {
    width: 240px; background: var(--dark); border-right: 1px solid rgba(255,255,255,0.06);
    padding: 1.5rem 1rem; display: flex; flex-direction: column; gap: 0.4rem;
    position: fixed; height: 100vh; top: 0; left: 0; z-index: 10;
  }
  .adm-sidebar-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
  .adm-sidebar-logo { width: 40px; height: 40px; object-fit: contain; }
  .adm-sidebar-brand {
    font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 900; color: var(--gold);
  }
  .adm-sidebar-user {
    color: var(--muted); font-size: 0.78rem; letter-spacing: 1px;
    text-transform: uppercase; margin-bottom: 0.75rem;
    padding: 0.5rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .adm-nav-btn {
    padding: 0.65rem 0.85rem; border-radius: 10px; border: none;
    background: transparent; color: var(--muted); text-align: left;
    font-size: 0.9rem; font-family: 'DM Sans', sans-serif;
    transition: background var(--fast), color var(--fast);
    display: flex; align-items: center; gap: 0.6rem;
  }
  .adm-nav-btn:hover { background: var(--gold-ghost); color: var(--cream); }
  .adm-nav-btn.active {
    background: var(--gold-ghost); color: var(--gold);
    font-weight: 600; border: 1px solid var(--gold-border);
  }
  .adm-sidebar-spacer { flex: 1; }
  .adm-btn-publish {
    padding: 0.75rem 1rem; border-radius: 10px; border: 1px solid var(--green-light);
    background: rgba(26,74,46,0.4); color: #6fcf97;
    font-size: 0.9rem; font-family: 'DM Sans', sans-serif; font-weight: 600;
    display: flex; align-items: center; gap: 0.5rem;
    transition: background var(--fast), border-color var(--fast);
  }
  .adm-btn-publish:hover { background: rgba(26,74,46,0.7); border-color: var(--green-light); }
  .adm-btn-logout {
    padding: 0.6rem 1rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);
    background: transparent; color: var(--muted); font-size: 0.85rem;
    font-family: 'DM Sans', sans-serif; margin-top: 0.4rem;
    transition: color var(--fast), border-color var(--fast);
  }
  .adm-btn-logout:hover { color: var(--danger); border-color: var(--danger); }

  /* ── Contenido principal ────────────────────────────── */
  .adm-content { margin-left: 240px; flex: 1; }

  /* ── Content header (wave) ──────────────────────────── */
  .adm-content-header {
    position: relative; overflow: hidden;
    background: var(--dark); border-bottom: 1px solid rgba(255,255,255,0.06);
    padding: 1.5rem 2rem 1.2rem;
  }
  .adm-content-wave {
    position: absolute; top: 0; left: 0; right: 0; height: 100%;
    background: var(--green);
    clip-path: ellipse(120% 200% at 50% 0%);
    opacity: 0.25; z-index: 0; pointer-events: none;
  }
  .adm-content-header-inner { position: relative; z-index: 1; }
  .adm-section-title {
    font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 900; color: var(--gold);
  }
  .adm-section-sub { color: var(--muted); font-size: 0.82rem; margin-top: 2px; }

  /* ── Cuerpo del contenido ───────────────────────────── */
  .adm-content-body { padding: 1.5rem 2rem; }

  /* ── Buscador ───────────────────────────────────────── */
  .adm-search-wrap { margin-bottom: 1.25rem; max-width: 440px; position: relative; }
  .adm-search-icon { position: absolute; left: 0.9rem; top: 50%; transform: translateY(-50%); color: var(--muted); font-size: 0.9rem; }
  .adm-search {
    width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem;
    border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);
    background: var(--dark2); color: var(--cream);
    font-family: 'DM Sans', sans-serif; font-size: 0.95rem; outline: none;
    transition: border-color var(--fast);
  }
  .adm-search:focus { border-color: var(--gold-dim); }
  .adm-search::placeholder { color: var(--muted); }

  /* ── Tabla de items ─────────────────────────────────── */
  .adm-tabla { display: flex; flex-direction: column; gap: 0.5rem; }

  .adm-item-row {
    display: flex; justify-content: space-between; align-items: center;
    background: var(--dark2); border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px; padding: 0.85rem 1rem; gap: 1rem;
    transition: border-color var(--fast), opacity var(--fast);
    animation: admFadeUp var(--mid) both;
  }
  .adm-item-row:hover { border-color: var(--gold-border); }
  .adm-item-row.inactivo { opacity: 0.45; }

  .adm-item-info { display: flex; flex-direction: column; gap: 0.2rem; flex: 1; min-width: 0; }
  .adm-item-nombre { font-weight: 600; color: var(--cream); font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .adm-item-sub { font-size: 0.75rem; color: var(--muted); }

  .adm-item-acciones { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
  .adm-item-precio { color: var(--gold); font-weight: 700; min-width: 90px; text-align: right; font-size: 0.95rem; }

  .adm-input-precio {
    width: 110px; padding: 0.4rem 0.6rem; border-radius: 8px;
    border: 1px solid var(--gold-dim); background: rgba(245,200,66,0.06);
    color: var(--cream); font-family: 'DM Sans', sans-serif; font-size: 0.9rem; outline: none;
  }

  /* Botones de acción en cada fila */
  .adm-btn-sm {
    padding: 0.4rem 0.75rem; border-radius: 8px; border: none;
    font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 500;
    display: flex; align-items: center; gap: 0.3rem;
    transition: filter var(--fast), transform var(--fast);
  }
  .adm-btn-sm:hover { filter: brightness(1.15); transform: translateY(-1px); }
  .adm-btn-edit   { background: rgba(74,158,255,0.12); color: #63b3ed; border: 1px solid rgba(74,158,255,0.3); }
  .adm-btn-save   { background: rgba(76,175,80,0.15);  color: #6fcf97; border: 1px solid rgba(76,175,80,0.35); }
  .adm-btn-cancel { background: rgba(224,82,82,0.12);  color: #f87171; border: 1px solid rgba(224,82,82,0.3); }
  .adm-btn-toggle-hide { background: var(--dark3); color: var(--muted); border: 1px solid rgba(255,255,255,0.1); }
  .adm-btn-toggle-show { background: rgba(76,175,80,0.1); color: #6fcf97; border: 1px solid rgba(76,175,80,0.25); }
  .adm-btn-del    { background: rgba(224,82,82,0.1);  color: #f87171; border: 1px solid rgba(224,82,82,0.25); padding: 0.4rem 0.6rem; }

  /* ── Formulario agregar ─────────────────────────────── */
  .adm-form-wrap { display: flex; flex-direction: column; gap: 1rem; max-width: 520px; }
  .adm-check-label { color: var(--cream); display: flex; align-items: center; gap: 0.6rem; font-size: 0.9rem; cursor: pointer; }
  .adm-check-label input[type="checkbox"] { accent-color: var(--gold); width: 16px; height: 16px; }

  /* ── Toast ──────────────────────────────────────────── */
  .adm-toast {
    position: fixed; top: 1.25rem; right: 1.25rem; z-index: 999;
    background: var(--dark2); border: 1px solid var(--gold-border);
    border-radius: 12px; padding: 0.85rem 1.25rem;
    color: var(--cream); font-size: 0.9rem; font-weight: 500;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    animation: admFadeUp 250ms both;
    display: flex; align-items: center; gap: 0.5rem;
  }

  /* ── Loading ────────────────────────────────────────── */
  .adm-loading { color: var(--muted); padding: 2rem 0; text-align: center; }
  .adm-empty   { color: var(--muted); padding: 2rem 0; text-align: center; font-size: 0.9rem; }

  /* ── Animación ──────────────────────────────────────── */
  @keyframes admFadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Uploader de imágenes ───────────────────────────── */
  .adm-img-panel {
    margin-top: 0.75rem;
    background: var(--dark3); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem;
    animation: admFadeUp 200ms both;
  }
  .adm-img-preview-wrap {
    width: 100%; height: 140px; border-radius: 8px; overflow: hidden;
    background: rgba(255,255,255,0.04); border: 1px dashed rgba(255,255,255,0.12);
    display: flex; align-items: center; justify-content: center;
  }
  .adm-img-preview { width: 100%; height: 100%; object-fit: cover; }
  .adm-img-placeholder { color: var(--muted); font-size: 0.8rem; text-align: center; padding: 1rem; }
  .adm-img-file-input { display: none; }
  .adm-img-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .adm-btn-img-select {
    padding: 0.4rem 0.85rem; border-radius: 8px; font-size: 0.8rem; font-weight: 500;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    background: rgba(245,200,66,0.1); color: var(--gold);
    border: 1px solid var(--gold-border);
    transition: filter var(--fast);
  }
  .adm-btn-img-select:hover { filter: brightness(1.2); }
  .adm-btn-img-upload {
    padding: 0.4rem 0.85rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    background: rgba(76,175,80,0.15); color: #6fcf97;
    border: 1px solid rgba(76,175,80,0.35);
    transition: filter var(--fast);
  }
  .adm-btn-img-upload:hover:not(:disabled) { filter: brightness(1.2); }
  .adm-btn-img-upload:disabled { opacity: 0.5; cursor: not-allowed; }
  .adm-img-status { font-size: 0.78rem; color: var(--muted); align-self: center; }

  /* ── Responsive mobile ──────────────────────────────── */
  @media (max-width: 768px) {
    .adm-sidebar { width: 100%; height: auto; position: relative; flex-direction: row; flex-wrap: wrap; padding: 1rem; }
    .adm-sidebar-spacer { display: none; }
    .adm-content { margin-left: 0; }
    .adm-content-body { padding: 1rem; }
    .adm-item-acciones { flex-direction: column; align-items: flex-end; }
  }
`;

function injectAdminCSS() {
  if (document.getElementById('bruzz-admin-css')) return;
  const style = document.createElement('style');
  style.id = 'bruzz-admin-css';
  style.textContent = ADMIN_CSS;
  document.head.appendChild(style);
}

// ── Uploader de imágenes reutilizable ────────────────────────
// Props:
//   token       → JWT para autorizar el upload
//   currentUrl  → URL actual de la imagen (para preview inicial)
//   onUploaded  → callback(url) cuando la subida termina OK
function ImageUploader({ token, currentUrl, onUploaded }) {
  const [preview, setPreview]   = useState(currentUrl || '');
  const [file, setFile]         = useState(null);
  const [status, setStatus]     = useState('');
  const [loading, setLoading]   = useState(false);
  const inputRef = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setStatus(f.name);
    // Preview local inmediato
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setStatus('⏳ Subiendo...');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API}/api/images/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) { setStatus(`❌ ${data.message}`); return; }
      setStatus('✅ Subida OK');
      setFile(null);
      onUploaded(data.url);
    } catch {
      setStatus('❌ Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-img-panel">
      {/* Preview */}
      <div className="adm-img-preview-wrap">
        {preview
          ? <img src={preview} alt="preview" className="adm-img-preview" />
          : <span className="adm-img-placeholder">Sin imagen</span>
        }
      </div>

      {/* Acciones */}
      <div className="adm-img-actions">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="adm-img-file-input"
          id="adm-file-input"
          onChange={handleFileChange}
        />
        <label htmlFor="adm-file-input" className="adm-btn-img-select">
          📁 Elegir imagen
        </label>
        <button
          className="adm-btn-img-upload"
          onClick={handleUpload}
          disabled={!file || loading}
        >
          ☁ Subir a Ferozo
        </button>
        {status && <span className="adm-img-status">{status}</span>}
      </div>
    </div>
  );
}

// ── Login ────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) { setError('Email o contraseña incorrectos'); return; }
      const data = await res.json();
      localStorage.setItem('bruzz_token', data.token);
      localStorage.setItem('bruzz_nombre', data.nombre);
      onLogin(data.token, data.nombre);
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-root">
      <div className="adm-login-wrap">
        <div className="adm-login-wave" />
        <div className="adm-login-box">
          <img src={logo} alt="Bruzz" className="adm-login-logo" />
          <h1 className="adm-login-title">Bruzz Admin</h1>
          <p className="adm-login-sub">Panel de administración</p>
          <form onSubmit={handleSubmit} className="adm-form">
            <input
              className="adm-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              className="adm-input"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {error && <p className="adm-error">{error}</p>}
            <button className="adm-btn-primary" type="submit" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Fila de item ─────────────────────────────────────────────
function ItemRow({ item, subcats, onPrecio, onToggle, onEliminar, onImagenActualizada, token }) {
  const [editando, setEditando]       = useState(false);
  const [precio, setPrecio]           = useState(item.precio);
  const [mostrarImg, setMostrarImg]   = useState(false);
  const sub = subcats.find(s => s.id === item.subcategoriaId);

  const handleImagenSubida = async (url) => {
    // Guardar la nueva URL en la BD vía PUT
    try {
      await fetch(`${API}/api/items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...item, imageUrl: url })
      });
      onImagenActualizada(item.id, url);
      setMostrarImg(false);
    } catch {
      // El uploader ya muestra el error; acá solo cerramos si hubo fallo silencioso
    }
  };

  return (
    <div className={`adm-item-row${item.activo ? '' : ' inactivo'}`} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      {/* ── Fila principal ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div className="adm-item-info">
          <span className="adm-item-nombre">{item.nombre}</span>
          <span className="adm-item-sub">{sub?.nombre || ''}</span>
        </div>
        <div className="adm-item-acciones">
          {editando ? (
            <>
              <input
                className="adm-input-precio"
                type="number"
                value={precio}
                onChange={e => setPrecio(e.target.value)}
                autoFocus
              />
              <button className="adm-btn-sm adm-btn-save" onClick={() => { onPrecio(item, precio); setEditando(false); }}>✓ Guardar</button>
              <button className="adm-btn-sm adm-btn-cancel" onClick={() => { setPrecio(item.precio); setEditando(false); }}>✕</button>
            </>
          ) : (
            <>
              <span className="adm-item-precio">${Math.round(item.precio).toLocaleString('es-AR')}</span>
              <button className="adm-btn-sm adm-btn-edit" onClick={() => { setPrecio(item.precio); setEditando(true); }}>✏ Precio</button>
            </>
          )}
          <button
            className="adm-btn-sm adm-btn-edit"
            style={{ color: '#b794f4', borderColor: 'rgba(183,148,244,0.3)', background: 'rgba(183,148,244,0.1)' }}
            onClick={() => setMostrarImg(v => !v)}
          >
            🖼 Imagen
          </button>
          <button
            className={`adm-btn-sm ${item.activo ? 'adm-btn-toggle-hide' : 'adm-btn-toggle-show'}`}
            onClick={() => onToggle(item.id)}
          >
            {item.activo ? '○ Ocultar' : '● Mostrar'}
          </button>
          <button className="adm-btn-sm adm-btn-del" onClick={() => onEliminar(item.id)}>🗑</button>
        </div>
      </div>

      {/* ── Panel de imagen (se despliega al tocar 🖼 Imagen) ── */}
      {mostrarImg && (
        <ImageUploader
          token={token}
          currentUrl={item.imageUrl}
          onUploaded={handleImagenSubida}
        />
      )}
    </div>
  );
}

// ── Agregar producto ─────────────────────────────────────────
function AgregarProducto({ token, subcats, onGuardado }) {
  const [form, setForm] = useState({
    subcategoriaId: subcats[0]?.id || 1,
    nombre: '', precio: '', descripcion: '',
    imageUrl: '', badge: '', sinTacc: false, orden: 0
  });

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const handleGuardar = async () => {
    if (!form.nombre || !form.precio) { alert('Nombre y precio son obligatorios'); return; }
    try {
      await fetch(`${API}/api/items`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...form,
          precio: parseFloat(form.precio),
          subcategoriaId: parseInt(form.subcategoriaId),
          activo: true,
          esSeparador: false
        })
      });
      onGuardado();
    } catch {
      alert('Error al guardar');
    }
  };

  return (
    <div className="adm-form-wrap">
      <select className="adm-input" value={form.subcategoriaId} onChange={e => setForm({ ...form, subcategoriaId: e.target.value })}>
        {subcats.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
      </select>
      <input className="adm-input" placeholder="Nombre del producto" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
      <input className="adm-input" placeholder="Precio (ej: 15000)" type="number" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} />
      <input className="adm-input" placeholder="Descripción" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
      <input className="adm-input" placeholder="Badge (ej: Nuevo, ✦ Firma)" value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} />
      <label className="adm-check-label">
        <input type="checkbox" checked={form.sinTacc} onChange={e => setForm({ ...form, sinTacc: e.target.checked })} />
        Sin TACC
      </label>

      {/* ── Imagen ── */}
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: '-0.25rem' }}>
        Imagen del producto {form.imageUrl && <span style={{ color: '#6fcf97' }}>✓ lista</span>}
      </p>
      <ImageUploader
        token={token}
        currentUrl={form.imageUrl}
        onUploaded={(url) => setForm({ ...form, imageUrl: url })}
      />

      <button className="adm-btn-primary" onClick={handleGuardar}>Guardar producto</button>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────
function Dashboard({ token, nombre, onLogout }) {
  const [seccion, setSeccion] = useState('items');
  const [items, setItems]     = useState([]);
  const [subcats, setSubcats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [filtro, setFiltro]   = useState('');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resItems, resMenu] = await Promise.all([
        fetch(`${API}/api/items`, { headers }),
        fetch(`${API}/api/menu`)
      ]);
      const dataItems = await resItems.json();
      const dataMenu  = await resMenu.json();
      setItems(dataItems);
      setSubcats(dataMenu.subcategorias);
    } catch {
      setMensaje('❌ Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const toast = (msg, ms = 3500) => {
    setMensaje(msg);
    setTimeout(() => setMensaje(''), ms);
  };

  const handlePrecio = async (item, nuevoPrecio) => {
    try {
      await fetch(`${API}/api/items/${item.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ ...item, precio: parseFloat(nuevoPrecio) })
      });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, precio: parseFloat(nuevoPrecio) } : i));
      toast('✅ Precio actualizado');
    } catch {
      toast('❌ Error al actualizar');
    }
  };

  const handleToggle = async (id) => {
    try {
      const res  = await fetch(`${API}/api/items/${id}/toggle`, { method: 'PATCH', headers });
      const data = await res.json();
      setItems(prev => prev.map(i => i.id === id ? { ...i, activo: data.activo } : i));
    } catch {
      toast('❌ Error al cambiar estado');
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Seguro que querés eliminar este producto?')) return;
    try {
      await fetch(`${API}/api/items/${id}`, { method: 'DELETE', headers });
      setItems(prev => prev.filter(i => i.id !== id));
      toast('✅ Producto eliminado');
    } catch {
      toast('❌ Error al eliminar');
    }
  };

  const handleImagenActualizada = (id, url) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, imageUrl: url } : i));
    toast('✅ Imagen actualizada — recordá publicar los cambios');
  };

  const publicarCambios = async () => {
    toast('⏳ Publicando cambios en la carta...', 8000);
    try {
      const res = await fetch(`${API}/api/deploy`, { method: 'POST', headers });
      const data = await res.json();
      if (res.ok) {
        toast('✅ Carta actualizada — los cambios se ven en 2-3 minutos', 6000);
      } else {
        toast(`❌ Error: ${data.message}`);
      }
    } catch {
      toast('❌ Error de conexión');
    }
  };

  const SECCIONES = {
    items:   { label: 'Productos',        sub: 'Editá precios, activá o desactivá items' },
    agregar: { label: 'Agregar producto', sub: 'Sumá un producto nuevo a la carta' },
  };

  const itemsFiltrados = items.filter(i =>
    !i.esSeparador &&
    i.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="adm-root">
      <div className="adm-dash">

        {/* ── Sidebar ── */}
        <aside className="adm-sidebar">
          <div className="adm-sidebar-header">
            <img src={logo} alt="Bruzz" className="adm-sidebar-logo" />
            <span className="adm-sidebar-brand">Bruzz</span>
          </div>
          <div className="adm-sidebar-user">Hola, {nombre}</div>

          <button className={`adm-nav-btn${seccion === 'items' ? ' active' : ''}`} onClick={() => setSeccion('items')}>
            📋 Productos
          </button>
          <button className={`adm-nav-btn${seccion === 'agregar' ? ' active' : ''}`} onClick={() => setSeccion('agregar')}>
            ➕ Agregar producto
          </button>

          <div className="adm-sidebar-spacer" />

          <button className="adm-btn-publish" onClick={publicarCambios}>
            🚀 Publicar cambios
          </button>
          <button className="adm-btn-logout" onClick={onLogout}>
            Cerrar sesión
          </button>
        </aside>

        {/* ── Contenido ── */}
        <main className="adm-content">
          <div className="adm-content-header">
            <div className="adm-content-wave" />
            <div className="adm-content-header-inner">
              <h1 className="adm-section-title">{SECCIONES[seccion]?.label}</h1>
              <p className="adm-section-sub">{SECCIONES[seccion]?.sub}</p>
            </div>
          </div>

          <div className="adm-content-body">
            {seccion === 'items' && (
              <>
                <div className="adm-search-wrap">
                  <span className="adm-search-icon">🔍</span>
                  <input
                    className="adm-search"
                    placeholder="Buscar producto..."
                    value={filtro}
                    onChange={e => setFiltro(e.target.value)}
                  />
                </div>
                {loading
                  ? <p className="adm-loading">Cargando productos...</p>
                  : itemsFiltrados.length === 0
                    ? <p className="adm-empty">No se encontraron productos.</p>
                    : (
                      <div className="adm-tabla">
                        {itemsFiltrados.map(item => (
                          <ItemRow
                            key={item.id}
                            item={item}
                            subcats={subcats}
                            token={token}
                            onPrecio={handlePrecio}
                            onToggle={handleToggle}
                            onEliminar={handleEliminar}
                            onImagenActualizada={handleImagenActualizada}
                          />
                        ))}
                      </div>
                    )
                }
              </>
            )}

            {seccion === 'agregar' && (
              <AgregarProducto
                token={token}
                subcats={subcats}
                onGuardado={() => {
                  cargarDatos();
                  setSeccion('items');
                  toast('✅ Producto agregado');
                }}
              />
            )}
          </div>
        </main>

        {/* ── Toast ── */}
        {mensaje && <div className="adm-toast">{mensaje}</div>}
      </div>
    </div>
  );
}

// ── Export principal ─────────────────────────────────────────
export default function AdminPanel() {
  injectAdminCSS();

  const [token, setToken]   = useState(() => localStorage.getItem('bruzz_token') || '');
  const [nombre, setNombre] = useState(() => localStorage.getItem('bruzz_nombre') || '');

  const handleLogin  = (t, n) => { setToken(t); setNombre(n); };
  const handleLogout = () => {
    localStorage.removeItem('bruzz_token');
    localStorage.removeItem('bruzz_nombre');
    setToken('');
    setNombre('');
  };

  if (!token) return <LoginPage onLogin={handleLogin} />;
  return <Dashboard token={token} nombre={nombre} onLogout={handleLogout} />;
}
