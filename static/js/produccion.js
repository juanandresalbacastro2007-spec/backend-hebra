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
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
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
          <div class="prenda-avatar">${iconos[p.categoria] || '👕'}</div>
          <div class="prenda-name">${p.nombre}</div>
        </div>
      </td>
      <td><span class="badge-cat">${p.categoria}</span></td>
      <td style="font-weight:600">$${Number(p.precio).toLocaleString('es-CO')}</td>
      <td style="color:var(--muted);font-size:13px">${p.descripcion || '—'}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn edit" title="Editar" onclick="editarProducto(${p.idProducto})">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button class="action-btn del" title="Eliminar" onclick="eliminarProducto(${p.idProducto})">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
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

// ── ÓRDENES DE PRODUCCIÓN ─────────────────────────
async function cargarOrdenes() {
  try {
    const r = await fetch(`${BASE}/ordenes/`);
    if (!r.ok) throw new Error(`Error en el servidor: ${r.status}`);
    
    const data = await r.json();
    
    // Protección por si Django envía un objeto en lugar de una lista directa
    if (data && !Array.isArray(data)) {
      console.warn("Estructura de datos inesperada desde el backend:", data);
      allOrdenes = data.ordenes || data.data || [];
    } else {
      allOrdenes = data || [];
    }

    renderOrdenes(allOrdenes);
  } catch (e) {
    console.error('Error crítico en cargarOrdenes:', e);
    const tb = document.getElementById('tbody-ordenes');
    if (tb) {
      tb.innerHTML = `<tr><td colspan="8" style="text-align:center; color:red; padding:20px; font-weight:600;">
        ⚠️ Error al cargar datos: ${e.message}. Revisa la consola del navegador (F12).
      </td></tr>`;
    }
  }
}

function renderOrdenes(lista) {
  const tb = document.getElementById('tbody-ordenes');
  if (!tb) return;

  if (!lista || !lista.length) {
    tb.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p>No hay órdenes registradas o el filtro no coincide</p>
          </div>
        </td>
      </tr>`;
    return;
  }

  try {
    tb.innerHTML = lista.map(o => {
      const estadoSeguro = o.estado ? String(o.estado) : 'Pendiente';
      const clsEst = 'estado-ord-' + estadoSeguro.replace(/\s+/g, '-');
      
      return `
        <tr>
          <td><strong>${o.idProduccion ?? '—'}</strong></td>
          <td>${o.producto ?? 'Sin producto'}</td>
          <td style="color:var(--muted);font-size:13px">${o.descripcion || '—'}</td>
          <td style="text-align:center;font-weight:600">${o.cantidadRequerida ?? 0}</td>
          <td style="color:var(--muted);font-size:12.5px">${o.fechaInicio ?? '—'}</td>
          <td style="color:var(--muted);font-size:12.5px">${o.fechaEstimadaFin ?? '—'}</td>
          <td><span class="estado-badge ${clsEst}">${estadoSeguro}</span></td>
          <td>
            <div class="action-btns">
              <button class="action-btn edit" title="Editar" onclick="editarOrden(${o.idProduccion})">
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button class="action-btn del" title="Eliminar" onclick="eliminarOrden(${o.idProduccion})">
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>`;
    }).join('');
  } catch (renderError) {
    console.error("Error al renderizar las filas de órdenes:", renderError);
    tb.innerHTML = `<tr><td colspan="8" style="text-align:center; color:orange; padding:20px;">
      ⚠️ Error de renderizado. Los datos del backend tienen formatos incompatibles.
    </td></tr>`;
  }
}

function filtrarOrdenes() {
  const searchInput = document.getElementById('search-ordenes');
  const filterSelect = document.getElementById('filter-estado-ord');
  
  const q = searchInput ? searchInput.value.toLowerCase() : '';
  const st = filterSelect ? filterSelect.value