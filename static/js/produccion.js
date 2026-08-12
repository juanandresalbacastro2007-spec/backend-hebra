// ── CONFIGURACIÓN Y VARIABLES GLOBALES ────────────
const BASE = '/produccion';
let allProductos = [];
let allOrdenes = [];

// ── INIT / EVENT LISTENERS ────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  actualizarFechaHora();
  setInterval(actualizarFechaHora, 60000);

  cargarKPIs();
  cargarProductos();
  cargarOrdenes();

  // Cerrar modales haciendo click fuera de la caja
  document.getElementById('modal-producto').addEventListener('click', e => {
    if (e.target === e.currentTarget) cerrarModalProducto();
  });
  document.getElementById('modal-orden').addEventListener('click', e => {
    if (e.target === e.currentTarget) cerrarModalOrden();
  });
});

// ── NAVEGACIÓN (TABS) ─────────────────────────────
function switchTab(name, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  
  el.classList.add('active');
  const tabContent = document.getElementById('tab-' + name);
  if (tabContent) {
    tabContent.classList.add('active');
  }
}

// ── FECHA Y HORA EN VIVO ──────────────────────────
function actualizarFechaHora() {
  const ahora = new Date();
  const dias  = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const horas   = ahora.getHours().toString().padStart(2, '0');
  const minutos = ahora.getMinutes().toString().padStart(2, '0');
  
  const elDateTime = document.getElementById('live-datetime');
  if (elDateTime) {
    elDateTime.textContent = `${dias[ahora.getDay()]} ${ahora.getDate()} ${meses[ahora.getMonth()]} — ${horas}:${minutos}`;
  }
}

// ── KPIs ──────────────────────────────────────────
async function cargarKPIs() {
  try {
    const r = await fetch(`${BASE}/kpis/`);
    if (!r.ok) throw new Error('Error en la respuesta de KPIs');
    const d = await r.json();
    
    document.getElementById('kpi-productos').textContent  = d.totalProductos ?? '0';
    document.getElementById('kpi-completadas').textContent = d.ordenesCompletadas ?? '0';
    document.getElementById('kpi-proceso').textContent    = d.ordenesEnProceso ?? '0';
    document.getElementById('kpi-pendientes').textContent = d.ordenesPendientes ?? '0';
  } catch (e) { 
    console.error('Error KPIs:', e); 
  }
}

// ── CATÁLOGO DE PRODUCTOS ─────────────────────────
async function cargarProductos() {
  try {
    const r = await fetch(`${BASE}/productos/`);
    allProductos = await r.json();
    renderProductos(allProductos);
    poblarSelectProductos();
  } catch (e) {
    console.error('Error cargando productos:', e);
  }
}

