// ── CONFIGURACIÓN Y VARIABLES GLOBALES ────────────
const BASE = '/produccion';
let allProductos = [];
let allOrdenes = [];
let allOperariosAvance = [];

// ── INIT / EVENT LISTENERS ────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  actualizarFechaHora();
  setInterval(actualizarFechaHora, 60000);

  cargarKPIs();
  cargarVistaGeneral();
  cargarProductos();
  cargarOrdenes();
  cargarAvanceOperarios();

  // Cerrar modales haciendo click fuera de la caja
  const modalProducto = document.getElementById('modal-producto');
  if (modalProducto) {
    modalProducto.addEventListener('click', e => {
      if (e.target === e.currentTarget) cerrarModalProducto();
    });
  }
  const modalOrden = document.getElementById('modal-orden');
  if (modalOrden) {
    modalOrden.addEventListener('click', e => {
      if (e.target === e.currentTarget) cerrarModalOrden();
    });
  }

  // Quitar el error de un campo apenas el usuario empieza a corregirlo
  document.querySelectorAll('.prod-modal input, .prod-modal select, .prod-modal textarea').forEach(el => {
    const evento = (el.tagName === 'SELECT') ? 'change' : 'input';
    el.addEventListener(evento, () => {
      el.classList.remove('campo-invalido');
      const err = document.getElementById('err-' + el.id);
      if (err) err.classList.remove('show');
    });
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

// ── VALIDACIÓN GENÉRICA DE CAMPOS OBLIGATORIOS ────
// Marca (o desmarca) un input/select/textarea como inválido y muestra/oculta
// su mensaje de error asociado (id="err-<inputId>"), igual al estilo de la imagen de referencia.
function validarCampo(inputId, esValido) {
  const input = document.getElementById(inputId);
  const err = document.getElementById('err-' + inputId);
  if (!input) return esValido;

  if (!esValido) {
    input.classList.add('campo-invalido');
    if (err) err.classList.add('show');
  } else {
    input.classList.remove('campo-invalido');
    if (err) err.classList.remove('show');
  }
  return esValido;
}

function limpiarValidacion(ids) {
  ids.forEach(id => {
    const input = document.getElementById(id);
    const err = document.getElementById('err-' + id);
    if (input) input.classList.remove('campo-invalido');
    if (err) err.classList.remove('show');
  });
}

// ── KPIs ──────────────────────────────────────────
async function cargarKPIs() {
  try {
    const r = await fetch(`${BASE}/kpis/`);
    if (!r.ok) throw new Error('Error en la respuesta de KPIs');
    const d = await r.json();

    const productos    = d.totalProductos ?? 0;
    const completadas   = d.ordenesCompletadas ?? 0;
    const enProceso     = d.ordenesEnProceso ?? 0;
    const pendientes    = d.ordenesPendientes ?? 0;
    const totalOrdenes  = completadas + enProceso + pendientes;

    document.getElementById('kpi-productos').textContent   = productos;
    document.getElementById('kpi-completadas').textContent = completadas;
    document.getElementById('kpi-proceso').textContent     = enProceso;
    document.getElementById('kpi-pendientes').textContent  = pendientes;

    const pct = (n) => totalOrdenes > 0 ? Math.max(Math.round((n / totalOrdenes) * 100), 4) : 0;
    setBarraKPI('kpi-bar-completadas', pct(completadas));
    setBarraKPI('kpi-bar-proceso', pct(enProceso));
    setBarraKPI('kpi-bar-pendientes', pct(pendientes));
  } catch (e) {
    console.error('Error KPIs:', e);
  }
}

function setBarraKPI(id, pct) {
  const el = document.getElementById(id);
  if (el) el.style.width = `${pct}%`;
}

// ── Navegación desde las KPI cards clickeables ────
function irAProductos() {
  const tabEl = document.querySelector('.tab[onclick*="productos"]');
  if (tabEl) switchTab('productos', tabEl);
}

function irAOrdenesFiltradas(estado) {
  const tabEl = document.querySelector('.tab[onclick*="ordenes"]');
  if (tabEl) switchTab('ordenes', tabEl);

  const filtro = document.getElementById('filter-estado-ord');
  if (filtro) {
    filtro.value = estado;
    filtrarOrdenes();
  }

  const card = document.getElementById('tab-ordenes');
  if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── VISTA GENERAL DEL SISTEMA (panorama cross-módulo) ─
const ICONOS_KPI_GENERAL = {
  usuarios:            { icono: '👥', label: 'Usuarios Registrados' },
  usuariosPendientes:  { icono: '🕓', label: 'Usuarios por Aprobar' },
  clientes:            { icono: '🤝', label: 'Clientes' },
  operariosActivos:    { icono: '🧑‍🏭', label: 'Operarios Activos' },
  ordenesTotales:      { icono: '🧾', label: 'Órdenes Totales' },
  ordenesPendientes:   { icono: '📋', label: 'Órdenes Pendientes' },
  ordenesUrgentes:     { icono: '🔥', label: 'Órdenes Urgentes' },
  tareasPendientes:    { icono: '📌', label: 'Tareas Pendientes' },
  tareasEnProgreso:    { icono: '🧵', label: 'Tareas en Progreso' },
  incidenciasAbiertas: { icono: '⚠️', label: 'Incidencias Abiertas' },
  productos:           { icono: '👕', label: 'Productos Catálogo' },
  produccionActiva:    { icono: '⚙️', label: 'Producción Activa' },
  proveedores:         { icono: '🚚', label: 'Proveedores' },
};

async function cargarVistaGeneral() {
  try {
    const r = await fetch(`${BASE}/vista-general/`);
    if (!r.ok) throw new Error('Error al cargar la vista general');
    const data = await r.json();

    renderOverviewKPIs(data.kpis || {});
    renderOverviewAlertas(data.alertas || []);
    renderOverviewActividad(data.actividad || []);
    actualizarQuickNav(data.kpis || {});
  } catch (e) {
    console.error('Error cargando vista general:', e);
    const grid = document.getElementById('overview-kpi-grid');
    if (grid) grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p>No se pudo cargar la vista general del sistema</p></div>`;
  }
}

function renderOverviewKPIs(kpis) {
  const grid = document.getElementById('overview-kpi-grid');
  if (!grid) return;

  const claves = Object.keys(ICONOS_KPI_GENERAL).filter(k => kpis[k] !== null && kpis[k] !== undefined);

  if (!claves.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p>Sin datos disponibles</p></div>`;
    return;
  }

  grid.innerHTML = claves.map(k => {
    const meta = ICONOS_KPI_GENERAL[k];
    return `
      <div class="overview-kpi-card">
        <div class="overview-kpi-top">
          <div class="overview-kpi-icon">${meta.icono}</div>
          <div class="overview-kpi-val">${kpis[k]}</div>
        </div>
        <div class="overview-kpi-lbl">${meta.label}</div>
      </div>`;
  }).join('');
}

function renderOverviewAlertas(alertas) {
  const cont = document.getElementById('alertas-banner');
  if (!cont) return;

  if (!alertas.length) {
    cont.innerHTML = '';
    return;
  }

  cont.innerHTML = alertas.map(a => `
    <div class="alerta-item ${a.tipo}">
      <span class="alerta-icono">${a.icono}</span>
      <span>${a.texto}</span>
    </div>`).join('');
}

function renderOverviewActividad(actividad) {
  const cont = document.getElementById('overview-actividad');
  if (!cont) return;

  if (!actividad.length) {
    cont.innerHTML = `<div class="empty-state"><p>No hay actividad reciente registrada</p></div>`;
    return;
  }

  cont.innerHTML = actividad.map(a => `
    <div class="activity-item">
      <div class="activity-icon">${a.icono || '•'}</div>
      <div class="activity-body">
        <div class="activity-title">${a.titulo || ''}</div>
        <div class="activity-detail">${a.detalle || ''}</div>
        <div class="activity-meta">
          ${a.estado ? `<span class="estado-badge estado-ord-${(a.estado || '').replace(/\s+/g, '-')}">${a.estado}</span>` : ''}
          <span class="activity-fecha">${a.fecha || ''}</span>
        </div>
      </div>
    </div>`).join('');
}

function actualizarQuickNav(kpis) {
  document.querySelectorAll('[data-qn]').forEach(el => {
    const clave = el.getAttribute('data-qn');
    const valor = kpis[clave];
    el.textContent = (valor === null || valor === undefined) ? 'Ver módulo' : `${valor} registro(s)`;
  });
}

// ── PRODUCTOS ──────────────────────────────────────
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
  const valorActual = select.value;
  select.innerHTML = '<option value="">Seleccionar producto...</option>' +
    allProductos.map(p => `<option value="${p.idProducto}">${p.nombre}</option>`).join('');
  if (valorActual) select.value = valorActual;
}

// ── CONTROL DEL MODAL DE PRODUCTOS ────────────────
function abrirModalProducto() {
  limpiarValidacion(['prod-nombre', 'prod-categoria', 'prod-descripcion']);
  document.getElementById('modal-producto-title').textContent = '➕ Nuevo Producto';
  document.getElementById('producto-id').value = '';
  document.getElementById('prod-nombre').value = '';
  document.getElementById('prod-categoria').value = '';
  document.getElementById('prod-precio').value = 0;
  document.getElementById('prod-descripcion').value = '';
  document.getElementById('modal-producto').classList.add('open');
  document.getElementById('modal-producto').style.display = 'flex';
}

function cerrarModalProducto() {
  document.getElementById('modal-producto').classList.remove('open');
  document.getElementById('modal-producto').style.display = 'none';
}

function editarProducto(id) {
  const p = allProductos.find(prod => prod.idProducto === id);
  if (!p) return;

  limpiarValidacion(['prod-nombre', 'prod-categoria', 'prod-descripcion']);
  document.getElementById('modal-producto-title').textContent = '✏️ Editar Producto';
  document.getElementById('producto-id').value = p.idProducto;
  document.getElementById('prod-nombre').value = p.nombre;
  document.getElementById('prod-categoria').value = p.categoria;
  document.getElementById('prod-precio').value = p.precio;
  document.getElementById('prod-descripcion').value = p.descripcion;
  document.getElementById('modal-producto').classList.add('open');
  document.getElementById('modal-producto').style.display = 'flex';
}

async function guardarProducto() {
  limpiarValidacion(['prod-nombre', 'prod-categoria', 'prod-descripcion']);

  const id = document.getElementById('producto-id').value;
  const data = {
    nombre: document.getElementById('prod-nombre').value.trim(),
    categoria: document.getElementById('prod-categoria').value,
    precio: parseFloat(document.getElementById('prod-precio').value) || 0,
    descripcion: document.getElementById('prod-descripcion').value.trim()
  };

  // ── Validación obligatoria por campo (borde rojo + mensaje) ──
  const okNombre = validarCampo('prod-nombre', !!data.nombre);
  const okCategoria = validarCampo('prod-categoria', !!data.categoria);
  const okDescripcion = validarCampo('prod-descripcion', !!data.descripcion);

  if (!okNombre || !okCategoria || !okDescripcion) {
    showToast('Por favor, completa los campos obligatorios (*)', 'error');
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
    renderGanttOrdenes(allOrdenes);
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
          </div>
        </td>
      </tr>`;
  }).join('');
}

function filtrarOrdenes() {
  const q = document.getElementById('search-ordenes').value.toLowerCase();
  const st = document.getElementById('filter-estado-ord').value;

  const filtradas = allOrdenes.filter(o => {
    const matchQ = (o.descripcion && o.descripcion.toLowerCase().includes(q)) || (o.producto && o.producto.toLowerCase().includes(q));
    const matchSt = !st || o.estado === st;
    return matchQ && matchSt;
  });

  renderOrdenes(filtradas);
  renderGanttOrdenes(filtradas);
}

// ── CALENDARIO / LÍNEA DE TIEMPO DE ÓRDENES ───────
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function renderGanttOrdenes(lista) {
  const cont = document.getElementById('gantt-ordenes');
  if (!cont) return;

  const validas = lista.filter(o => o.fechaInicio && o.fechaEstimadaFin);

  if (!validas.length) {
    cont.innerHTML = `<div class="empty-state"><p>No hay órdenes con fechas para mostrar en el calendario</p></div>`;
    return;
  }

  const parseF = s => new Date(s + 'T00:00:00');
  const finReal = o => o.fechaRealFin ? parseF(o.fechaRealFin) : parseF(o.fechaEstimadaFin);

  let minFecha = validas.reduce((min, o) => { const d = parseF(o.fechaInicio); return d < min ? d : min; }, parseF(validas[0].fechaInicio));
  let maxFecha = validas.reduce((max, o) => { const d = finReal(o); return d > max ? d : max; }, finReal(validas[0]));

  minFecha = new Date(minFecha.getTime() - 3 * 86400000);
  maxFecha = new Date(maxFecha.getTime() + 3 * 86400000);

  const totalMs = maxFecha.getTime() - minFecha.getTime();
  const pctDe = fecha => ((fecha.getTime() - minFecha.getTime()) / totalMs) * 100;

  const meses = [];
  let cursor = new Date(minFecha.getFullYear(), minFecha.getMonth(), 1);
  while (cursor <= maxFecha) {
    const inicioMes = cursor < minFecha ? minFecha : cursor;
    const finMesReal = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    meses.push({
      label: `${MESES_CORTOS[cursor.getMonth()]} ${cursor.getFullYear()}`,
      left: pctDe(inicioMes),
    });
    cursor = finMesReal;
  }

  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const hoyDentro = hoy >= minFecha && hoy <= maxFecha;
  const hoyPct = pctDe(hoy);

  const filasHtml = validas.map(o => {
    const inicio = parseF(o.fechaInicio);
    const fin = finReal(o);
    const left = pctDe(inicio);
    const width = Math.max(pctDe(fin) - left, 1.2);
    const clsEst = 'estado-ord-' + (o.estado || 'Pendiente').replace(/\s+/g, '-');
    const rango = `${formatoCorto(inicio)} → ${formatoCorto(fin)}`;

    return `
      <div class="gantt-row">
        <div class="gantt-row-label" title="${o.producto || ''}">#${o.idProduccion} · ${o.producto || 'Sin producto'}</div>
        <div class="gantt-track">
          <div class="gantt-bar ${clsEst}" style="left:${left}%;width:${width}%"
               title="${o.producto || ''} — ${rango} — ${o.estado}">
            ${rango}
          </div>
        </div>
      </div>`;
  }).join('');

  cont.innerHTML = `
    <div class="gantt-inner">
      <div class="gantt-months">
        ${meses.map(m => `<div class="gantt-month-lbl" style="left:${m.left}%">${m.label}</div>`).join('')}
      </div>
      <div class="gantt-rows" style="position:relative">
        ${hoyDentro ? `<div class="gantt-today" style="left:calc(200px + ${(hoyPct / 100).toFixed(4)} * (100% - 200px))"><span class="gantt-today-lbl">Hoy</span></div>` : ''}
        ${filasHtml}
      </div>
    </div>`;
}

function formatoCorto(fecha) {
  const dias = fecha.getDate().toString().padStart(2, '0');
  return `${dias} ${MESES_CORTOS[fecha.getMonth()]}`;
}

// ── CONTROL DEL MODAL DE ÓRDENES ──────────────────
function abrirModalOrden() {
  limpiarValidacion(['o-producto', 'o-cantidad', 'o-fecha-inicio', 'o-fecha-fin', 'o-estado']);
  document.getElementById('modal-orden-title').textContent = '🗒 Nueva Orden de Producción';
  document.getElementById('orden-id').value = '';
  document.getElementById('o-producto').value = '';
  document.getElementById('o-cantidad').value = 1;
  document.getElementById('o-descripcion').value = '';
  document.getElementById('o-fecha-inicio').value = new Date().toISOString().split('T')[0];
  document.getElementById('o-fecha-fin').value = '';
  document.getElementById('o-costo-estimado').value = '';
  document.getElementById('o-estado').value = 'Pendiente';
  document.getElementById('modal-orden').classList.add('open');
  document.getElementById('modal-orden').style.display = 'flex';
}

function cerrarModalOrden() {
  document.getElementById('modal-orden').classList.remove('open');
  document.getElementById('modal-orden').style.display = 'none';
}

function editarOrden(id) {
  const o = allOrdenes.find(ord => ord.idProduccion === id);
  if (!o) return;

  limpiarValidacion(['o-producto', 'o-cantidad', 'o-fecha-inicio', 'o-fecha-fin', 'o-estado']);
  document.getElementById('modal-orden-title').textContent = '✏️ Editar Orden';
  document.getElementById('orden-id').value = o.idProduccion;
  document.getElementById('o-producto').value = o.idProducto;
  document.getElementById('o-cantidad').value = o.cantidadRequerida;
  document.getElementById('o-descripcion').value = o.descripcion;
  document.getElementById('o-fecha-inicio').value = o.fechaInicio;
  document.getElementById('o-fecha-fin').value = o.fechaEstimadaFin;
  document.getElementById('o-costo-estimado').value = o.costoEstimado || '';
  document.getElementById('o-estado').value = o.estado;
  document.getElementById('modal-orden').classList.add('open');
  document.getElementById('modal-orden').style.display = 'flex';
}

async function guardarOrden() {
  limpiarValidacion(['o-producto', 'o-cantidad', 'o-fecha-inicio', 'o-fecha-fin', 'o-estado']);

  const id = document.getElementById('orden-id').value;
  const idProductoVal = document.getElementById('o-producto').value;
  const cantidadVal = parseInt(document.getElementById('o-cantidad').value);
  const fechaInicioVal = document.getElementById('o-fecha-inicio').value;
  const fechaFinVal = document.getElementById('o-fecha-fin').value;
  const estadoVal = document.getElementById('o-estado').value;

  const data = {
    idProducto: idProductoVal ? parseInt(idProductoVal) : null,
    cantidadRequerida: isNaN(cantidadVal) ? 0 : cantidadVal,
    descripcion: document.getElementById('o-descripcion').value.trim(),
    fechaInicio: fechaInicioVal,
    fechaEstimadaFin: fechaFinVal,
    costoEstimado: document.getElementById('o-costo-estimado').value ? parseFloat(document.getElementById('o-costo-estimado').value) : null,
    estado: estadoVal
  };

  // ── Validación obligatoria por campo (borde rojo + mensaje) ──
  const okProducto = validarCampo('o-producto', !!data.idProducto);
  const okCantidad = validarCampo('o-cantidad', data.cantidadRequerida > 0);
  const okInicio = validarCampo('o-fecha-inicio', !!data.fechaInicio);
  const okFin = validarCampo('o-fecha-fin', !!data.fechaEstimadaFin);
  const okEstado = validarCampo('o-estado', !!data.estado);

  // Validación cruzada: la fecha fin no puede ser anterior a la fecha inicio
  let okRangoFechas = true;
  if (okInicio && okFin && data.fechaEstimadaFin < data.fechaInicio) {
    okRangoFechas = validarCampo('o-fecha-fin', false);
    const err = document.getElementById('err-o-fecha-fin');
    if (err) err.textContent = 'La fecha de fin no puede ser anterior a la fecha de inicio.';
  }

  if (!okProducto || !okCantidad || !okInicio || !okFin || !okEstado || !okRangoFechas) {
    showToast('Por favor, completa los campos obligatorios (*)', 'error');
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

// ── AVANCE DE OPERARIOS (proceso de confección) ───
async function cargarAvanceOperarios() {
  const grid = document.getElementById('operarios-grid');
  try {
    const r = await fetch(`${BASE}/operarios-avance/`);
    if (!r.ok) throw new Error('Error al cargar el avance de operarios');
    const data = await r.json();
    allOperariosAvance = data.operarios || [];
    renderOperariosAvance(allOperariosAvance);
  } catch (e) {
    console.error('Error cargando avance de operarios:', e);
    if (grid) {
      grid.innerHTML = `<div class="empty-state"><p>No se pudo cargar el avance de operarios</p></div>`;
    }
  }
}

function renderOperariosAvance(lista) {
  const grid = document.getElementById('operarios-grid');
  if (!grid) return;

  if (!lista.length) {
    grid.innerHTML = `<div class="empty-state"><p>No hay operarios activos con tareas registradas</p></div>`;
    return;
  }

  grid.innerHTML = lista.map(op => {
    const iniciales = (op.nombre || '?')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(n => n[0].toUpperCase())
      .join('');

    const c = op.contadores || {};
    const totalTareas = op.tareas.length;

    const filasTareas = totalTareas
      ? op.tareas.map(t => {
          const clsEst = 'estado-tarea-' + (t.estado || 'Pendiente').replace(/\s+/g, '-');
          const prenda = t.tipoPrenda
            ? `${t.tipoPrenda}${t.cantidadPrendas ? ' × ' + t.cantidadPrendas : ''}`
            : (t.proceso || '—');
          return `
            <div class="tarea-item">
              <div class="tarea-info">
                <div class="tarea-nombre">${t.nombreTarea}</div>
                <div class="tarea-sub">${prenda}</div>
              </div>
              <div class="tarea-badges">
                <span class="estado-badge ${clsEst}">${t.estado}</span>
              </div>
            </div>`;
        }).join('')
      : `<div class="operario-sin-tareas">Sin tareas asignadas</div>`;

    return `
      <div class="operario-card" data-nombre="${(op.nombre || '').toLowerCase()}">
        <div class="operario-card-head">
          <div class="operario-avatar">${iniciales || '—'}</div>
          <div class="operario-info">
            <div class="operario-nombre">${op.nombre}</div>
            <div class="operario-especialidad">${op.especialidad || 'Sin especialidad'}</div>
          </div>
          <div class="operario-avance-pct">${op.avancePct}%</div>
        </div>
        <div class="operario-progress">
          <div class="progress-bar"><div class="progress-fill" style="width:${op.avancePct}%"></div></div>
        </div>
        <div class="operario-contadores">
          <span class="mini-badge pendiente">⏳ ${c.pendiente || 0} pendiente</span>
          <span class="mini-badge en-progreso">🧵 ${c.enProgreso || 0} en progreso</span>
          <span class="mini-badge completada">✅ ${c.completada || 0} completada</span>
          ${c.cancelada ? `<span class="mini-badge cancelada">✕ ${c.cancelada} cancelada</span>` : ''}
        </div>
        <div class="operario-tareas" data-tareas>${filasTareas}</div>
      </div>`;
  }).join('');
}

function filtrarOperarios() {
  const q = (document.getElementById('search-operarios').value || '').toLowerCase();
  const est = document.getElementById('filter-estado-tarea').value;

  const filtrado = allOperariosAvance
    .filter(op => (op.nombre || '').toLowerCase().includes(q))
    .map(op => {
      if (!est) return op;
      return { ...op, tareas: op.tareas.filter(t => t.estado === est) };
    })
    .filter(op => !est || op.tareas.length > 0);

  renderOperariosAvance(filtrado);
}

// ── UTILERÍAS / TOAST ─────────────────────────────
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `toast show ${type}`;
  setTimeout(() => { t.classList.remove('show'); }, 3000);
}

// ── EXPORTAR A PDF ─────────────────────────────────
// Genera un único PDF organizado en secciones:
//   1. Portada con resumen ejecutivo (KPIs generales)
//   2. Catálogo de Productos
//   3. Órdenes de Producción (respetando el filtro/búsqueda activos)
//   4. Avance de Operarios
// Cada página lleva encabezado con marca y pie de página con numeración.

const PDF_COLOR_PRIMARIO = [57, 91, 100];   // var(--primary)
const PDF_COLOR_TEXTO_MUTED = [106, 123, 130]; // var(--muted)

function exportarCSV() {
  exportarPDF();
}

function exportarPDF() {
  if (!window.jspdf) {
    showToast('No se pudo cargar la librería de PDF', 'error');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const fechaGeneracion = new Date().toLocaleString('es-CO');

  // ── Filtros/búsquedas actualmente aplicados en pantalla (para dejarlos registrados) ──
  const filtroOrdenEstado = document.getElementById('filter-estado-ord')?.value || '';
  const filtroOrdenBusqueda = document.getElementById('search-ordenes')?.value || '';
  const filtroProdCategoria = document.getElementById('filter-cat')?.value || '';
  const filtroProdBusqueda = document.getElementById('search-productos')?.value || '';
  const filtroOperarioEstado = document.getElementById('filter-estado-tarea')?.value || '';
  const filtroOperarioBusqueda = document.getElementById('search-operarios')?.value || '';

  const ordenesFiltradas = aplicarFiltroOrdenes(allOrdenes, filtroOrdenBusqueda, filtroOrdenEstado);
  const productosFiltrados = aplicarFiltroProductos(allProductos, filtroProdBusqueda, filtroProdCategoria);

  if (!allProductos.length && !allOrdenes.length && !allOperariosAvance.length) {
    showToast('No hay datos disponibles para exportar', 'info');
    return;
  }

  // ── PORTADA / RESUMEN EJECUTIVO ──
  pdfEncabezadoPagina(doc, 'Reporte General de Producción');

  doc.setFontSize(10);
  doc.setTextColor(...PDF_COLOR_TEXTO_MUTED);
  doc.text(`Generado: ${fechaGeneracion}`, 14, 34);

  const completadas = allOrdenes.filter(o => o.estado === 'Completado').length;
  const enProceso = allOrdenes.filter(o => o.estado === 'En Progreso').length;
  const pendientes = allOrdenes.filter(o => o.estado === 'Pendiente').length;
  const detenidas = allOrdenes.filter(o => o.estado === 'Detenido').length;

  doc.autoTable({
    startY: 42,
    head: [['Indicador', 'Valor']],
    body: [
      ['Tipos de producto registrados', allProductos.length],
      ['Órdenes totales', allOrdenes.length],
      ['Órdenes completadas', completadas],
      ['Órdenes en progreso', enProceso],
      ['Órdenes pendientes', pendientes],
      ['Órdenes detenidas', detenidas],
      ['Operarios con tareas activas', allOperariosAvance.length],
    ],
    headStyles: { fillColor: PDF_COLOR_PRIMARIO },
    styles: { fontSize: 9.5, cellPadding: 4 },
    margin: { top: 28 },
    didDrawPage: () => pdfPiePagina(doc)
  });

  // ── SECCIÓN: PRODUCTOS ──
  doc.addPage();
  pdfEncabezadoPagina(doc, 'Catálogo de Productos');
  pdfLineaFiltros(doc, [
    filtroProdBusqueda ? `Búsqueda: "${filtroProdBusqueda}"` : null,
    filtroProdCategoria ? `Categoría: ${filtroProdCategoria}` : null,
  ]);

  if (productosFiltrados.length) {
    doc.autoTable({
      startY: 38,
      head: [['Nombre', 'Categoría', 'Precio', 'Descripción']],
      body: productosFiltrados.map(p => [
        p.nombre,
        p.categoria,
        `$${Number(p.precio).toLocaleString('es-CO')}`,
        p.descripcion || '—'
      ]),
      headStyles: { fillColor: PDF_COLOR_PRIMARIO },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 'auto' }
      },
      margin: { top: 28 },
      didDrawPage: () => pdfPiePagina(doc)
    });
  } else {
    pdfMensajeSinDatos(doc, 'No hay productos que coincidan con el filtro aplicado.');
  }

  // ── SECCIÓN: ÓRDENES DE PRODUCCIÓN ──
  doc.addPage();
  pdfEncabezadoPagina(doc, 'Órdenes de Producción');
  pdfLineaFiltros(doc, [
    filtroOrdenBusqueda ? `Búsqueda: "${filtroOrdenBusqueda}"` : null,
    filtroOrdenEstado ? `Estado: ${filtroOrdenEstado}` : null,
  ]);

  if (ordenesFiltradas.length) {
    doc.autoTable({
      startY: 38,
      head: [['ID', 'Producto', 'Cantidad', 'Inicio', 'Fin Est.', 'Estado']],
      body: ordenesFiltradas.map(o => [
        o.idProduccion,
        o.producto || 'Sin producto',
        o.cantidadRequerida,
        o.fechaInicio,
        o.fechaEstimadaFin,
        o.estado
      ]),
      headStyles: { fillColor: PDF_COLOR_PRIMARIO },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 14 },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 26 },
        4: { cellWidth: 26 },
        5: { cellWidth: 28 }
      },
      margin: { top: 28 },
      didDrawPage: () => pdfPiePagina(doc)
    });
  } else {
    pdfMensajeSinDatos(doc, 'No hay órdenes que coincidan con el filtro aplicado.');
  }

  // ── SECCIÓN: AVANCE DE OPERARIOS ──
  doc.addPage();
  pdfEncabezadoPagina(doc, 'Avance de Operarios');
  pdfLineaFiltros(doc, [
    filtroOperarioBusqueda ? `Búsqueda: "${filtroOperarioBusqueda}"` : null,
    filtroOperarioEstado ? `Estado de tarea: ${filtroOperarioEstado}` : null,
  ]);

  if (allOperariosAvance.length) {
    doc.autoTable({
      startY: 38,
      head: [['Operario', 'Especialidad', 'Avance', 'Pendiente', 'En progreso', 'Completada']],
      body: allOperariosAvance.map(op => {
        const c = op.contadores || {};
        return [
          op.nombre,
          op.especialidad || 'Sin especialidad',
          `${op.avancePct}%`,
          c.pendiente || 0,
          c.enProgreso || 0,
          c.completada || 0
        ];
      }),
      headStyles: { fillColor: PDF_COLOR_PRIMARIO },
      styles: { fontSize: 9, cellPadding: 4 },
      margin: { top: 28 },
      didDrawPage: () => pdfPiePagina(doc)
    });
  } else {
    pdfMensajeSinDatos(doc, 'No hay operarios con tareas registradas.');
  }

  // ── Repasar todas las páginas para que "Página X de Y" muestre el total correcto ──
  const totalPaginasFinal = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPaginasFinal; i++) {
    doc.setPage(i);
    pdfPiePagina(doc, i, totalPaginasFinal);
  }

  const fechaArchivo = new Date().toISOString().split('T')[0];
  doc.save(`reporte_produccion_${fechaArchivo}.pdf`);
  showToast('PDF generado con éxito', 'success');
}

// ── Helpers de filtrado (reutilizan la misma lógica que filtrarOrdenes/filtrarProductos) ──
function aplicarFiltroOrdenes(lista, texto, estado) {
  const q = (texto || '').toLowerCase();
  return lista.filter(o => {
    const matchQ = !q || (o.descripcion && o.descripcion.toLowerCase().includes(q)) || (o.producto && o.producto.toLowerCase().includes(q));
    const matchEst = !estado || o.estado === estado;
    return matchQ && matchEst;
  });
}

function aplicarFiltroProductos(lista, texto, categoria) {
  const q = (texto || '').toLowerCase();
  return lista.filter(p => (!q || p.nombre.toLowerCase().includes(q)) && (!categoria || p.categoria === categoria));
}

// ── Helpers de maquetación del PDF ──
function pdfEncabezadoPagina(doc, subtitulo) {
  doc.setFontSize(15);
  doc.setTextColor(...PDF_COLOR_PRIMARIO);
  doc.text('HebraTech — Módulo de Producción', 14, 16);
  doc.setDrawColor(...PDF_COLOR_PRIMARIO);
  doc.setLineWidth(0.6);
  doc.line(14, 19, 196, 19);
  doc.setFontSize(12);
  doc.setTextColor(44, 51, 51);
  doc.text(subtitulo, 14, 27);
}

function pdfLineaFiltros(doc, partes) {
  const activos = partes.filter(Boolean);
  doc.setFontSize(9);
  doc.setTextColor(...PDF_COLOR_TEXTO_MUTED);
  doc.text(activos.length ? `Filtros aplicados: ${activos.join('  ·  ')}` : 'Filtros aplicados: ninguno', 14, 33);
}

function pdfMensajeSinDatos(doc, mensaje) {
  doc.setFontSize(10);
  doc.setTextColor(...PDF_COLOR_TEXTO_MUTED);
  doc.text(mensaje, 14, 45);
  pdfPiePagina(doc);
}

function pdfPiePagina(doc, paginaActual, totalPaginas) {
  const alto = doc.internal.pageSize.getHeight();
  const num = paginaActual || doc.internal.getCurrentPageInfo().pageNumber;
  const total = totalPaginas || doc.internal.getNumberOfPages();
  doc.setFontSize(8.5);
  doc.setTextColor(...PDF_COLOR_TEXTO_MUTED);
  doc.text(`Página ${num} de ${total}`, 196, alto - 10, { align: 'right' });
  doc.text('HebraTech · Sistema de Gestión de Producción', 14, alto - 10);
}