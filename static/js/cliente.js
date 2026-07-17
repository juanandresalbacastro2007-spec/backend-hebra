/* ── Reloj en tiempo real ── */
function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('clockDisplay').textContent = `${h}:${m}:${s}`;

    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const diaSemana = dias[now.getDay()];
    const diaMes = now.getDate();
    const mes = meses[now.getMonth()];
    const anio = now.getFullYear();
    document.getElementById('dateDisplay').textContent = `${diaSemana} ${diaMes} ${mes} ${anio}`;
}
updateClock();
setInterval(updateClock, 1000);

/* ── Validación de formulario (Nueva Orden) ── */
(function () {
    'use strict';
    document.querySelectorAll('.needs-validation').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            } else {
                event.preventDefault();
                bootstrap.Modal.getInstance(document.getElementById('newOrderModal')).hide();
            }
            form.classList.add('was-validated');
        }, false);
    });
})();



function submitApproval() {
    const decision = document.querySelector('input[name="approvalDecision"]:checked').value;
    if (decision === 'rechazado') {
        const comment = document.getElementById('rejectComment').value.trim();
        const errorEl = document.getElementById('rejectCommentError');
        if (!comment) {
            errorEl.classList.remove('d-none');
            return;
        }
        errorEl.classList.add('d-none');
    }
    bootstrap.Modal.getInstance(document.getElementById('approvalModal')).hide();
}

/* ── Simulación envío de mensaje ── */
function sendMessage() {
    const input = document.getElementById('chatInput');
    if (!input.value.trim()) return;
    input.value = '';
}

/* ══════════════════════════════════════════
   ORDER TRACKER — datos y renderizado
══════════════════════════════════════════ */
const ETAPAS = [
    { key: 'recibido', label: 'Pedido\nRecibido', icon: 'bi-clipboard-check' },
    { key: 'corte', label: 'Corte', icon: 'bi-scissors' },
    { key: 'confeccion', label: 'Confección', icon: 'bi-threads' },
    { key: 'calidad', label: 'Control\nCalidad', icon: 'bi-patch-check' },
    { key: 'despachado', label: 'Despachado', icon: 'bi-truck' },
    { key: 'entregado', label: 'Entregado', icon: 'bi-house-check' },
];

const PEDIDOS_DATA = [
    {
        id: '#A1023',
        producto: 'Camiseta Polo',
        cantidad: '500 uds.',
        fechaCreacion: '01 Jun 2026',
        total: '$4.800.000',
        estadoActual: 'confeccion',
        fechaEstimada: '18 Jun 2026',
        transportadora: 'Servientrega',
        tracking: 'SRV-2026-1023',
        historial: [
            { estado: 'Pedido recibido', fecha: '01/06/2026 08:00', etapa: 'recibido' },
            { estado: 'Iniciado corte', fecha: '03/06/2026 09:30', etapa: 'corte' },
            { estado: 'Corte completado', fecha: '07/06/2026 17:00', etapa: 'corte' },
            { estado: 'En confección — Línea 3', fecha: '08/06/2026 08:30', etapa: 'confeccion' },
        ]
    },
    {
        id: '#A1030',
        producto: 'Chaqueta Softshell',
        cantidad: '200 uds.',
        fechaCreacion: '28 May 2026',
        total: '$6.200.000',
        estadoActual: 'corte',
        fechaEstimada: '22 Jun 2026',
        transportadora: null,
        tracking: null,
        historial: [
            { estado: 'Pedido recibido', fecha: '28/05/2026 10:15', etapa: 'recibido' },
            { estado: 'Iniciado corte', fecha: '01/06/2026 09:00', etapa: 'corte' },
        ]
    },
    {
        id: '#A1018',
        producto: 'Pantalón Cargo',
        cantidad: '300 uds.',
        fechaCreacion: '15 May 2026',
        total: '$3.900.000',
        estadoActual: 'entregado',
        fechaEstimada: '05 Jun 2026',
        transportadora: 'TCC',
        tracking: 'TCC-789012',
        historial: [
            { estado: 'Pedido recibido', fecha: '15/05/2026 08:00', etapa: 'recibido' },
            { estado: 'Corte completado', fecha: '20/05/2026 16:00', etapa: 'corte' },
            { estado: 'Confección terminada', fecha: '27/05/2026 18:00', etapa: 'confeccion' },
            { estado: 'Control de calidad OK', fecha: '30/05/2026 11:00', etapa: 'calidad' },
            { estado: 'Despachado', fecha: '02/06/2026 09:00', etapa: 'despachado' },
            { estado: 'Entregado al cliente', fecha: '05/06/2026 14:30', etapa: 'entregado' },
        ]
    },
];

