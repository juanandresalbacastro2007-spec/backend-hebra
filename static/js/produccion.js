/* static/js/produccion.js */

document.addEventListener('DOMContentLoaded', () => {
  initProduccionModule();
});

// Variables Globales del Estado
let chartOrdenes = null;
let productosState = [];
let ordenesState = [];

const BASE_API = '/api/produccion'; // Adaptar al prefijo del Backend Django

/**
 * Utilidad CSRF Token para peticiones AJAX en Django
 */
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

/**
 * Inicializador principal del módulo
 */
async function initProduccionModule() {
  try {
    await Promise.all([
      cargarKPIs(),
      cargarAlertas(),
      cargarProductos(),
      cargarOrdenes(),
      cargarOperarios(),
      cargarActividadReciente()
    ]);
  } catch (err) {
    console.error('Error durante la inicialización del módulo:', err);
  } finally {
    ocultarSpinners();
  }
}

/* ── OCULTAR SPINNERS Y LOADERS ── */
function ocultarSpinners() {
  const spinners = document.querySelectorAll('.spinner, .spinner-border, .loader, .loading-spinner, [class*="spinner"]');
  spinners.forEach(s => {
    s.style.display = 'none';
  });
}

/* ── 1. GESTIÓN DE PESTAÑAS (TABS) ── */
function switchTab(tabId, element) {
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

  const target = document.getElementById(`tab-${tabId}`);
  if (target) {
    target.classList.add('active');
  }
  if (element) {
    element.classList.add('active');
  }
}

/* ── 2. KPIS Y CHARTS ── */
async function cargarKPIs() {
  try {
    const response = await fetch(`${BASE_API}/kpis/`);
    let data;

    if (response.ok) {
      data = await response.json();
    } else {
      data = calcularMetricasLocalesData();
    }

    aplicarKPIsUI(data);

  } catch (err) {
    console.warn('Error al cargar KPIs, calculando desde el estado local:', err);
    aplicarKPIsUI(calcularMetricasLocalesData());
  }
}

function calcularMetricasLocalesData() {
  const totalProductos = productosState.length || 8;
  const completadas = ordenesState.filter(o => o.estado === 'Completado').length || 1;
  const enProceso = ordenesState.filter(o => o.estado === 'En Progreso').length || 0;
  const pendientes = ordenesState.filter(o => o.estado === 'Pendiente').length || 0;
  const detenidas = ordenesState.filter(o => o.estado === 'Detenido').length || 0;

  return {
    totalProductos,
    ordenesCompletadas: completadas,
    ordenesEnProceso: enProceso,
    ordenesPendientes: pendientes,
    ordenesDetenidas: detenidas,
    saludScore: 94,
    incidenciasAbiertas: 2,
    stockStatus: 'Normal'
  };
}

function aplicarKPIsUI(data) {
  const kpiProd = document.getElementById('kpi-productos');
  const kpiComp = document.getElementById('kpi-completadas');
  const kpiProc = document.getElementById('kpi-proceso');

  if (kpiProd) kpiProd.textContent = data.totalProductos ?? 0;
  if (kpiComp) kpiComp.textContent = data.ordenesCompletadas ?? 0;
  if (kpiProc) kpiProc.textContent = data.ordenesEnProceso ?? 0;

  const healthVal = document.getElementById('health-score-val');
  const healthBar = document.getElementById('health-bar-fill');
  if (healthVal && healthBar) {
    healthVal.textContent = `${data.saludScore}%`;
    healthBar.style.width = `${data.saludScore}%`;
  }

  const stockElem = document.getElementById('val-stock-health');
  if (stockElem) stockElem.textContent = data.stockStatus;

  const incElem = document.getElementById('val-incidencias-health');
  if (incElem) incElem.textContent = `${data.incidenciasAbiertas} abiertas`;

  renderChartOrdenes(
    data.ordenesCompletadas || 0,
    data.ordenesEnProceso || 0,
    data.ordenesPendientes || 0,
    data.ordenesDetenidas || 0
  );
}

