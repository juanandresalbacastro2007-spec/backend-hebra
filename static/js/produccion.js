const BASE = '/produccion';
let allProductos = [], allOrdenes = [];

// ── INIT ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  cargarKPIs();
  cargarProductos();
  cargarOrdenes();

  document.getElementById('modal-producto').addEventListener('click', e => {
    if (e.target === e.currentTarget) cerrarModalProducto();
  });
  document.getElementById('modal-orden').addEventListener('click', e => {
    if (e.target === e.currentTarget) cerrarModalOrden();
  });
});

// ── TABS ──────────────────────────────────────────
function switchTab(name, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');
  if (name === 'kanban')  renderKanban();
  if (name === 'resumen') renderResumen();
}

// ── KPIs ──────────────────────────────────────────
async function cargarKPIs() {
  try {
    const r = await fetch(`${BASE}/kpis/`);
    const d = await r.json();
    document.getElementById('kpi-productos').textContent  = d.totalProductos;
    document.getElementById('kpi-completadas').textContent = d.ordenesCompletadas;
    document.getElementById('kpi-proceso').textContent    = d.ordenesEnProceso;
    document.getElementById('kpi-pendientes').textContent = d.ordenesPendientes;
    document.getElementById('notif-count').textContent    = d.ordenesPendientes;
  } catch(e) { console.error('KPIs:', e); }
}

// ── PRODUCTOS ─────────────────────────────────────
async function cargarProductos() {
  const r = await fetch(`${BASE}/productos/`);
  allProductos = await r.json();
  renderProductos(allProductos);
  poblarSelectProductos();
}

