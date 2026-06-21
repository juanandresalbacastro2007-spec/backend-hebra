const BASE = '/produccion';
let allPrendas = [], allOrdenes = [];

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  cargarKPIs();
  cargarPrendas();
  cargarOrdenes();

  document.getElementById('modal-prenda').addEventListener('click', e => {
    if (e.target === e.currentTarget) cerrarModalPrenda();
  });
  document.getElementById('modal-orden').addEventListener('click', e => {
    if (e.target === e.currentTarget) cerrarModalOrden();
  });
});

// ── TABS ──
function switchTab(name, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');
  if (name === 'kanban') renderKanban();
  if (name === 'resumen') renderResumen();
}

// ── KPIs ──
async function cargarKPIs() {
  try {
    const r = await fetch(`${BASE}/kpis/`);
    const d = await r.json();
    document.getElementById('kpi-prendas').textContent    = d.totalPrendas;
    document.getElementById('kpi-unidades').textContent   = d.unidadesHoy;
    document.getElementById('kpi-proceso').textContent    = d.ordenesEnProceso;
    document.getElementById('kpi-pendientes').textContent = d.ordenesPendientes;
    document.getElementById('notif-count').textContent    = d.ordenesPendientes;
  } catch(e) { console.error(e); }
}

// ── PRENDAS ──
async function cargarPrendas() {
  const r = await fetch(`${BASE}/prendas/`);
  allPrendas = await r.json();
  renderPrendas(allPrendas);
  poblarSelectPrendas();
}

function renderPrendas(lista) {
  const tb = document.getElementById('tbody-prendas');
  const iconos = { Camisa:'👔', 'Pantalón':'👖', Uniforme:'🎽', Chaqueta:'🧥', Accesorio:'👜' };
  if (!lista.length) {
    tb.innerHTML = `<tr><td colspan="8"><div class="empty-state">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
      <p>No hay prendas registradas</p></div></td></tr>`;
    return;
  }
  tb.innerHTML = lista.map(p => {
    const estadoClass = 'estado-' + p.estado.replace(' ', '-');
    return `
    <tr>
      <td>
        <div class="prenda-cell">
          <div class="prenda-avatar">${iconos[p.categoria] || '👕'}</div>
          <div class="prenda-name">${p.nombre}</div>
        </div>
      </td>
      <td><code style="background:#f1f5f9;padding:2px 7px;border-radius:5px;font-size:12px">${p.codigo}</code></td>
      <td><span class="badge-cat">${p.categoria}</span></td>
      <td style="color:var(--muted);font-size:13px">${p.tallas}</td>
      <td style="color:var(--muted)">${p.tiempoMinutos} min</td>
      <td style="font-weight:600">${p.stockObjetivo}</td>
      <td><span class="estado-badge ${estadoClass}">${p.estado}</span></td>
      <td>
        <div class="action-btns">
          <button class="action-btn edit" title="Editar" onclick="editarPrenda(${p.idPrenda})">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button class="action-btn del" title="Eliminar" onclick="eliminarPrenda(${p.idPrenda})">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function filtrarPrendas() {
  const q   = document.getElementById('search-prendas').value.toLowerCase();
  const cat = document.getElementById('filter-cat').value;
  renderPrendas(allPrendas.filter(p =>
    (p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q)) &&
    (!cat || p.categoria === cat)
  ));
}

// ── ÓRDENES ──
async function cargarOrdenes() {
  const r = await fetch(`${BASE}/ordenes/`);
  allOrdenes = await r.json();
  renderOrdenes(allOrdenes);
}

function renderOrdenes(lista) {
  const tb = document.getElementById('tbody-ordenes');
  if (!lista.length) {
    tb.innerHTML = `<tr><td colspan="9"><div class="empty-state">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
      <p>No hay órdenes registradas</p></div></td></tr>`;
    return;
  }
  tb.innerHTML = lista.map(o => {
    const pct    = o.cantidad > 0 ? Math.min(100, Math.round((o.producidas / o.cantidad) * 100)) : 0;
    const clsEst = 'estado-ord-' + o.estado.replace(' ', '-');
    const clsPri = 'prioridad-' + o.prioridad;
    return `
    <tr>
      <td><strong>${o.numero}</strong></td>
      <td>${o.prenda}</td>
      <td style="color:var(--muted)">${o.cliente}</td>
      <td style="text-align:center">${o.cantidad}</td>
      <td>
        <div class="progress-wrap">
          <div class="progress-top"><span>${o.producidas}/${o.cantidad}</span><span>${pct}%</span></div>
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        </div>
      </td>
      <td style="color:var(--muted);font-size:12.5px">${o.fechaEntrega}</td>
      <td><span class="estado-badge ${clsPri}">${o.prioridad}</span></td>
      <td><span class="estado-badge ${clsEst}">${o.estado}</span></td>
      <td>
        <div class="action-btns">
          <button class="action-btn edit" title="Editar" onclick="editarOrden(${o.idOrdenProduccion})">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button class="action-btn del" title="Eliminar" onclick="eliminarOrden(${o.idOrdenProduccion})">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
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
    (o.numero.toLowerCase().includes(q) || o.prenda.toLowerCase().includes(q) || o.cliente.toLowerCase().includes(q)) &&
    (!st || o.estado === st)
  ));
}