function renderChartOrdenes(completadas, enProceso, pendientes, detenidas = 0) {
  const ctx = document.getElementById('chartOrdenesEstado');
  if (!ctx) return;

  const dataValues = [completadas, enProceso, pendientes, detenidas];
  const labels = ['Completadas', 'En Confección', 'Pendientes', 'Detenidas'];
  const colors = ['#198754', '#395B64', '#FFC107', '#DC2626'];

  if (chartOrdenes) {
    chartOrdenes.destroy();
  }

  chartOrdenes = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: dataValues,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => ` ${context.label}: ${context.raw}`
          }
        }
      },
      cutout: '72%'
    }
  });

  const legendCont = document.getElementById('chart-legend');
  if (legendCont) {
    const total = dataValues.reduce((a, b) => a + b, 0) || 1;
    legendCont.innerHTML = labels.map((lbl, i) => {
      const pct = Math.round((dataValues[i] / total) * 100);
      return `
        <div class="legend-row">
          <span class="legend-dot-item">
            <span class="legend-color-dot" style="background:${colors[i]}"></span>
            ${lbl}
          </span>
          <strong>${dataValues[i]} <span style="font-weight:400;color:#64748B;">(${pct}%)</span></strong>
        </div>`;
    }).join('');
  }
}

/* ── 3. CARGA DE ALERTAS Y VISTA GENERAL ── */
async function cargarAlertas() {
  const container = document.getElementById('alertas-banner');
  if (!container) return;

  container.innerHTML = `
    <div class="alert-item warning">
      <span>⚠️ <strong>3 órdenes de producción</strong> próximas a vencer esta semana.</span>
      <a onclick="switchTab('ordenes')">Ver detalle →</a>
    </div>
    <div class="alert-item danger">
      <span>📦 <strong>Inventario crítico:</strong> Hilo industrial azul por debajo del mínimo.</span>
      <a href="/administrador/inventario/">Ver detalle →</a>
    </div>
  `;
}

/* ── 4. ACTIVIDAD RECIENTE DEL SISTEMA ── */
async function cargarActividadReciente() {
  let actividad = [];

  try {
    const res = await fetch(`${BASE_API}/actividad/`);
    if (res.ok) {
      actividad = await res.json();
    } else {
      actividad = [
        { id: 1, titulo: 'Orden #ORD-001 finalizada', descripcion: 'Camisa Polo Industrial - 500 pcs completadas', fecha: 'Hace 10 min', icono: '✅' },
        { id: 2, titulo: 'Alerta de Inventario', descripcion: 'Hilo industrial azul por debajo del stock mínimo', fecha: 'Hace 30 min', icono: '📦' },
        { id: 3, titulo: 'Nueva Orden Creada', descripcion: 'Pantalón Jean Trabajo registrada en el sistema', fecha: 'Hace 1 hora', icono: '📋' },
        { id: 4, titulo: 'Operario Asignado', descripcion: 'Carlos Mendoza asignado a Módulo de Corte', fecha: 'Hace 2 horas', icono: '👤' }
      ];
    }
  } catch (err) {
    actividad = [
      { id: 1, titulo: 'Orden #ORD-001 finalizada', descripcion: 'Camisa Polo Industrial - 500 pcs completadas', fecha: 'Hace 10 min', icono: '✅' },
      { id: 2, titulo: 'Alerta de Inventario', descripcion: 'Hilo industrial azul por debajo del stock mínimo', fecha: 'Hace 30 min', icono: '📦' },
      { id: 3, titulo: 'Nueva Orden Creada', descripcion: 'Pantalón Jean Trabajo registrada en el sistema', fecha: 'Hace 1 hora', icono: '📋' }
    ];
  }

  renderActividadReciente(actividad);
}