function renderProductos(lista) {
  const tb = document.getElementById('tbody-productos');
  const iconos = { Camisa:'👔', 'Pantalón':'👖', Uniforme:'🎽', Chaqueta:'🧥', Accesorio:'👜' };

  if (!lista.length) {
    tb.innerHTML = `<tr><td colspan="5"><div class="empty-state">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
             M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
      </svg>
      <p>No hay productos registrados</p></div></td></tr>`;
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
                   m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button class="action-btn del" title="Eliminar" onclick="eliminarProducto(${p.idProducto})">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7
                   m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>`).join('');
}

function filtrarProductos() {
  const q   = document.getElementById('search-productos').value.toLowerCase();
  const cat = document.getElementById('filter-cat').value;
  renderProductos(allProductos.filter(p =>
    p.nombre.toLowerCase().includes(q) &&
    (!cat || p.categoria === cat)
  ));
}

// ── ÓRDENES DE PRODUCCIÓN ─────────────────────────
async function cargarOrdenes() {
  const r = await fetch(`${BASE}/ordenes/`);
  allOrdenes = await r.json();
  renderOrdenes(allOrdenes);
}

function renderOrdenes(lista) {
  const tb = document.getElementById('tbody-ordenes');

  if (!lista.length) {
    tb.innerHTML = `<tr><td colspan="8"><div class="empty-state">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293
             l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
      <p>No hay órdenes registradas</p></div></td></tr>`;
    return;
  }

  tb.innerHTML = lista.map(o => {
    const clsEst = 'estado-ord-' + o.estado.replace(' ', '-');
    return `
    <tr>
      <td><strong>${o.idProduccion}</strong></td>
      <td>${o.producto}</td>
      <td style="color:var(--muted);font-size:13px">${o.descripcion || '—'}</td>
      <td style="text-align:center;font-weight:600">${o.cantidadRequerida}</td>
      <td style="color:var(--muted);font-size:12.5px">${o.fechaInicio}</td>
      <td style="color:var(--muted);font-size:12.5px">${o.fechaEstimadaFin}</td>
      <td><span class="estado-badge ${clsEst}">${o.estado}</span></td>
      <td>
        <div class="action-btns">
          <button class="action-btn edit" title="Editar" onclick="editarOrden(${o.idProduccion})">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
                   m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button class="action-btn del" title="Eliminar" onclick="eliminarOrden(${o.idProduccion})">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7
                   m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function filtrarOrdenes() {
  const q  = document.getElementById('search-ordenes').value.toLowerCase();
  const st = document.getElementById('filter-estado-ord').value;
  renderOrdenes(allOrdenes.filter(o =>
    (o.producto.toLowerCase().includes(q) || o.descripcion?.toLowerCase().includes(q)) &&
    (!st || o.estado === st)
  ));
}

// ── KANBAN ────────────────────────────────────────
function renderKanban() {
  // estados de la tabla produccion
  const cols = [
    { estado: 'Pendiente',   countId: 'k-pendiente',  colId: 'k-col-Pendiente'   },
    { estado: 'En Progreso', countId: 'k-proceso',    colId: 'k-col-En-Progreso' },
    { estado: 'Completado',  countId: 'k-completado', colId: 'k-col-Completado'  },
    { estado: 'Detenido',    countId: 'k-detenido',   colId: 'k-col-Detenido'    },
  ];

  cols.forEach(({ estado, countId, colId }) => {
    const items = allOrdenes.filter(o => o.estado === estado);
    document.getElementById(countId).textContent = items.length;
    const el = document.getElementById(colId);
    if (!el) return;
    el.innerHTML = items.length
      ? items.map(o => `
          <div class="kanban-card">
            <div class="kanban-card-title">#${o.idProduccion} — ${o.producto}</div>
            <div class="kanban-card-sub">${o.descripcion || ''}</div>
            <div style="margin-top:6px;font-size:12px;color:var(--muted)">
              Cant: ${o.cantidadRequerida} · Fin est: ${o.fechaEstimadaFin}
            </div>
          </div>`).join('')
      : '<div style="color:var(--muted);font-size:13px;padding:10px;text-align:center">Sin órdenes</div>';
  });
}

// ── RESUMEN ───────────────────────────────────────
function renderResumen() {
  // Productos por categoría
  const cats = {};
  allProductos.forEach(p => { cats[p.categoria] = (cats[p.categoria] || 0) + 1; });
  document.getElementById('resumen-cat').innerHTML =
    Object.entries(cats).map(([k, v]) =>
      `<div class="resumen-row"><span>${k}</span><strong>${v}</strong></div>`
    ).join('') || '<div class="resumen-row">Sin datos</div>';

  // Órdenes por estado
  const ests = {};
  allOrdenes.forEach(o => { ests[o.estado] = (ests[o.estado] || 0) + 1; });
  document.getElementById('resumen-ord').innerHTML =
    Object.entries(ests).map(([k, v]) =>
      `<div class="resumen-row"><span>${k}</span><strong>${v}</strong></div>`
    ).join('') || '<div class="resumen-row">Sin datos</div>';

  // Próximas entregas (por fechaEstimadaFin, excluyendo completadas/detenidas)
  const proximas = [...allOrdenes]
    .filter(o => o.estado !== 'Completado' && o.estado !== 'Detenido')
    .sort((a, b) => a.fechaEstimadaFin.localeCompare(b.fechaEstimadaFin))
    .slice(0, 5);
  document.getElementById('resumen-entregas').innerHTML =
    proximas.map(o => `
      <div class="resumen-row">
        <span>#${o.idProduccion} — ${o.producto}</span>
        <span style="color:var(--muted);font-size:12px">${o.fechaEstimadaFin}</span>
      </div>`).join('') ||
    '<div class="resumen-row">Sin próximas entregas</div>';
}

// ── MODAL PRODUCTO ────────────────────────────────
function abrirModalProducto(prod = null) {
  document.getElementById('modal-producto-title').textContent = prod ? '✏️ Editar Producto' : '➕ Nuevo Producto';
  document.getElementById('producto-id').value      = prod?.idProducto  ?? '';
  document.getElementById('prod-nombre').value      = prod?.nombre      ?? '';
  document.getElementById('prod-categoria').value   = prod?.categoria   ?? '';
  document.getElementById('prod-precio').value      = prod?.precio      ?? 0;
  document.getElementById('prod-descripcion').value = prod?.descripcion ?? '';
  document.getElementById('modal-producto').classList.add('open');
}

function cerrarModalProducto() {
  document.getElementById('modal-producto').classList.remove('open');
}

function editarProducto(id) {
  const p = allProductos.find(x => x.idProducto === id);
  if (p) abrirModalProducto(p);
}

async function guardarProducto() {
  const id = document.getElementById('producto-id').value;
  const payload = {
    nombre:      document.getElementById('prod-nombre').value.trim(),
    categoria:   document.getElementById('prod-categoria').value,
    precio:      parseFloat(document.getElementById('prod-precio').value) || 0,
    descripcion: document.getElementById('prod-descripcion').value.trim(),
  };

  if (!payload.nombre || !payload.categoria || !payload.descripcion) {
    toast('Completa los campos obligatorios', 'error'); return;
  }

  const url    = id ? `${BASE}/productos/${id}/` : `${BASE}/productos/`;
  const method = id ? 'PUT' : 'POST';
  const r = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (r.ok) {
    cerrarModalProducto();
    await cargarProductos();
    cargarKPIs();
    toast(id ? 'Producto actualizado ✅' : 'Producto creado ✅');
  } else {
    const err = await r.json().catch(() => ({}));
    toast('Error: ' + (err.error || r.status), 'error');
  }
}

async function eliminarProducto(id) {
  if (!confirm('¿Eliminar este producto?')) return;
  const r = await fetch(`${BASE}/productos/${id}/`, { method: 'DELETE' });
  if (r.ok) { await cargarProductos(); cargarKPIs(); toast('Producto eliminado', 'success'); }
  else toast('Error al eliminar', 'error');
}

// ── MODAL ORDEN ───────────────────────────────────
function poblarSelectProductos() {
  const sel = document.getElementById('o-producto');
  sel.innerHTML = allProductos.map(p =>
    `<option value="${p.idProducto}">${p.nombre}</option>`
  ).join('');
}

function abrirModalOrden(orden = null) {
  document.getElementById('modal-orden-title').textContent = orden ? '✏️ Editar Orden' : '🗒 Nueva Orden de Producción';
  document.getElementById('orden-id').value         = orden?.idProduccion    ?? '';
  document.getElementById('o-producto').value       = orden?.idProducto      ?? '';
  document.getElementById('o-cantidad').value       = orden?.cantidadRequerida ?? 1;
  document.getElementById('o-descripcion').value    = orden?.descripcion     ?? '';
  document.getElementById('o-fecha-inicio').value   = orden?.fechaInicio     ?? '';
  document.getElementById('o-fecha-fin').value      = orden?.fechaEstimadaFin ?? '';
  document.getElementById('o-costo-estimado').value = orden?.costoEstimado   ?? '';
  document.getElementById('o-estado').value         = orden?.estado          ?? 'Pendiente';
  document.getElementById('modal-orden').classList.add('open');
}

function cerrarModalOrden() {
  document.getElementById('modal-orden').classList.remove('open');
}

function editarOrden(id) {
  const o = allOrdenes.find(x => x.idProduccion === id);
  if (o) abrirModalOrden(o);
}

async function guardarOrden() {
  const id = document.getElementById('orden-id').value;
  const payload = {
    idProducto:        parseInt(document.getElementById('o-producto').value),
    cantidadRequerida: parseInt(document.getElementById('o-cantidad').value),
    descripcion:       document.getElementById('o-descripcion').value.trim(),
    fechaInicio:       document.getElementById('o-fecha-inicio').value,
    fechaEstimadaFin:  document.getElementById('o-fecha-fin').value,
    costoEstimado:     parseFloat(document.getElementById('o-costo-estimado').value) || null,
    estado:            document.getElementById('o-estado').value,
  };

  if (!payload.idProducto || !payload.descripcion || !payload.fechaInicio || !payload.fechaEstimadaFin) {
    toast('Completa los campos obligatorios', 'error'); return;
  }

  const url    = id ? `${BASE}/ordenes/${id}/` : `${BASE}/ordenes/`;
  const method = id ? 'PUT' : 'POST';
  const r = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (r.ok) {
    cerrarModalOrden();
    await cargarOrdenes();
    cargarKPIs();
    toast(id ? 'Orden actualizada ✅' : 'Orden creada ✅');
  } else {
    const err = await r.json().catch(() => ({}));
    toast('Error: ' + (err.error || r.status), 'error');
  }
}

async function eliminarOrden(id) {
  if (!confirm('¿Eliminar esta orden de producción?')) return;
  const r = await fetch(`${BASE}/ordenes/${id}/`, { method: 'DELETE' });
  if (r.ok) { await cargarOrdenes(); cargarKPIs(); toast('Orden eliminada', 'success'); }
  else toast('Error al eliminar', 'error');
}

// ── EXPORTAR CSV ──────────────────────────────────
function exportarCSV() {
  const headers = 'ID,Producto,Descripcion,Cantidad,FechaInicio,FechaEstFin,Estado,CostoEstimado';
  const rows    = allOrdenes.map(o =>
    `${o.idProduccion},"${o.producto}","${o.descripcion}",${o.cantidadRequerida},${o.fechaInicio},${o.fechaEstimadaFin},${o.estado},${o.costoEstimado ?? ''}`
  );
  const blob = new Blob([headers + '\n' + rows.join('\n')], { type: 'text/csv' });
  const a    = Object.assign(document.createElement('a'), {
    href:     URL.createObjectURL(blob),
    download: 'produccion.csv',
  });
  a.click();
  toast('CSV exportado ✅');
}

// ── TOAST ─────────────────────────────────────────
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className   = `toast ${type} show`;
  setTimeout(() => el.classList.remove('show'), 3000);
}