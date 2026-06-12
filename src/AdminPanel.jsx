import { useState } from 'react';

const API = 'https://bruzz-api.onrender.com';

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
    <div style={styles.loginWrap}>
      <div style={styles.loginBox}>
        <h1 style={styles.loginTitle}>🍕 Bruzz Admin</h1>
        <p style={styles.loginSub}>Panel de administración</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.btnPrimary} type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Fila de item ─────────────────────────────────────────────
function ItemRow({ item, subcats, onPrecio, onToggle, onEliminar }) {
  const [editando, setEditando] = useState(false);
  const [precio, setPrecio]     = useState(item.precio);
  const sub = subcats.find(s => s.id === item.subcategoriaId);

  return (
    <div style={{ ...styles.itemRow, opacity: item.activo ? 1 : 0.5 }}>
      <div style={styles.itemInfo}>
        <span style={styles.itemNombre}>{item.nombre}</span>
        <span style={styles.itemSub}>{sub?.nombre || ''}</span>
      </div>
      <div style={styles.itemAcciones}>
        {editando ? (
          <>
            <input
              style={styles.inputPrecio}
              type="number"
              value={precio}
              onChange={e => setPrecio(e.target.value)}
            />
            <button style={styles.btnGuardar} onClick={() => { onPrecio(item, precio); setEditando(false); }}>✅</button>
            <button style={styles.btnCancelar} onClick={() => { setPrecio(item.precio); setEditando(false); }}>❌</button>
          </>
        ) : (
          <>
            <span style={styles.itemPrecio}>${Math.round(item.precio).toLocaleString('es-AR')}</span>
            <button style={styles.btnEditar} onClick={() => { setPrecio(item.precio); setEditando(true); }}>✏️ Editar precio</button>
          </>
        )}
        <button style={item.activo ? styles.btnOcultar : styles.btnActivar} onClick={() => onToggle(item.id)}>
          {item.activo ? '👁 Ocultar' : '👁 Mostrar'}
        </button>
        <button style={styles.btnEliminar} onClick={() => onEliminar(item.id)}>🗑</button>
      </div>
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
    <div style={styles.formWrap}>
      <h2 style={styles.titulo}>Agregar producto</h2>
      <select style={styles.input} value={form.subcategoriaId} onChange={e => setForm({ ...form, subcategoriaId: e.target.value })}>
        {subcats.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
      </select>
      <input style={styles.input} placeholder="Nombre del producto" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
      <input style={styles.input} placeholder="Precio (ej: 15000)" type="number" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} />
      <input style={styles.input} placeholder="Descripción" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
      <input style={styles.input} placeholder="URL de imagen (opcional)" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
      <input style={styles.input} placeholder="Badge (ej: Nuevo, ✦ Firma)" value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} />
      <label style={styles.checkLabel}>
        <input type="checkbox" checked={form.sinTacc} onChange={e => setForm({ ...form, sinTacc: e.target.checked })} />
        &nbsp; Sin TACC
      </label>
      <button style={styles.btnPrimary} onClick={handleGuardar}>Guardar producto</button>
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
      setMensaje('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useState(() => { cargarDatos(); }, []);

  const handlePrecio = async (item, nuevoPrecio) => {
    try {
      await fetch(`${API}/api/items/${item.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ ...item, precio: parseFloat(nuevoPrecio) })
      });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, precio: parseFloat(nuevoPrecio) } : i));
      setMensaje('✅ Precio actualizado');
      setTimeout(() => setMensaje(''), 3000);
    } catch {
      setMensaje('❌ Error al actualizar');
    }
  };

  const handleToggle = async (id) => {
    try {
      const res  = await fetch(`${API}/api/items/${id}/toggle`, { method: 'PATCH', headers });
      const data = await res.json();
      setItems(prev => prev.map(i => i.id === id ? { ...i, activo: data.activo } : i));
    } catch {
      setMensaje('❌ Error al cambiar estado');
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Seguro que querés eliminar este producto?')) return;
    try {
      await fetch(`${API}/api/items/${id}`, { method: 'DELETE', headers });
      setItems(prev => prev.filter(i => i.id !== id));
      setMensaje('✅ Producto eliminado');
      setTimeout(() => setMensaje(''), 3000);
    } catch {
      setMensaje('❌ Error al eliminar');
    }
  };

  const publicarCambios = async () => {
    setMensaje('⏳ Publicando cambios en la carta...');
    try {
      const res = await fetch(`${API}/api/deploy`, {
        method: 'POST',
        headers
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje('✅ Carta actualizada — los cambios se ven en 2-3 minutos');
      } else {
        setMensaje(`❌ Error: ${data.message}`);
      }
    } catch {
      setMensaje('❌ Error de conexión');
    }
    setTimeout(() => setMensaje(''), 6000);
  };

  const itemsFiltrados = items.filter(i =>
    !i.esSeparador &&
    i.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div style={styles.dashWrap}>
      <div style={styles.sidebar}>
        <h2 style={styles.sideTitle}>🍕 Bruzz</h2>
        <p style={styles.sideNombre}>Hola, {nombre}</p>
        <button style={seccion === 'items' ? styles.navActivo : styles.navBtn} onClick={() => setSeccion('items')}>
          📋 Productos
        </button>
        <button style={seccion === 'agregar' ? styles.navActivo : styles.navBtn} onClick={() => setSeccion('agregar')}>
          ➕ Agregar producto
        </button>
        <div style={{ flex: 1 }} />
        <button style={styles.btnGenerar} onClick={publicarCambios}>
          🚀 Publicar cambios
        </button>
        <button style={styles.btnLogout} onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>

      <div style={styles.contenido}>
        {mensaje && <div style={styles.toast}>{mensaje}</div>}

        {seccion === 'items' && (
          <>
            <h2 style={styles.titulo}>Productos</h2>
            <input
              style={styles.buscador}
              placeholder="🔍 Buscar producto..."
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
            />
            {loading ? <p style={{ color: '#888' }}>Cargando...</p> : (
              <div style={styles.tabla}>
                {itemsFiltrados.map(item => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    subcats={subcats}
                    onPrecio={handlePrecio}
                    onToggle={handleToggle}
                    onEliminar={handleEliminar}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {seccion === 'agregar' && (
          <AgregarProducto
            token={token}
            subcats={subcats}
            onGuardado={() => {
              cargarDatos();
              setSeccion('items');
              setMensaje('✅ Producto agregado');
              setTimeout(() => setMensaje(''), 3000);
            }}
          />
        )}
      </div>
    </div>
  );
}

// ── Estilos ──────────────────────────────────────────────────
const styles = {
  loginWrap:   { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' },
  loginBox:    { background: '#1a1a1a', padding: '2rem', borderRadius: '12px', width: '360px', textAlign: 'center' },
  loginTitle:  { color: '#fff', fontSize: '1.8rem', marginBottom: '0.5rem' },
  loginSub:    { color: '#888', marginBottom: '1.5rem' },
  form:        { display: 'flex', flexDirection: 'column', gap: '1rem' },
  input:       { padding: '0.75rem', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff', fontSize: '1rem', width: '100%' },
  error:       { color: '#ff4444', fontSize: '0.9rem' },
  btnPrimary:  { padding: '0.75rem', borderRadius: '8px', background: '#e8b84b', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem' },
  dashWrap:    { display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#fff' },
  sidebar:     { width: '220px', background: '#111', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'fixed', height: '100vh' },
  sideTitle:   { fontSize: '1.3rem', fontWeight: 'bold', color: '#e8b84b', marginBottom: '0.25rem' },
  sideNombre:  { color: '#888', fontSize: '0.85rem', marginBottom: '1rem' },
  navBtn:      { padding: '0.6rem 1rem', borderRadius: '8px', background: 'transparent', color: '#ccc', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem' },
  navActivo:   { padding: '0.6rem 1rem', borderRadius: '8px', background: '#e8b84b22', color: '#e8b84b', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem', fontWeight: 'bold' },
  btnGenerar:  { padding: '0.6rem 1rem', borderRadius: '8px', background: '#1a3a1a', color: '#4caf50', border: '1px solid #4caf50', cursor: 'pointer', fontSize: '0.9rem', marginTop: '1rem' },
  btnLogout:   { padding: '0.6rem 1rem', borderRadius: '8px', background: 'transparent', color: '#666', border: '1px solid #333', cursor: 'pointer', fontSize: '0.9rem' },
  contenido:   { marginLeft: '220px', padding: '2rem', flex: 1 },
  titulo:      { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#fff' },
  buscador:    { padding: '0.75rem', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff', width: '100%', maxWidth: '400px', marginBottom: '1rem', fontSize: '1rem' },
  tabla:       { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  itemRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a1a', padding: '0.75rem 1rem', borderRadius: '8px', gap: '1rem' },
  itemInfo:    { display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1 },
  itemNombre:  { fontWeight: 'bold', color: '#fff' },
  itemSub:     { fontSize: '0.8rem', color: '#888' },
  itemAcciones:{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' },
  itemPrecio:  { color: '#e8b84b', fontWeight: 'bold', minWidth: '80px', textAlign: 'right' },
  inputPrecio: { width: '100px', padding: '0.4rem', borderRadius: '6px', border: '1px solid #444', background: '#111', color: '#fff' },
  btnEditar:   { padding: '0.4rem 0.8rem', borderRadius: '6px', background: '#1a2a3a', color: '#4a9eff', border: 'none', cursor: 'pointer', fontSize: '0.85rem' },
  btnGuardar:  { padding: '0.4rem 0.6rem', borderRadius: '6px', background: '#1a3a1a', color: '#4caf50', border: 'none', cursor: 'pointer' },
  btnCancelar: { padding: '0.4rem 0.6rem', borderRadius: '6px', background: '#3a1a1a', color: '#ff4444', border: 'none', cursor: 'pointer' },
  btnOcultar:  { padding: '0.4rem 0.8rem', borderRadius: '6px', background: '#2a2a1a', color: '#aaa', border: 'none', cursor: 'pointer', fontSize: '0.85rem' },
  btnActivar:  { padding: '0.4rem 0.8rem', borderRadius: '6px', background: '#1a3a1a', color: '#4caf50', border: 'none', cursor: 'pointer', fontSize: '0.85rem' },
  btnEliminar: { padding: '0.4rem 0.6rem', borderRadius: '6px', background: '#3a1a1a', color: '#ff4444', border: 'none', cursor: 'pointer' },
  toast:       { position: 'fixed', top: '1rem', right: '1rem', background: '#1a1a1a', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #333', zIndex: 1000 },
  formWrap:    { display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' },
  checkLabel:  { color: '#ccc', display: 'flex', alignItems: 'center', gap: '0.5rem' },
};

// ── Export principal ─────────────────────────────────────────
export default function AdminPanel() {
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