const STATUS_COLORS = {
    recibido: { bg: '#e7f6f2', color: '#395B64', label: 'Pedido recibido' },
    corte: { bg: '#fff3cd', color: '#b07800', label: 'En corte' },
    confeccion: { bg: '#cff4fc', color: '#0c6578', label: 'En confección' },
    calidad: { bg: '#e2d9f3', color: '#6a3d9a', label: 'Control de calidad' },
    despachado: { bg: '#ffd8a8', color: '#994500', label: 'Despachado' },
    entregado: { bg: '#d1fae5', color: '#166534', label: 'Entregado ✓' },
};

function getEtapaIdx(key) {
    return ETAPAS.findIndex(e => e.key === key);
}

function calcProgressPct(estadoActual) {
    const idx = getEtapaIdx(estadoActual);
    if (idx < 0) return 0;
    return Math.round(((idx) / (ETAPAS.length - 1)) * 100);
}

function renderPedido(p, expanded) {
    const etapaIdx = getEtapaIdx(p.estadoActual);
    const sc = STATUS_COLORS[p.estadoActual] || STATUS_COLORS['recibido'];
    const pct = calcProgressPct(p.estadoActual);
    // Ancho de la línea de progreso entre nodos
    const linePct = etapaIdx === 0 ? 0 : Math.round((etapaIdx / (ETAPAS.length - 1)) * 100);

    // Stages HTML
    const stagesHtml = ETAPAS.map((etapa, i) => {
        let cls = 'pending';
        if (i < etapaIdx) cls = 'completed';
        if (i === etapaIdx) cls = 'active';
        const dotIcon = cls === 'completed'
            ? '<i class="bi bi-check-lg"></i>'
            : `<i class="${etapa.icon}"></i>`;
        // Tooltip: buscar en historial
        const hEntry = p.historial.find(h => h.etapa === etapa.key);
        const tooltipText = hEntry ? `${hEntry.fecha}<br>${hEntry.estado}` : etapa.label.replace('\n', ' ');
        return `
          <div class="ot-stage ${cls}">
            <div class="ot-stage-dot">${dotIcon}</div>
            <div class="ot-stage-label">${etapa.label.replace('\n', '<br>')}</div>
            <div class="ot-stage-tooltip">${tooltipText}</div>
          </div>`;
    }).join('');

    // Historial rows
    const histHtml = p.historial.slice().reverse().map(h => {
        const hsc = STATUS_COLORS[h.etapa] || STATUS_COLORS['recibido'];
        return `
          <div class="ot-history-row">
            <div class="ot-history-dot" style="background:${hsc.color};"></div>
            <div class="ot-history-date">${h.fecha}</div>
            <div class="ot-history-desc">
              ${h.estado}
              <span class="ot-history-badge ms-2" style="background:${hsc.bg};color:${hsc.color};">${ETAPAS.find(e => e.key === h.etapa)?.label.replace('\n', ' ') || h.etapa}</span>
            </div>
          </div>`;
    }).join('');

    // Delivery
    const deliveryHtml = p.transportadora ? `
        <div class="ot-delivery-item">
          <span class="label">Transportadora</span>
          <strong>${p.transportadora}</strong>
        </div>
        <div class="ot-delivery-item">
          <span class="label">Nº de guía</span>
          <strong>${p.tracking}</strong>
        </div>
        <button class="btn-seguir ms-auto" onclick="alert('Seguimiento de ${p.tracking}')">
          <i class="bi bi-geo-alt me-1"></i>Seguir pedido
        </button>` : `
        <div class="ot-delivery-item">
          <span class="label">Seguimiento</span>
          <strong>Aún no despachado</strong>
        </div>`;

    const bodyDisplay = expanded ? 'block' : 'none';
    return `
        <div class="ot-order-wrap" id="wrap-${p.id.replace('#', '')}">
          <!-- ENCABEZADO -->
          <div class="ot-header" onclick="toggleOrder('${p.id.replace('#', '')}')">
            <div class="ot-order-id">${p.id}</div>
            <div class="ot-meta-item"><span class="label">Producto</span> <strong>${p.producto}</strong></div>
            <div class="ot-meta-item d-none d-md-block">Cant: <strong>${p.cantidad}</strong></div>
            <div class="ot-meta-item d-none d-md-block">Solicitado: <strong>${p.fechaCreacion}</strong></div>
            <div class="ot-meta-item d-none d-lg-block">Entrega est: <strong>${p.fechaEstimada}</strong></div>
            <div class="ot-meta-item d-none d-lg-block">Total: <strong>${p.total}</strong></div>
            <span class="ot-status-badge ms-auto" style="background:${sc.bg};color:${sc.color};">${sc.label}</span>
            <button class="ot-toggle-btn ${expanded ? 'open' : ''}" id="btn-${p.id.replace('#', '')}">
              <i class="bi bi-chevron-down"></i>
            </button>
          </div>
          <!-- CUERPO -->
          <div class="ot-body" id="body-${p.id.replace('#', '')}" style="display:${bodyDisplay};">
            <!-- Barra global -->
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span style="font-family:var(--ff-body);font-size:0.72rem;color:var(--inactive);">Progreso general</span>
              <span style="font-family:var(--ff-display);font-size:0.78rem;color:var(--primary);font-weight:700;">${pct}%</span>
            </div>
            <div class="ot-global-progress mb-3">
              <div class="ot-global-progress-bar" style="width:${pct}%"></div>
            </div>

            <!-- Stages timeline -->
            <div class="ot-stages" id="stages-${p.id.replace('#', '')}">
              <div class="ot-stages-progress-line" style="width:${linePct}%;"></div>
              ${stagesHtml}
            </div>

            <!-- Info de entrega -->
            <div class="ot-delivery-info">
              <div class="ot-delivery-item">
                <span class="label">Fecha estimada</span>
                <strong><i class="bi bi-calendar3 me-1"></i>${p.fechaEstimada}</strong>
              </div>
              ${deliveryHtml}
            </div>

            <!-- Historial -->
            <div class="ot-history-title"><i class="bi bi-clock-history me-1"></i>Historial del pedido</div>
            ${histHtml}
          </div>
        </div>`;
}