function renderActividadReciente(lista) {
  const target = document.getElementById('overview-actividad');
  if (!target) return;

  if (lista.length === 0) {
    target.innerHTML = `<p style="text-align:center;color:#64748B;padding:1rem;">No hay actividad reciente.</p>`;
    return;
  }

  target.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px;padding:8px 0;">
      ${lista.map(item => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="font-size:16px;">${item.icono || '📌'}</span>
            <div>
              <strong style="font-size:13px;color:#1E293B;display:block;">${item.titulo}</strong>
              <span style="font-size:12px;color:#64748B;">${item.descripcion}</span>
            </div>
          </div>
          <span style="font-size:11px;color:#94A3B8;white-space:nowrap;">${item.fecha}</span>
        </div>
      `).join('')}
    </div>
  `;
}

/* ── 5. PRODUCTOS ── */
async function cargarProductos() {
  const tbody = document.getElementById('tbody-productos');

  try {
    const res = await fetch(`${BASE_API}/productos/`);
    if (res.ok) {
      productosState = await res.json();
    } else {
      productosState = [
        { id: 1, nombre: 'Camisa Polo Industrial', categoria: 'Camisa', precio: 45000, descripcion: 'Tela algodón con cuello reforzado' },
        { id: 2, nombre: 'Pantalón Jean Trabajo', categoria: 'Pantalón', precio: 78000, descripcion: 'Mezclilla de alta resistencia' },
        { id: 3, nombre: 'Chaqueta Impermeable', categoria: 'Chaqueta', precio: 120000, descripcion: 'Con forro térmico y parches reflectivos' }
      ];
    }
    renderTablaProductos(productosState);
  } catch (err) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--danger)">Error al cargar productos</td></tr>`;
  }
}

function renderTablaProductos(lista) {
  const tbody = document.getElementById('tbody-productos');
  if (!tbody) return;

  if (lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No hay productos encontrados</td></tr>`;
    return;
  }

  tbody.innerHTML = lista.map(p => `
    <tr>
      <td><strong>${p.nombre}</strong></td>
      <td><span class="badge-status" style="background:#E2E8F0;color:#334155">${p.categoria}</span></td>
      <td>$${Number(p.precio).toLocaleString('es-CO')}</td>
      <td>${p.descripcion || '—'}</td>
      <td>
        <button class="btn btn-sm btn-outline-secondary" onclick="editarProducto(${p.id})">✏️</button>
      </td>
    </tr>
  `).join('');
}

function filtrarProductos() {
  const q = document.getElementById('search-productos')?.value.toLowerCase() || '';
  const cat = document.getElementById('filter-cat')?.value || '';

  const filtrados = productosState.filter(p => {
    const matchQ = p.nombre.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q);
    const matchCat = cat === '' || p.categoria === cat;
    return matchQ && matchCat;
  });

  renderTablaProductos(filtrados);
}

/* ── 6. ÓRDENES DE PRODUCCIÓN ── */
async function cargarOrdenes() {
  const tbody = document.getElementById('tbody-ordenes');

  try {
    const res = await fetch(`${BASE_API}/ordenes/`);
    if (res.ok) {
      ordenesState = await res.json();
    } else {
      ordenesState = [
        { id: 'ORD-001', producto: 'Camisa Polo Industrial', descripcion: 'Lote de 500 unidades para cliente corporativo', cantidad: 500, fecha_inicio: '2026-08-01', fecha_fin: '2026-08-28', estado: 'Completado' },
        { id: 'ORD-002', producto: 'Pantalón Jean Trabajo', descripcion: 'Lote prioritario de reposición', cantidad: 200, fecha_inicio: '2026-08-10', fecha_fin: '2026-08-25', estado: 'Pendiente' },
        { id: 'ORD-003', producto: 'Chaqueta Impermeable', descripcion: 'Dotación completa en confección', cantidad: 150, fecha_inicio: '2026-08-15', fecha_fin: '2026-09-05', estado: 'En Progreso' }
      ];
    }
    renderTablaOrdenes(ordenesState);
    renderGanttOrdenes(ordenesState);
  } catch (err) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--danger)">Error al cargar órdenes</td></tr>`;
  }
}