function renderProductos(lista) {
  const tb = document.getElementById('tbody-productos');
  if (!tb) return;

  const iconos = { Camisa: '👔', 'Pantalón': '👖', Uniforme: '🎽', Chaqueta: '🧥', Accesorio: '👜' };

  if (!lista.length) {
    tb.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">
            <p>No hay productos registrados</p>
          </div>
        </td>
      </tr>`;
    return;
  }

  tb.innerHTML = lista.map(p => `
    <tr>
      <td>
        <div class="prenda-cell">
          <div class="prenda-name">${p.nombre}</div>
        </div>
      </td>
      <td><span class="badge-cat">${p.categoria}</span></td>
      <td style="font-weight:600">$${Number(p.precio).toLocaleString('es-CO')}</td>
      <td style="color:var(--muted);font-size:13px">${p.descripcion || '—'}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn edit" title="Editar" onclick="editarProducto(${p.idProducto})">✏️</button>
          <button class="action-btn del" title="Eliminar" onclick="eliminarProducto(${p.idProducto})">🗑️</button>
        </div>
      </td>
    </tr>`).join('');
}

function filtrarProductos() {
  const q = document.getElementById('search-productos').value.toLowerCase();
  const cat = document.getElementById('filter-cat').value;
  renderProductos(allProductos.filter(p =>
    p.nombre.toLowerCase().includes(q) && (!cat || p.categoria === cat)
  ));
}

function poblarSelectProductos() {
  const select = document.getElementById('o-producto');
  if (!select) return;
  select.innerHTML = '<option value="">Seleccionar producto...</option>' + 
    allProductos.map(p => `<option value="${p.idProducto}">${p.nombre}</option>`).join('');
}

// ── CONTROL DEL MODAL DE PRODUCTOS ────────────────
function abrirModalProducto() {
  document.getElementById('modal-producto-title').textContent = '➕ Nuevo Producto';
  document.getElementById('producto-id').value = '';
  document.getElementById('prod-nombre').value = '';
  document.getElementById('prod-categoria').value = '';
  document.getElementById('prod-precio').value = 0;
  document.getElementById('prod-descripcion').value = '';
  document.getElementById('modal-producto').style.display = 'flex';
}

function cerrarModalProducto() {
  document.getElementById('modal-producto').style.display = 'none';
}

function editarProducto(id) {
  const p = allProductos.find(prod => prod.idProducto === id);
  if (!p) return;
  
  document.getElementById('modal-producto-title').textContent = '✏️ Editar Producto';
  document.getElementById('producto-id').value = p.idProducto;
  document.getElementById('prod-nombre').value = p.nombre;
  document.getElementById('prod-categoria').value = p.categoria;
  document.getElementById('prod-precio').value = p.precio;
  document.getElementById('prod-descripcion').value = p.descripcion;
  document.getElementById('modal-producto').style.display = 'flex';
}

async function guardarProducto() {
  const id = document.getElementById('producto-id').value;
  const data = {
    nombre: document.getElementById('prod-nombre').value,
    categoria: document.getElementById('prod-categoria').value,
    precio: parseFloat(document.getElementById('prod-precio').value) || 0,
    descripcion: document.getElementById('prod-descripcion').value
  };

  if (!data.nombre || !data.categoria) {
    showToast('Por favor, llena los campos obligatorios (*)', 'error');
    return;
  }

  try {
    const url = id ? `${BASE}/productos/${id}/` : `${BASE}/productos/`;
    const method = id ? 'PUT' : 'POST';
    
    const r = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!r.ok) throw new Error('Error al guardar el producto');
    
    showToast(id ? 'Producto actualizado con éxito' : 'Producto creado con éxito', 'success');
    cerrarModalProducto();
    cargarProductos();
    cargarKPIs();
  } catch (e) {
    showToast(e.message, 'error');
  }
}

async function eliminarProducto(id) {
  if (!confirm('¿Estás seguro de eliminar este producto?')) return;
  try {
    const r = await fetch(`${BASE}/productos/${id}/`, { method: 'DELETE' });
    if (!r.ok) throw new Error('Error al eliminar');
    showToast('Producto eliminado', 'success');
    cargarProductos();
    cargarKPIs();
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// ── ÓRDENES DE PRODUCCIÓN ─────────────────────────
async function cargarOrdenes() {
  try {
    const r = await fetch(`${BASE}/ordenes/`);
    const data = await r.json();
    allOrdenes = Array.isArray(data) ? data : (data.ordenes || []);
    renderOrdenes(allOrdenes);
  } catch (e) {
    console.error('Error cargando órdenes:', e);
  }
}

function renderOrdenes(lista) {
  const tb = document.getElementById('tbody-ordenes');
  if (!tb) return;

  if (!lista.length) {
    tb.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:20px">No hay órdenes registradas</td></tr>`;
    return;
  }

  tb.innerHTML = lista.map(o => {
    const clsEst = 'estado-ord-' + (o.estado || 'Pendiente').replace(/\s+/g, '-');
    return `
      <tr>
        <td><strong>${o.idProduccion}</strong></td>
        <td>${o.producto || 'Sin producto'}</td>
        <td>${o.descripcion || '—'}</td>
        <td style="text-align:center">${o.cantidadRequerida}</td>
        <td>${o.fechaInicio}</td>
        <td>${o.fechaEstimadaFin}</td>
        <td><span class="estado-badge ${clsEst}">${o.estado}</span></td>
        <td>
          <div class="action-btns">
            <button class="action-btn edit" onclick="editarOrden(${o.idProduccion})">✏️</button>
            <button class="action-btn del" onclick="eliminarOrden(${o.idProduccion})">🗑️</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function filtrarOrdenes() {
  const q = document.getElementById('search-ordenes').value.toLowerCase();
  const st = document.getElementById('filter-estado-ord').value;
  
  renderOrdenes(allOrdenes.filter(o => {
    const matchQ = (o.descripcion && o.descripcion.toLowerCase().includes(q)) || (o.producto && o.producto.toLowerCase().includes(q));
    const matchSt = !st || o.estado === st;
    return matchQ && matchSt;
  }));
}

// ── CONTROL DEL MODAL DE ÓRDENES ──────────────────
function abrirModalOrden() {
  document.getElementById('modal-orden-title').textContent = '🗒 Nueva Orden de Producción';
  document.getElementById('orden-id').value = '';
  document.getElementById('o-producto').value = '';
  document.getElementById('o-cantidad').value = 1;
  document.getElementById('o-descripcion').value = '';
  document.getElementById('o-fecha-inicio').value = new Date().toISOString().split('T')[0];
  document.getElementById('o-fecha-fin').value = '';
  document.getElementById('o-costo-estimado').value = '';
  document.getElementById('o-estado').value = 'Pendiente';
  document.getElementById('modal-orden').style.display = 'flex';
}

function cerrarModalOrden() {
  document.getElementById('modal-orden').style.display = 'none';
}

function editarOrden(id) {
  const o = allOrdenes.find(ord => ord.idProduccion === id);
  if (!o) return;

  document.getElementById('modal-orden-title').textContent = '✏️ Editar Orden';
  document.getElementById('orden-id').value = o.idProduccion;
  document.getElementById('o-producto').value = o.idProducto;
  document.getElementById('o-cantidad').value = o.cantidadRequerida;
  document.getElementById('o-descripcion').value = o.descripcion;
  document.getElementById('o-fecha-inicio').value = o.fechaInicio;
  document.getElementById('o-fecha-fin').value = o.fechaEstimadaFin;
  document.getElementById('o-costo-estimado').value = o.costoEstimado || '';
  document.getElementById('o-estado').value = o.estado;
  document.getElementById('modal-orden').style.display = 'flex';
}

async function guardarOrden() {
  const id = document.getElementById('orden-id').value;
  const data = {
    idProducto: parseInt(document.getElementById('o-producto').value),
    cantidadRequerida: parseInt(document.getElementById('o-cantidad').value),
    descripcion: document.getElementById('o-descripcion').value,
    fechaInicio: document.getElementById('o-fecha-inicio').value,
    fechaEstimadaFin: document.getElementById('o-fecha-fin').value,
    costoEstimado: document.getElementById('o-costo-estimado').value ? parseFloat(document.getElementById('o-costo-estimado').value) : null,
    estado: document.getElementById('o-estado').value
  };

  if (!data.idProducto || !data.cantidadRequerida || !data.fechaInicio || !data.fechaEstimadaFin) {
    showToast('Por favor, llena los campos obligatorios (*)', 'error');
    return;
  }

  try {
    const url = id ? `${BASE}/ordenes/${id}/` : `${BASE}/ordenes/`;
    const method = id ? 'PUT' : 'POST';

    const r = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!r.ok) throw new Error('Error al guardar la orden');

    showToast(id ? 'Orden actualizada con éxito' : 'Orden creada con éxito', 'success');
    cerrarModalOrden();
    cargarOrdenes();
    cargarKPIs();
  } catch (e) {
    showToast(e.message, 'error');
  }
}

async function eliminarOrden(id) {
  if (!confirm('¿Estás seguro de eliminar esta orden?')) return;
  try {
    const r = await fetch(`${BASE}/ordenes/${id}/`, { method: 'DELETE' });
    if (!r.ok) throw new Error('Error al eliminar');
    showToast('Orden de producción eliminada', 'success');
    cargarOrdenes();
    cargarKPIs();
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// ── UTILERÍAS / TOAST ─────────────────────────────
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `toast show ${type}`;
  setTimeout(() => { t.classList.remove('show'); }, 3000);
}

function exportarCSV() {
  showToast('Función de exportación lista para programar', 'info');
}