function toggleOrder(rawId) {
    const body = document.getElementById('body-' + rawId);
    const btn = document.getElementById('btn-' + rawId);
    const isOpen = body.style.display !== 'none';
    body.style.display = isOpen ? 'none' : 'block';
    btn.classList.toggle('open', !isOpen);
}

function renderAllOrders() {
    const container = document.getElementById('orderTrackerContainer');
    if (!container) return;
    container.innerHTML = PEDIDOS_DATA.map((p, i) => renderPedido(p, i === 0)).join('');
}

renderAllOrders();

/* ══════════════════════════════════════════
   TOAST SYSTEM
══════════════════════════════════════════ */
const NOTIFICACIONES = [
    {
        tipo: 'info',
        icono: 'bi-box-seam',
        titulo: 'Pedido #A1030 actualizado',
        mensaje: 'Chaqueta Softshell avanzó al 40% en etapa de corte.',
        accion: null
    },
    {
        tipo: 'success',
        icono: 'bi-receipt',
        titulo: 'Factura #F-2026 disponible',
        mensaje: 'Tu nueva factura está lista para descargar.',
        accion: null
    }
];

function mostrarToast(notif, delay = 0) {
    setTimeout(() => {
        const id = 'toast-' + Date.now() + Math.random().toString(36).slice(2);
        const duracion = 6000;

        const accionHtml = notif.accion
            ? `<button class="ht-toast-action" onclick="document.getElementById('${id}').remove();bootstrap.Modal.getOrCreateInstance(document.getElementById('${notif.accion.modal}')).show();">${notif.accion.texto} →</button>`
            : '';

        const el = document.createElement('div');
        el.className = 'ht-toast';
        el.id = id;
        el.innerHTML = `
          <div class="ht-toast-icon ${notif.tipo}"><i class="bi ${notif.icono}"></i></div>
          <div class="ht-toast-body">
            <div class="ht-toast-title">${notif.titulo}</div>
            <div class="ht-toast-msg">${notif.mensaje}</div>
            ${accionHtml}
          </div>
          <button class="ht-toast-close" onclick="cerrarToast('${id}')"><i class="bi bi-x"></i></button>
          <div class="ht-toast-progress" id="prog-${id}" style="width:100%;"></div>
        `;

        document.getElementById('toastContainer').appendChild(el);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => { el.classList.add('show'); });
        });

        const prog = document.getElementById('prog-' + id);
        if (prog) {
            prog.style.transition = `width ${duracion}ms linear`;
            setTimeout(() => { prog.style.width = '0%'; }, 50);
        }

        setTimeout(() => cerrarToast(id), duracion);
    }, delay);
}

