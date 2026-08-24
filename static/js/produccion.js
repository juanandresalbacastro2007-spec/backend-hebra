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

  // Margen de unos días a cada lado para que las barras no queden pegadas al borde
  minFecha = new Date(minFecha.getTime() - 3 * 86400000);
  maxFecha = new Date(maxFecha.getTime() + 3 * 86400000);

  const totalMs = maxFecha.getTime() - minFecha.getTime();
  const pctDe = fecha => ((fecha.getTime() - minFecha.getTime()) / totalMs) * 100;

  // ── Encabezado de meses ──
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
  const activeContent = document.querySelector('.tab-content.active');
  const activeTabLabel = document.querySelector('.tab.active');
  const titulo = activeTabLabel ? activeTabLabel.textContent.trim() : 'Producción';

  doc.setFontSize(15);
  doc.text('HebraTech — Módulo de Producción', 14, 16);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(titulo, 14, 23);
  doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, 14, 29);

  let head = [];
  let body = [];
  let archivo = 'produccion';

  if (activeContent && activeContent.id === 'tab-productos') {
    head = [['Nombre', 'Categoría', 'Precio', 'Descripción']];
    body = allProductos.map(p => [
      p.nombre,
      p.categoria,
      `$${Number(p.precio).toLocaleString('es-CO')}`,
      p.descripcion || '—'
    ]);
    archivo = 'productos';
  } else if (activeContent && activeContent.id === 'tab-ordenes') {
    head = [['ID', 'Producto', 'Cantidad', 'Fecha Inicio', 'Fecha Est. Fin', 'Estado']];
    body = allOrdenes.map(o => [
      o.idProduccion,
      o.producto || 'Sin producto',
      o.cantidadRequerida,
      o.fechaInicio,
      o.fechaEstimadaFin,
      o.estado
    ]);
    archivo = 'ordenes_produccion';
  } else if (activeContent && activeContent.id === 'tab-operarios') {
    head = [['Operario', 'Especialidad', 'Avance', 'Pendiente', 'En progreso', 'Completada']];
    body = allOperariosAvance.map(op => {
      const c = op.contadores || {};
      return [
        op.nombre,
        op.especialidad || 'Sin especialidad',
        `${op.avancePct}%`,
        c.pendiente || 0,
        c.enProgreso || 0,
        c.completada || 0
      ];
    });
    archivo = 'avance_operarios';
  }

  if (!body.length) {
    showToast('No hay datos para exportar en esta pestaña', 'info');
    return;
  }

  doc.autoTable({
    startY: 35,
    head: head,
    body: body,
    headStyles: { fillColor: [57, 91, 100] },
    styles: { fontSize: 9, cellPadding: 4 }
  });

  const fecha = new Date().toISOString().split('T')[0];
  doc.save(`${archivo}_${fecha}.pdf`);
  showToast('PDF generado con éxito', 'success');
}