// ── KANBAN ──
function renderKanban() {
  const cols = ['Pendiente', 'En Proceso', 'Completado', 'Pausado'];
  const ids  = ['k-pendiente', 'k-proceso', 'k-completado', 'k-pausado'];
  cols.forEach((col, i) => {
    const items = allOrdenes.filter(o => o.estado === col);
    document.getElementById(ids[i]).textContent = items.length;
    const el = document.getElementById('k-col-' + col.replace(' ', '-'));
    if (!el) return;
    el.innerHTML = items.length ? items.map(o => `
      <div class="kanban-card">
        <div class="kanban-card-title">${o.numero}</div>
        <div class="kanban-card-sub">${o.prenda} · ${o.cliente}</div>
        <div style="margin-top:8px">
          <div class="progress-bar">
            <div class="progress-fill" style="width:${o.cantidad > 0 ? Math.min(100, Math.round(o.producidas / o.cantidad * 100)) : 0}%"></div>
          </div>
        </div>
      </div>`).join('')
      : '<div style="color:var(--muted);font-size:13px;padding:10px;text-align:center">Sin órdenes</div>';
  });
}

// ── RESUMEN ──
function renderResumen() {
  const cats = {};
  allPrendas.forEach(p => { cats[p.categoria] = (cats[p.categoria] || 0) + 1; });
  document.getElementById('resumen-cat').innerHTML =
    Object.entries(cats).map(([k, v]) => `<div class="resumen-row"><span>${k}</span><strong>${v}</strong></div>`).join('') ||
    '<div class="resumen-row">Sin datos</div>';

  const ests = {};
  allOrdenes.forEach(o => { ests[o.estado] = (ests[o.estado] || 0) + 1; });
  document.getElementById('resumen-ord').innerHTML =
    Object.entries(ests).map(([k, v]) => `<div class="resumen-row"><span>${k}</span><strong>${v}</strong></div>`).join('') ||
    '<div class="resumen-row">Sin datos</div>';

  const proximas = [...allOrdenes]
    .filter(o => o.estado !== 'Completado')
    .sort((a, b) => a.fechaEntrega.localeCompare(b.fechaEntrega))
    .slice(0, 5);
  document.getElementById('resumen-entregas').innerHTML =
    proximas.map(o => `
      <div class="resumen-row">
        <span>${o.numero} — ${o.prenda}</span>
        <span style="color:var(--muted);font-size:12px">${o.fechaEntrega}</span>
      </div>`).join('') ||
    '<div class="resumen-row">Sin próximas entregas</div>';
}