function cerrarToast(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('show');
    el.classList.add('hide');
    setTimeout(() => el.remove(), 400);
}

window.addEventListener('load', () => {
    NOTIFICACIONES.forEach((n, i) => mostrarToast(n, i * 1200));
});

/* ══════════════════════════════════════════
   FORMULARIO DE CONTACTO
══════════════════════════════════════════ */
function previewContactFile(input) {
    const label = document.getElementById('contactFileLabel');
    label.textContent = input.files.length > 0
        ? Array.from(input.files).map(f => f.name).join(', ')
        : 'Sin archivos';
}

function enviarContacto() {
    const asunto = document.getElementById('contactAsunto').value;
    const pedido = document.getElementById('contactPedido').value;
    const mensaje = document.getElementById('contactMensaje').value.trim();

    if (!asunto || !mensaje) {
        mostrarToast({
            tipo: 'warning', icono: 'bi-exclamation-circle',
            titulo: 'Campos requeridos',
            mensaje: 'Por favor selecciona un asunto y escribe tu mensaje.', accion: null
        });
        return;
    }

    // mailto — reemplazar por fetch('/api/contacto', {...}) al integrar backend
    const pedidoText = pedido ? `\nPedido: ${pedido}` : '';
    const body = encodeURIComponent(`Asunto: ${asunto}${pedidoText}\n\n${mensaje}\n\n— Hector, Falabella`);
    const subject = encodeURIComponent(`[Portal Cliente] ${asunto}${pedido ? ' — ' + pedido : ''}`);
    window.location.href = `mailto:produccion@hebratech.com?subject=${subject}&body=${body}`;

    document.getElementById('contactFormWrap').classList.add('d-none');
    document.getElementById('contactConfirm').classList.remove('d-none');
}

function resetContactForm() {
    document.getElementById('contactAsunto').value = '';
    document.getElementById('contactPedido').value = '';
    document.getElementById('contactMensaje').value = '';
    document.getElementById('contactFileLabel').textContent = 'Sin archivos';
    document.getElementById('contactFormWrap').classList.remove('d-none');
    document.getElementById('contactConfirm').classList.add('d-none');
}

/* ── Upload feedback ── */
function handleUpload(input) {
    if (input.files.length > 0) {
        const names = Array.from(input.files).map(f => f.name).join(', ');
        mostrarToast({
            tipo: 'success', icono: 'bi-cloud-check',
            titulo: 'Archivo subido', mensaje: names, accion: null
        });
    }
}
/* ══════════════════════════════════════════
LÓGICA DINÁMICA — MODAL COTIZACIÓN
══════════════════════════════════════════ */
const quotePrenda = document.getElementById('quotePrenda');
const quoteCantidad = document.getElementById('quoteCantidad');
const quotePrecioUnitario = document.getElementById('quotePrecioUnitario');
const quoteSubtotalDisplay = document.getElementById('quoteSubtotalDisplay');
const formCotizacion = document.getElementById('formCotizacion');

// Formateador de moneda colombiana (COP)
const formatterCOP = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
});

function calcularCotizacion() {
    const precio = parseFloat(quotePrenda.value) || 0;
    const cantidad = parseInt(quoteCantidad.value) || 0;

    if (precio > 0) {
        quotePrecioUnitario.value = precio.toLocaleString('es-CO');
    } else {
        quotePrecioUnitario.value = '';
    }

    const subtotal = precio * cantidad;
    quoteSubtotalDisplay.textContent = formatterCOP.format(subtotal);
}

// Escuchadores para calcular montos en tiempo real
quotePrenda.addEventListener('change', calcularCotizacion);
quoteCantidad.addEventListener('input', calcularCotizacion);

