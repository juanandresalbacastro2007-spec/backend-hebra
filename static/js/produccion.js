// ── CONFIGURACIÓN Y VARIABLES GLOBALES ────────────
const BASE = '/produccion';
const HOY_ISO = new Date().toISOString().slice(0, 10); // fecha de hoy en formato YYYY-MM-DD, piso para los date pickers
let allProductos = [];
let allOrdenes = [];
let allOperariosAvance = [];

// Estado "sucio" de cada modal (para confirmar antes de cerrar si hay cambios)
let modalProductoDirty = false;
let modalOrdenDirty = false;

// ── INIT / EVENT LISTENERS ────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  actualizarFechaHora();
  setInterval(actualizarFechaHora, 60000);

  cargarKPIs();
  cargarProductos();
  cargarOrdenes();
  cargarAvanceOperarios();

  // Fechas de la orden: por defecto (modal recién cargado / "Nueva Orden") no se puede
  // seleccionar nada anterior a hoy.
  const inputInicioInit = document.getElementById('o-fecha-inicio');
  const inputFinInit = document.getElementById('o-fecha-fin');
  if (inputInicioInit) inputInicioInit.min = HOY_ISO;
  if (inputFinInit) inputFinInit.min = HOY_ISO;

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
  // + marcar el modal como "con cambios sin guardar" + validar en vivo al salir del campo (blur)
  document.querySelectorAll('.prod-modal input, .prod-modal select, .prod-modal textarea').forEach(el => {
    const evento = (el.tagName === 'SELECT') ? 'change' : 'input';

    el.addEventListener(evento, () => {
      el.classList.remove('campo-invalido');
      const err = document.getElementById('err-' + el.id);
      if (err) err.classList.remove('show');
      marcarModalSucio(el);
    });

    // Validación en tiempo real al salir del campo (blur), no solo al hacer clic en Guardar
    el.addEventListener('blur', () => validarCampoEnVivo(el));
  });

  // Contador de caracteres en las descripciones (se inyecta solo, sin tocar el HTML)
  agregarContadorCaracteres('prod-descripcion', 250);
  agregarContadorCaracteres('o-descripcion', 250);

  // Cerrar el modal abierto con la tecla Esc
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const modalProductoEl = document.getElementById('modal-producto');
    const modalOrdenEl = document.getElementById('modal-orden');
    if (modalProductoEl && modalProductoEl.classList.contains('open')) cerrarModalProducto();
    else if (modalOrdenEl && modalOrdenEl.classList.contains('open')) cerrarModalOrden();
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
function validarCampo(inputId, esValido) {
  const input = document.getElementById(inputId);
  const err = document.getElementById('err-' + inputId);
  if (!input) return esValido;

  if (!esValido) {
    input.classList.add('campo-invalido');
    if (err) err.classList.add('show');
    if (err) err.setAttribute('aria-live', 'polite');
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

// ── VALIDACIÓN EN VIVO ──
const REGLAS_CAMPOS_OBLIGATORIOS = {
  'prod-nombre':     v => !!v.trim(),
  'prod-categoria':  v => !!v,
  'prod-descripcion': v => !!v.trim(),
  'o-producto':      v => !!v,
  'o-cantidad':      v => parseInt(v) > 0,
  'o-fecha-inicio':  v => !!v,
  'o-fecha-fin':     v => !!v,
  'o-estado':        v => !!v,
};

function validarCampoEnVivo(el) {
  const regla = REGLAS_CAMPOS_OBLIGATORIOS[el.id];
  if (!regla) return;
  validarCampo(el.id, regla(el.value));

  if (el.id === 'o-fecha-inicio') actualizarMinFechaFin();
}

function actualizarMinFechaFin() {
  const inicio = document.getElementById('o-fecha-inicio');
  const fin = document.getElementById('o-fecha-fin');
  if (!inicio || !fin) return;
  const piso = inicio.value && inicio.value > HOY_ISO ? inicio.value : HOY_ISO;
  fin.min = piso;
  if (fin.value && fin.value < piso) fin.value = piso;
}

function ajustarMinFechasOrden(fechaInicioExistente, fechaFinExistente) {
  const inicio = document.getElementById('o-fecha-inicio');
  const fin = document.getElementById('o-fecha-fin');
  if (!inicio || !fin) return;

  inicio.min = HOY_ISO;
  fin.min = (fechaInicioExistente && fechaInicioExistente > HOY_ISO) ? fechaInicioExistente : HOY_ISO;
}

// ── Contador de caracteres ──
function agregarContadorCaracteres(textareaId, limite) {
  const textarea = document.getElementById(textareaId);
  if (!textarea || textarea.dataset.contadorListo) return;
  textarea.dataset.contadorListo = '1';

  const contador = document.createElement('div');
  contador.className = 'campo-contador';
  contador.id = 'contador-' + textareaId;
  textarea.insertAdjacentElement('afterend', contador);

  const actualizar = () => {
    const len = textarea.value.length;
    contador.textContent = `${len} / ${limite}`;
    contador.classList.toggle('campo-contador-limite', len > limite);
  };

  textarea.addEventListener('input', actualizar);
  actualizar();
}

// ── Marcar modal como "con cambios sin guardar" ───
function marcarModalSucio(el) {
  if (el.closest('#modal-producto')) modalProductoDirty = true;
  if (el.closest('#modal-orden')) modalOrdenDirty = true;
}

function confirmarCierre(dirty) {
  if (!dirty) return true;
  return confirm('Tienes cambios sin guardar. ¿Seguro que quieres cerrar?');
}

function setBotonCargando(boton, cargando) {
  if (!boton) return;
  boton.classList.toggle('btn-loading', cargando);
  boton.disabled = cargando;
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
function cerrarModalProducto() {
  if (!confirmarCierre(modalProductoDirty)) return;
  document.getElementById('modal-producto').classList.remove('open');
  document.getElementById('modal-producto').style.display = 'none';
  modalProductoDirty = false;
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
  modalProductoDirty = false;
  enfocarPrimerCampo('prod-nombre');
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

  const okNombre = validarCampo('prod-nombre', !!data.nombre);
  const okCategoria = validarCampo('prod-categoria', !!data.categoria);
  const okDescripcion = validarCampo('prod-descripcion', !!data.descripcion);

  if (!okNombre || !okCategoria || !okDescripcion) {
    showToast('Por favor, completa los campos obligatorios (*)', 'error');
    return;
  }

  const btnGuardar = document.querySelector('#modal-producto .prod-modal-footer .btn-primary, #modal-producto .prod-modal-footer .btn-dark');

  try {
    setBotonCargando(btnGuardar, true);

    const url = id ? `${BASE}/productos/${id}/` : `${BASE}/productos/`;
    const method = id ? 'PUT' : 'POST';

    const r = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!r.ok) throw new Error('Error al guardar el producto');

    showToast(id ? 'Producto actualizado con éxito' : 'Producto creado con éxito', 'success');
    modalProductoDirty = false;
    cerrarModalProducto();
    cargarProductos();
    cargarKPIs();
  } catch (e) {
    showToast(e.message, 'error');
  } finally {
    setBotonCargando(btnGuardar, false);
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
    tb.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:20px">No hay órdenes registradas</td></tr>`;
    return;
  }

  tb.innerHTML = lista.map(o => {
    const clsEst = 'estado-ord-' + (o.estado || 'Pendiente').replace(/\s+/g, '-');
    return `
      <tr>
        <td><strong>${o.idProduccion}</strong></td>
        <td>${o.cliente || '—'}</td>
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
function cerrarModalOrden() {
  if (!confirmarCierre(modalOrdenDirty)) return;
  document.getElementById('modal-orden').classList.remove('open');
  document.getElementById('modal-orden').style.display = 'none';
  modalOrdenDirty = false;

  const inicio = document.getElementById('o-fecha-inicio');
  const fin = document.getElementById('o-fecha-fin');
  if (inicio) inicio.min = HOY_ISO;
  if (fin) fin.min = HOY_ISO;
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
  modalOrdenDirty = false;
  ajustarMinFechasOrden(o.fechaInicio, o.fechaEstimadaFin);
  enfocarPrimerCampo('o-producto');
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

  const okProducto = validarCampo('o-producto', !!data.idProducto);
  const okCantidad = validarCampo('o-cantidad', data.cantidadRequerida > 0);
  const okInicio = validarCampo('o-fecha-inicio', !!data.fechaInicio);
  const okFin = validarCampo('o-fecha-fin', !!data.fechaEstimadaFin);
  const okEstado = validarCampo('o-estado', !!data.estado);

  let okRangoFechas = true;
  if (okInicio && okFin && data.fechaEstimadaFin < data.fechaInicio) {
    okRangoFechas = validarCampo('o-fecha-fin', false);
    const err = document.getElementById('err-o-fecha-fin');
    if (err) err.textContent = 'La fecha de fin no puede ser anterior a la fecha de inicio.';
  }

  let okFechasFuturas = true;
  if (okInicio && data.fechaInicio < HOY_ISO) {
    okFechasFuturas = validarCampo('o-fecha-inicio', false);
    const err = document.getElementById('err-o-fecha-inicio');
    if (err) err.textContent = 'La fecha de inicio no puede ser anterior a hoy.';
  }
  if (okFin && data.fechaEstimadaFin < HOY_ISO) {
    okFechasFuturas = validarCampo('o-fecha-fin', false) && okFechasFuturas;
  }

  if (!okProducto || !okCantidad || !okInicio || !okFin || !okEstado || !okRangoFechas || !okFechasFuturas) {
    showToast('Por favor, completa los campos obligatorios (*)', 'error');
    return;
  }

  const btnGuardar = document.querySelector('#modal-orden .prod-modal-footer .btn-primary, #modal-orden .prod-modal-footer .btn-dark');

  try {
    setBotonCargando(btnGuardar, true);

    const url = id ? `${BASE}/ordenes/${id}/` : `${BASE}/ordenes/`;
    const method = id ? 'PUT' : 'POST';

    const r = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!r.ok) throw new Error('Error al guardar la orden');

    showToast(id ? 'Orden actualizada con éxito' : 'Orden creada con éxito', 'success');
    modalOrdenDirty = false;
    cerrarModalOrden();
    cargarOrdenes();
    cargarKPIs();
  } catch (e) {
    showToast(e.message, 'error');
  } finally {
    setBotonCargando(btnGuardar, false);
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

// Enfoca el primer campo del modal apenas se abre (mejor accesibilidad/velocidad de tecleo)
function enfocarPrimerCampo(inputId) {
  requestAnimationFrame(() => {
    const el = document.getElementById(inputId);
    if (el) el.focus();
  });
}