// ── MODAL PRENDA ──
function abrirModalPrenda() {
  document.getElementById('prenda-id').value = '';
  document.getElementById('modal-prenda-title').textContent = '➕ Nueva Prenda';
  ['p-nombre', 'p-codigo', 'p-tallas', 'p-descripcion'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('p-categoria').value = '';
  document.getElementById('p-tiempo').value    = 30;
  document.getElementById('p-stock').value     = 100;
  document.getElementById('p-estado').value    = 'Activo';
  document.getElementById('modal-prenda').classList.add('open');
}

function cerrarModalPrenda() {
  document.getElementById('modal-prenda').classList.remove('open');
}

async function editarPrenda(id) {
  const p = allPrendas.find(x => x.idPrenda === id);
  if (!p) return;
  document.getElementById('prenda-id').value     = p.idPrenda;
  document.getElementById('p-nombre').value      = p.nombre;
  document.getElementById('p-codigo').value      = p.codigo;
  document.getElementById('p-categoria').value   = p.categoria;
  document.getElementById('p-tallas').value      = p.tallas;
  document.getElementById('p-tiempo').value      = p.tiempoMinutos;
  document.getElementById('p-stock').value       = p.stockObjetivo;
  document.getElementById('p-estado').value      = p.estado;
  document.getElementById('p-descripcion').value = p.descripcion || '';
  document.getElementById('modal-prenda-title').textContent = '✏️ Editar Prenda';
  document.getElementById('modal-prenda').classList.add('open');
}

async function guardarPrenda() {
  const id     = document.getElementById('prenda-id').value;
  const nombre = document.getElementById('p-nombre').value.trim();
  const codigo = document.getElementById('p-codigo').value.trim();
  const cat    = document.getElementById('p-categoria').value;
  if (!nombre || !codigo || !cat) { toast('Completa los campos obligatorios', 'error'); return; }

  const body = {
    nombre, codigo, categoria: cat,
    tallas:        document.getElementById('p-tallas').value,
    tiempoMinutos: +document.getElementById('p-tiempo').value,
    stockObjetivo: +document.getElementById('p-stock').value,
    estado:        document.getElementById('p-estado').value,
    descripcion:   document.getElementById('p-descripcion').value,
  };

  const url    = id ? `${BASE}/prendas/${id}/` : `${BASE}/prendas/`;
  const method = id ? 'PUT' : 'POST';
  const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (r.ok) {
    cerrarModalPrenda();
    await cargarPrendas(); cargarKPIs();
    toast(id ? 'Prenda actualizada ✅' : 'Prenda creada ✅', 'success');
  } else { toast('Error al guardar', 'error'); }
}

async function eliminarPrenda(id) {
  if (!confirm('¿Eliminar esta prenda?')) return;
  const r = await fetch(`${BASE}/prendas/${id}/`, { method: 'DELETE' });
  if (r.ok) { await cargarPrendas(); cargarKPIs(); toast('Prenda eliminada', 'success'); }
  else toast('Error al eliminar', 'error');
}

// ── MODAL ORDEN ──
function poblarSelectPrendas() {
  const sel = document.getElementById('o-prenda');
  sel.innerHTML = allPrendas.map(p => `<option value="${p.idPrenda}">${p.nombre}</option>`).join('');
}

function abrirModalOrden() {
  document.getElementById('orden-id').value = '';
  document.getElementById('modal-orden-title').textContent = '🗒 Nueva Orden de Producción';
  document.getElementById('o-cliente').value      = '';
  document.getElementById('o-cantidad').value     = 1;
  document.getElementById('o-producidas').value   = 0;
  document.getElementById('o-operario').value     = '';
  document.getElementById('o-linea').value        = '';
  document.getElementById('o-observaciones').value = '';
  document.getElementById('o-prioridad').value    = 'Normal';
  document.getElementById('o-estado').value       = 'Pendiente';
  document.getElementById('o-fecha').value        = '';
  document.getElementById('modal-orden').classList.add('open');
}

function cerrarModalOrden() {
  document.getElementById('modal-orden').classList.remove('open');
}

async function editarOrden(id) {
  const o = allOrdenes.find(x => x.idOrdenProduccion === id);
  if (!o) return;
  document.getElementById('orden-id').value        = o.idOrdenProduccion;
  document.getElementById('o-prenda').value        = o.idPrenda;
  document.getElementById('o-cliente').value       = o.cliente;
  document.getElementById('o-cantidad').value      = o.cantidad;
  document.getElementById('o-producidas').value    = o.producidas;
  document.getElementById('o-operario').value      = o.operario;
  document.getElementById('o-linea').value         = o.lineaProduccion || '';
  document.getElementById('o-fecha').value         = o.fechaEntrega;
  document.getElementById('o-prioridad').value     = o.prioridad;
  document.getElementById('o-estado').value        = o.estado;
  document.getElementById('o-observaciones').value = o.observaciones || '';
  document.getElementById('modal-orden-title').textContent = '✏️ Editar Orden';
  document.getElementById('modal-orden').classList.add('open');
}

async function guardarOrden() {
  const id       = document.getElementById('orden-id').value;
  const cantidad = +document.getElementById('o-cantidad').value;
  const fecha    = document.getElementById('o-fecha').value;
  if (!cantidad || !fecha) { toast('Completa los campos obligatorios', 'error'); return; }

  const body = {
    idPrenda:        +document.getElementById('o-prenda').value,
    cliente:         document.getElementById('o-cliente').value,
    cantidad,
    producidas:      +document.getElementById('o-producidas').value,
    operario:        document.getElementById('o-operario').value,
    lineaProduccion: document.getElementById('o-linea').value,
    fechaEntrega:    fecha,
    prioridad:       document.getElementById('o-prioridad').value,
    estado:          document.getElementById('o-estado').value,
    observaciones:   document.getElementById('o-observaciones').value,
  };

  const url    = id ? `${BASE}/ordenes/${id}/` : `${BASE}/ordenes/`;
  const method = id ? 'PUT' : 'POST';
  const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (r.ok) {
    cerrarModalOrden();
    await cargarOrdenes(); cargarKPIs();
    toast(id ? 'Orden actualizada ✅' : 'Orden creada ✅', 'success');
  } else { toast('Error al guardar', 'error'); }
}

async function eliminarOrden(id) {
  if (!confirm('¿Eliminar esta orden?')) return;
  const r = await fetch(`${BASE}/ordenes/${id}/`, { method: 'DELETE' });
  if (r.ok) { await cargarOrdenes(); cargarKPIs(); toast('Orden eliminada', 'success'); }
  else toast('Error al eliminar', 'error');
}

// ── EXPORTAR ──
function exportarCSV() {
  const headers = 'Nombre,Codigo,Categoria,Tallas,TiempoMin,StockObjetivo,Estado';
  const rows    = allPrendas.map(p => `${p.nombre},${p.codigo},${p.categoria},${p.tallas},${p.tiempoMinutos},${p.stockObjetivo},${p.estado}`);
  const blob    = new Blob([headers + '\n' + rows.join('\n')], { type: 'text/csv' });
  const a       = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'prendas.csv' });
  a.click();
  toast('CSV exportado ✅', 'success');
}

// ── TOAST ──
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className   = `toast ${type} show`;
  setTimeout(() => el.classList.remove('show'), 3000);
}