// Manejo del envío del formulario con las validaciones de Bootstrap
formCotizacion.addEventListener('submit', function (event) {
    if (!formCotizacion.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
    } else {
        event.preventDefault();

        // Simulación de guardado exitoso
        bootstrap.Modal.getInstance(document.getElementById('quoteModal')).hide();

        // Disparar toast nativo del sistema HebraTech
        if (typeof mostrarToast === 'function') {
            mostrarToast({
                tipo: 'success',
                icono: 'bi-file-earmark-check',
                titulo: 'Cotización Enviada',
                mensaje: 'La solicitud se ha registrado. Evaluaremos costos basados en tus especificaciones.',
                accion: null
            });
        }

        // Resetear formulario para futuras solicitudes
        formCotizacion.reset();
        formCotizacion.classList.remove('was-validated');
        quoteSubtotalDisplay.textContent = '$0';
    }
    formCotizacion.classList.add('was-validated');
}, false);

/* ══════════════════════════════════════════
   SISTEMA INTERACTIVO DE NOTIFICACIONES
══════════════════════════════════════════ */

// Base de datos simulada de las notificaciones del cliente
let listaNotificaciones = [
    {
        id: 1,
        tipo: 'info',
        icono: 'bi-box-seam',
        titulo: 'Pedido #A1023 listo para calidad',
        mensaje: 'El lote de 500 unidades de Camisetas Polo ha finalizado la etapa de confección de manera exitosa y ha sido trasladado al módulo de Control de Calidad para su respectiva verificación de costuras y empaque.',
        tiempo: 'Hace 2 horas',
        leida: false
    },
    {
        id: 2,
        tipo: 'warning',
        icono: 'bi-receipt',
        titulo: 'Factura #F-2026 pendiente',
        mensaje: 'Te recordamos que la factura número F-2026 correspondiente al pedido de Chaquetas Softshell por un valor de $4.800.000 se encuentra emitida y próxima a vencer el 15 de Junio de 2026.',
        tiempo: 'Ayer',
        leida: false
    },
    {
        id: 3,
        tipo: 'success',
        icono: 'bi-chat-dots',
        titulo: 'Nuevo mensaje del equipo de producción',
        mensaje: 'Hola Hector, revisamos las observaciones del diseño que nos enviaste. Todo quedó aclarado en la ficha técnica y procedemos con el corte del Pantalón Cargo el día de mañana.',
        tiempo: 'Hace 3 días',
        leida: false
    }
];

let filtroActual = 'all';

// Función global para renderizar las notificaciones tanto en el Dropdown como en el Modal Grande
function renderNotificaciones() {
    const dropdownMenu = document.querySelector('.dropdown-menu[aria-labelledby="notifDropdown"]');
    const modalList = document.getElementById('modalNotificationsList');
    const badgeContador = document.querySelector('.notif-count');

    // 1. Calcular cuántas no leídas hay
    const conteoNoLeidas = listaNotificaciones.filter(n => !n.leida).length;
    if (conteoNoLeidas > 0) {
        badgeContador.textContent = conteoNoLeidas;
        badgeContador.style.display = 'inline-block';
    } else {
        badgeContador.style.display = 'none';
    }

    // 2. Renderizar el Dropdown del Navbar (Muestra las últimas 3)
    let dropdownHtml = `<li class="dropdown-header">Notificaciones (${conteoNoLeidas})</li><li><hr class="dropdown-divider"></li>`;

    listaNotificaciones.forEach(n => {
        dropdownHtml += `
      <li class="px-2 py-1 ${n.leida ? '' : 'bg-light'}">
        <button class="dropdown-item btn text-start rounded p-2" onclick="openNotificationMessage(${n.id})" style="white-space: normal;">
          <div class="small fw-600 ${n.leida ? 'text-muted' : 'text-dark'}">
            <i class="bi ${n.icono} me-1 text-${n.tipo}"></i> ${n.titulo}
          </div>
          <div class="text-muted" style="font-size:0.7rem;">${n.tiempo}</div>
        </button>
      </li>`;
    });

    dropdownHtml += `<li><hr class="dropdown-divider"></li><li class="text-center"><button class="btn btn-link btn-sm text-primary text-decoration-none w-100" data-bs-toggle="modal" data-bs-target="#allNotificationsModal">Ver todas</button></li>`;
    if (dropdownMenu) dropdownMenu.innerHTML = dropdownHtml;

    // 3. Renderizar la lista del Modal Grande ("Ver todas") aplicando filtros
    let modalHtml = '';
    const filtradas = listaNotificaciones.filter(n => filtroActual === 'all' || (filtroActual === 'unread' && !n.leida));

    if (filtradas.length === 0) {
        modalHtml = `<div class="text-center p-4 text-muted small">No hay notificaciones para mostrar</div>`;
    } else {
        filtradas.forEach(n => {
            modalHtml += `
        <button type="button" class="list-group-item list-group-item-action p-3 d-flex align-items-start gap-3 ${n.leida ? 'opacity-75' : 'bg-light fw-bold'}" onclick="openNotificationMessage(${n.id}, true)">
          <div class="p-2 rounded bg-${n.tipo} bg-opacity-10 text-${n.tipo}">
            <i class="bi ${n.icono} fs-5"></i>
          </div>
          <div class="w-100">
            <div class="d-flex justify-content-between align-items-center">
              <span class="text-dark mb-1">${n.titulo}</span>
              <small class="text-muted fw-normal" style="font-size:0.75rem;">${n.tiempo}</small>
            </div>
            <p class="text-muted mb-0 small text-truncate" style="max-width: 550px;">${n.mensaje}</p>
          </div>
        </button>`;
        });
    }
    if (modalList) modalList.innerHTML = modalHtml;
}