function renderTablaOrdenes(lista) {
  const tbody = document.getElementById('tbody-ordenes');
  if (!tbody) return;

  if (lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state">No hay órdenes registradas</td></tr>`;
    return;
  }

  tbody.innerHTML = lista.map(o => {
    const statusClass = o.estado.toLowerCase().replace(' ', '-');
    return `
      <tr>
        <td><strong>${o.id}</strong></td>
        <td>${o.producto}</td>
        <td>${o.descripcion}</td>
        <td>${o.cantidad} pcs</td>
        <td>${o.fecha_inicio}</td>
        <td>${o.fecha_fin}</td>
        <td><span class="badge-status ${statusClass}">${o.estado}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-dark" onclick="verDetalleOrden('${o.id}')">✏️</button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderGanttOrdenes(lista) {
  const container = document.getElementById('gantt-ordenes');
  if (!container) return;

  if (lista.length === 0) {
    container.innerHTML = `<p style="text-align:center;color:#64748B;">Sin datos para el calendario.</p>`;
    return;
  }

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px;padding:10px 0;">
      ${lista.map(o => `
        <div style="display:flex;align-items:center;justify-content:space-between;background:#F1F5F9;padding:8px 12px;border-radius:6px;">
          <div>
            <strong>${o.id} - ${o.producto}</strong>
            <div style="font-size:12px;color:#64748B;">${o.fecha_inicio} ➔ ${o.fecha_fin}</div>
          </div>
          <span class="badge-status ${o.estado.toLowerCase().replace(' ', '-')}">${o.estado}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function filtrarOrdenes() {
  const q = document.getElementById('search-ordenes')?.value.toLowerCase() || '';
  const est = document.getElementById('filter-estado-ord')?.value || '';

  const filtradas = ordenesState.filter(o => {
    const matchQ = o.id.toLowerCase().includes(q) || o.producto.toLowerCase().includes(q);
    const matchEst = est === '' || o.estado === est;
    return matchQ && matchEst;
  });

  renderTablaOrdenes(filtradas);
}

/* ── 7. OPERARIOS ── */
async function cargarOperarios() {
  const container = document.getElementById('operarios-grid');
  if (!container) return;

  const mockOperarios = [
    { nombre: 'Carlos Mendoza', rol: 'Corte y Trazo', asignadas: 3, avance: 80 },
    { nombre: 'María Rodríguez', rol: 'Confección Senior', asignadas: 5, avance: 65 },
    { nombre: 'Juan Pablo Gómez', rol: 'Ensamble y Remate', asignadas: 2, avance: 90 },
    { nombre: 'Ana Lucía Torres', rol: 'Control de Calidad', asignadas: 4, avance: 40 }
  ];

  container.innerHTML = mockOperarios.map(op => `
    <div class="operario-card">
      <div class="operario-header">
        <div class="operario-avatar">${op.nombre.charAt(0)}</div>
        <div>
          <h4 class="operario-name">${op.nombre}</h4>
          <p class="operario-role">${op.rol}</p>
        </div>
      </div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:6px;display:flex;justify-content:space-between;">
        <span>Carga de trabajo: ${op.asignadas} tareas</span>
        <strong>${op.avance}%</strong>
      </div>
      <div class="health-progress-bar">
        <div class="health-progress-fill" style="width: ${op.avance}%;"></div>
      </div>
    </div>
  `).join('');
}

/* ── 8. GESTIÓN DE MODALES ── */
function cerrarModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
}

function abrirModalProducto(id = null) {
  const modal = document.getElementById('modal-producto');
  const title = document.getElementById('modal-producto-titulo');
  const form = document.getElementById('form-producto');
  if (!modal || !form) return;

  form.reset();
  document.getElementById('prod-id').value = '';

  if (id) {
    const prod = productosState.find(p => p.id === id);
    if (prod) {
      title.textContent = 'Editar Producto';
      document.getElementById('prod-id').value = prod.id;
      document.getElementById('prod-nombre').value = prod.nombre;
      document.getElementById('prod-categoria').value = prod.categoria;
      document.getElementById('prod-precio').value = prod.precio;
      document.getElementById('prod-descripcion').value = prod.descripcion || '';
    }
  } else {
    title.textContent = 'Nuevo Producto';
  }

  modal.style.display = 'flex';
}

function editarProducto(id) {
  abrirModalProducto(id);
}

async function guardarProducto(e) {
  e.preventDefault();
  const id = document.getElementById('prod-id').value;
  const payload = {
    nombre: document.getElementById('prod-nombre').value,
    categoria: document.getElementById('prod-categoria').value,
    precio: parseFloat(document.getElementById('prod-precio').value),
    descripcion: document.getElementById('prod-descripcion').value
  };

  try {
    const url = id ? `${BASE_API}/productos/${id}/` : `${BASE_API}/productos/`;
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const prodGuardado = await res.json();
      if (id) {
        const idx = productosState.findIndex(p => p.id == id);
        if (idx !== -1) productosState[idx] = prodGuardado;
      } else {
        productosState.push(prodGuardado);
      }
    } else {
      throw new Error('Endpoint no disponible');
    }
  } catch (err) {
    if (id) {
      const idx = productosState.findIndex(p => p.id == id);
      if (idx !== -1) productosState[idx] = { id: Number(id), ...payload };
    } else {
      const newId = productosState.length ? Math.max(...productosState.map(p => p.id)) + 1 : 1;
      productosState.push({ id: newId, ...payload });
    }
  }

  renderTablaProductos(productosState);
  cargarKPIs();
  cerrarModal('modal-producto');
}

function abrirModalOrden(id = null) {
  const modal = document.getElementById('modal-orden');
  const title = document.getElementById('modal-orden-titulo');
  const form = document.getElementById('form-orden');
  const selectProd = document.getElementById('ord-producto');
  const containerEstado = document.getElementById('ord-estado-container');

  if (!modal || !form || !selectProd) return;

  form.reset();
  document.getElementById('ord-id').value = '';

  selectProd.innerHTML = productosState.map(p => `<option value="${p.nombre}">${p.nombre}</option>`).join('');

  if (id) {
    const ord = ordenesState.find(o => o.id === id);
    if (ord) {
      title.textContent = 'Editar Orden de Producción';
      document.getElementById('ord-id').value = ord.id;
      selectProd.value = ord.producto;
      document.getElementById('ord-cantidad').value = ord.cantidad;
      document.getElementById('ord-inicio').value = ord.fecha_inicio;
      document.getElementById('ord-fin').value = ord.fecha_fin;
      document.getElementById('ord-descripcion').value = ord.descripcion || '';
      if (containerEstado) containerEstado.style.display = 'block';
      document.getElementById('ord-estado').value = ord.estado;
    }
  } else {
    title.textContent = 'Nueva Orden de Producción';
    if (containerEstado) containerEstado.style.display = 'none';
  }

  modal.style.display = 'flex';
}

function verDetalleOrden(id) {
  abrirModalOrden(id);
}

async function guardarOrden(e) {
  e.preventDefault();
  const id = document.getElementById('ord-id').value;
  const estadoElem = document.getElementById('ord-estado');

  const payload = {
    producto: document.getElementById('ord-producto').value,
    cantidad: parseInt(document.getElementById('ord-cantidad').value),
    fecha_inicio: document.getElementById('ord-inicio').value,
    fecha_fin: document.getElementById('ord-fin').value,
    descripcion: document.getElementById('ord-descripcion').value,
    estado: id && estadoElem ? estadoElem.value : 'Pendiente'
  };

  try {
    const url = id ? `${BASE_API}/ordenes/${id}/` : `${BASE_API}/ordenes/`;
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const ordGuardada = await res.json();
      if (id) {
        const idx = ordenesState.findIndex(o => o.id == id);
        if (idx !== -1) ordenesState[idx] = ordGuardada;
      } else {
        ordenesState.push(ordGuardada);
      }
    } else {
      throw new Error('Endpoint no disponible');
    }
  } catch (err) {
    if (id) {
      const idx = ordenesState.findIndex(o => o.id == id);
      if (idx !== -1) ordenesState[idx] = { id: id, ...payload };
    } else {
      const newId = `ORD-00${ordenesState.length + 1}`;
      ordenesState.push({ id: newId, ...payload });
    }
  }

  renderTablaOrdenes(ordenesState);
  renderGanttOrdenes(ordenesState);
  cargarKPIs();
  cerrarModal('modal-orden');
}

/* ── 9. EXPORTACIÓN A PDF ── */
function exportarPDF() {
  if (!window.jspdf) {
    alert('La librería jsPDF aún no está cargada.');
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Reporte General de Producción - HebraTech', 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 28);

  const tableData = ordenesState.map(o => [o.id, o.producto, o.cantidad, o.fecha_inicio, o.fecha_fin, o.estado]);

  doc.autoTable({
    startY: 35,
    head: [['ID', 'Producto', 'Cantidad', 'Inicio', 'Est. Fin', 'Estado']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [44, 62, 80] }
  });

  doc.save(`Reporte_Produccion_${new Date().toISOString().slice(0, 10)}.pdf`);
}