// Abre el modal detallado del mensaje y lo marca como leído
function openNotificationMessage(id, comingFromAllModal = false) {
    const notif = listaNotificaciones.find(n => n.id === id);
    if (!notif) return;

    // Marcar como leída
    notif.leida = true;

    // Rellenar datos en el modal de detalle
    document.getElementById('notifDetailTitle').textContent = notif.titulo;
    document.getElementById('notifDetailMessage').textContent = notif.mensaje;
    document.getElementById('notifDetailTime').textContent = notif.tiempo;

    const badge = document.getElementById('notifDetailBadge');
    badge.className = `badge bg-${notif.tipo}`;
    badge.textContent = notif.tipo.toUpperCase();

    // Si viene del menú "Ver todas", cerramos ese modal para evitar encimar fondos oscuros (backdrop bug)
    if (comingFromAllModal) {
        const allModalEl = document.getElementById('allNotificationsModal');
        bootstrap.Modal.getInstance(allModalEl).hide();
    }

    // Lanzar el modal detallado
    const detailModal = new bootstrap.Modal(document.getElementById('notifDetailModal'));
    detailModal.show();

    // Actualizar las vistas
    renderNotificaciones();
}

// Filtros del modal grande
function filterNotifications(type) {
    filtroActual = type;
    document.getElementById('btnFilterAll').className = `btn btn-sm ${type === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`;
    document.getElementById('btnFilterUnread').className = `btn btn-sm ${type === 'unread' ? 'btn-primary' : 'btn-outline-secondary'}`;
    renderNotificaciones();
}

// Acción en masa para limpiar alertas
function markAllAsRead() {
    listaNotificaciones.forEach(n => n.leida = true);
    renderNotificaciones();
}

// Inicializar el sistema al cargar la ventana
window.addEventListener('DOMContentLoaded', () => {
    renderNotificaciones();
});

/* ══════════════════════════════════════════
   GESTIÓN DINÁMICA DE SEDES (CONFIGURACIÓN)
   ══════════════════════════════════════════ */

// Datos iniciales idénticos a los de la imagen image_94e973.png
let listaSedes = [
  { id: 1, nombre: 'Sede Principal - Norte', direccion: 'Calle 100 #15-23, Piso 4', ciudad: 'Bogotá, D.C.' },
  { id: 2, nombre: 'Centro de Distribución Sur', direccion: 'Av. Ciudad de Cali #32-10 Sur', ciudad: 'Bogotá, D.C.' }
];

// Instancia del colapsable de Bootstrap
let sedeCollapseElement = null;

// Función para pintar las sedes en la tabla
function renderSedesTable() {
  const tbody = document.getElementById('tablaSedesBody');
  if (!tbody) return;
  
  let html = '';
  listaSedes.forEach(sede => {
    html += `
      <tr>
        <td class="ps-3 fw-semibold text-dark">${sede.nombre}</td>
        <td>${sede.direccion}</td>
        <td>${sede.ciudad}</td>
        <td class="text-end pe-3">
          <!-- Botón de Editar -->
          <button class="btn btn-sm btn-link text-muted p-1 me-1" onclick="prepareEditSede(${sede.id})" title="Editar Sede">
            <i class="bi bi-pencil-square"></i>
          </button>
          <!-- Botón de Borrar (Caneca) -->
          <button class="btn btn-sm btn-link text-danger p-1" onclick="deleteSede(${sede.id})" title="Eliminar Sede">
            <i class="bi bi-trash3"></i>
          </button>
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
}

// Mostrar el panel de ingreso/edición
function showSedeForm() {
  document.getElementById('formSedeTitle').textContent = 'Nueva Sede de Despacho';
  document.getElementById('notifDetailModal'); // Limpiar inputs viejos
  document.getElementById('sedeId').value = '';
  document.getElementById('sedeNombre').value = '';
  document.getElementById('sedeDireccion').value = '';
  
  if(!sedeCollapseElement) {
    sedeCollapseElement = new bootstrap.Collapse(document.getElementById('formSedeCollapse'), { toggle: false });
  }
  sedeCollapseElement.show();
}

// Ocultar el formulario
function hideSedeForm() {
  if(sedeCollapseElement) {
    sedeCollapseElement.hide();
  }
}

// Cargar los datos de la sede seleccionada en el formulario para editar
function prepareEditSede(id) {
  const sede = listaSedes.find(s => s.id === id);
  if (!sede) return;
  
  document.getElementById('formSedeTitle').textContent = 'Modificar Sede';
  document.getElementById('sedeId').value = sede.id;
  document.getElementById('sedeNombre').value = sede.nombre;
  document.getElementById('sedeDireccion').value = sede.direccion;
  document.getElementById('sedeCiudad').value = sede.ciudad;
  
  if(!sedeCollapseElement) {
    sedeCollapseElement = new bootstrap.Collapse(document.getElementById('formSedeCollapse'), { toggle: false });
  }
  sedeCollapseElement.show();
}

// Guardar los datos (procesa tanto la creación como la actualización)
function saveSedeData() {
  const idValue = document.getElementById('sedeId').value;
  const nombre = document.getElementById('sedeNombre').value.trim();
  const direccion = document.getElementById('sedeDireccion').value.trim();
  const ciudad = document.getElementById('sedeCiudad').value.trim();
  
  if (!nombre || !direccion || !ciudad) {
    alert('Por favor, completa todos los campos de la sede.');
    return;
  }
  
  if (idValue === '') {
    // Modo: Crear nuevo
    const nuevoId = listaSedes.length > 0 ? Math.max(...listaSedes.map(s => s.id)) + 1 : 1;
    listaSedes.push({ id: nuevoId, nombre, direccion, ciudad });
    if(typeof mostrarToast === 'function') mostrarToast('Sede agregada', 'La nueva dirección se registró con éxito.');
  } else {
    // Modo: Editar existente
    const sedeIndex = listaSedes.findIndex(s => s.id === parseInt(idValue));
    if (sedeIndex !== -1) {
      listaSedes[sedeIndex] = { id: parseInt(idValue), nombre, direccion, ciudad };
      if(typeof mostrarToast === 'function') mostrarToast('Sede actualizada', 'Los cambios de la sede fueron guardados.');
    }
  }
  
  hideSedeForm();
  renderSedesTable();
}

// Eliminar Sede de la lista
function deleteSede(id) {
  const sede = listaSedes.find(s => s.id === id);
  if (!sede) return;
  
  if (confirm(`¿Estás seguro de que deseas eliminar la sede "${sede.nombre}"?`)) {
    listaSedes = listaSedes.filter(s => s.id !== id);
    renderSedesTable();
    if(typeof mostrarToast === 'function') mostrarToast('Sede eliminada', 'La dirección fue removida del sistema.');
  }
}

// Escuchar cuando el HTML termine de cargar para inicializar la tabla
window.addEventListener('DOMContentLoaded', () => {
  renderSedesTable();
});



  $(function() {
    $('#o-fecha-rango').daterangepicker({
      autoUpdateInput: false, // Evita que ponga una fecha por defecto antes de hacer clic
      locale: {
        format: 'YYYY-MM-DD',
        applyLabel: 'Aplicar',
        cancelLabel: 'Limpiar',
        fromLabel: 'Desde',
        toLabel: 'Hasta',
        daysOfWeek: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'],
        monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        firstDay: 1
      }
    });

    // Acción cuando el usuario selecciona el rango y le da "Aplicar"
    $('#o-fecha-rango').on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format('YYYY-MM-DD') + '  hasta  ' + picker.endDate.format('YYYY-MM-DD'));
    });

    // Acción si el usuario limpia el campo
    $('#o-fecha-rango').on('cancel.daterangepicker', function(ev, picker) {
        $(this).val('');
    });
  });
