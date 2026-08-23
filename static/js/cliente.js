/* ============================================================
   cliente.js — HebraTech Portal de Clientes
   ============================================================ */

'use strict';

/* ══════════════════════════════════════════════════════════════
   1. RELOJ EN TIEMPO REAL
══════════════════════════════════════════════════════════════ */
function actualizarReloj() {
  const ahora = new Date();
  const h = String(ahora.getHours()).padStart(2, '0');
  const m = String(ahora.getMinutes()).padStart(2, '0');
  const s = String(ahora.getSeconds()).padStart(2, '0');

  const clockEl = document.getElementById('clockDisplay');
  const dateEl  = document.getElementById('dateDisplay');
  if (clockEl) clockEl.textContent = `${h}:${m}:${s}`;

  if (dateEl) {
    const dias   = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses  = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    dateEl.textContent = `${dias[ahora.getDay()]} ${ahora.getDate()} ${meses[ahora.getMonth()]} ${ahora.getFullYear()}`;
  }
}
actualizarReloj();
setInterval(actualizarReloj, 1000);


/* ══════════════════════════════════════════════════════════════
   2. VALIDACIÓN — MODAL NUEVA ORDEN
══════════════════════════════════════════════════════════════ */
document.querySelectorAll('.needs-validation').forEach(function (form) {
  form.addEventListener('submit', function (e) {
    if (!form.checkValidity()) {
      e.preventDefault();
      e.stopPropagation();
    } else {
      e.preventDefault();
      const modal = document.getElementById('newOrderModal');
      if (modal) bootstrap.Modal.getInstance(modal)?.hide();
    }
    form.classList.add('was-validated');
  });
});


/* ══════════════════════════════════════════════════════════════
   3. MODAL COTIZACIÓN — precios y subtotal
══════════════════════════════════════════════════════════════ */
const formatterCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
});

function calcularCotizacion() {
  const prendaEl    = document.getElementById('quotePrenda');
  const cantidadEl  = document.getElementById('quoteCantidad');
  const precioEl    = document.getElementById('quotePrecioUnitario');
  const subtotalEl  = document.getElementById('quoteSubtotalDisplay');
  if (!prendaEl || !cantidadEl) return;

  const precio   = parseFloat(prendaEl.value) || 0;
  const cantidad = parseInt(cantidadEl.value)  || 0;

  if (precioEl) {
    precioEl.value = precio > 0 ? precio.toLocaleString('es-CO') : '';
  }
  if (subtotalEl) {
    subtotalEl.textContent = formatterCOP.format(precio * cantidad);
  }
}

document.getElementById('quotePrenda')   ?.addEventListener('change', calcularCotizacion);
document.getElementById('quoteCantidad') ?.addEventListener('input',  calcularCotizacion);

const formCotizacion = document.getElementById('formCotizacion');
if (formCotizacion) {
  formCotizacion.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!formCotizacion.checkValidity()) {
      formCotizacion.classList.add('was-validated');
      return;
    }

    bootstrap.Modal.getInstance(document.getElementById('quoteModal'))?.hide();

    mostrarToast({
      tipo: 'success', icono: 'bi-file-earmark-check',
      titulo: 'Cotización enviada',
      mensaje: 'La solicitud se registró. Evaluaremos costos según tus especificaciones.',
      accion: null,
    });

    formCotizacion.reset();
    formCotizacion.classList.remove('was-validated');
    const subtotalEl = document.getElementById('quoteSubtotalDisplay');
    if (subtotalEl) subtotalEl.textContent = '$0';
  });
}


/* ══════════════════════════════════════════════════════════════
   4. MODAL NUEVA ORDEN — precio y subtotal (si aplica)
══════════════════════════════════════════════════════════════ */
let precioModalOrden = 0;

function actualizarPrecio() {
  const sel = document.getElementById('modalProducto');
  const dispEl = document.getElementById('modalPrecioDisplay');
  if (!sel) return;

  const opcion = sel.options[sel.selectedIndex];
  precioModalOrden = opcion?.value ? parseFloat(opcion.getAttribute('data-precio')) || 0 : 0;
  if (dispEl) {
    dispEl.value = precioModalOrden > 0
      ? precioModalOrden.toLocaleString('es-CO', { minimumFractionDigits: 0 })
      : '';
  }
  actualizarSubtotalOrden();
}

function actualizarSubtotalOrden() {
  const cant = parseInt(document.getElementById('modalCantidad')?.value) || 0;
  const el   = document.getElementById('modalSubtotalDisplay');
  if (el) {
    el.innerText = cant > 0 && precioModalOrden > 0
      ? '$' + (cant * precioModalOrden).toLocaleString('es-CO', { minimumFractionDigits: 0 })
      : '$0';
  }
}


/* ══════════════════════════════════════════════════════════════
   5. TOAST — sistema de notificaciones flotantes
══════════════════════════════════════════════════════════════ */
function mostrarToast(notif, delay = 0) {
  setTimeout(() => {
    const id       = 'toast-' + Date.now() + Math.random().toString(36).slice(2);
    const duracion = 6000;

    const accionHtml = notif.accion
      ? `<button class="ht-toast-action"
           onclick="document.getElementById('${id}').remove();
                    bootstrap.Modal.getOrCreateInstance(document.getElementById('${notif.accion.modal}')).show();">
           ${notif.accion.texto} →
         </button>`
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

    document.getElementById('toastContainer')?.appendChild(el);

    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));

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
  el.classList.replace('show', 'hide');
  setTimeout(() => el.remove(), 400);
}


/* ══════════════════════════════════════════════════════════════
   6. FORMULARIO DE CONTACTO / SOPORTE
══════════════════════════════════════════════════════════════ */
function previewContactFile(input) {
  const label = document.getElementById('contactFileLabel');
  if (label) {
    label.textContent = input.files.length > 0
      ? Array.from(input.files).map(f => f.name).join(', ')
      : 'Sin archivos';
  }
}

function enviarContacto() {
  const asunto  = document.getElementById('contactAsunto')?.value;
  const mensaje = document.getElementById('contactMensaje')?.value.trim();

  if (!asunto || !mensaje) {
    mostrarToast({
      tipo: 'warning', icono: 'bi-exclamation-circle',
      titulo: 'Campos requeridos',
      mensaje: 'Selecciona un asunto y escribe tu mensaje.',
      accion: null,
    });
    return;
  }

  const pedido     = document.getElementById('contactPedido')?.value || '';
  const pedidoText = pedido ? `\nPedido: ${pedido}` : '';
  const subject    = encodeURIComponent(`[Portal Cliente] ${asunto}${pedido ? ' — ' + pedido : ''}`);
  const body       = encodeURIComponent(`Asunto: ${asunto}${pedidoText}\n\n${mensaje}`);
  window.location.href = `mailto:produccion@hebratech.com?subject=${subject}&body=${body}`;

  document.getElementById('contactFormWrap')?.classList.add('d-none');
  document.getElementById('contactConfirm')?.classList.remove('d-none');
}

function resetContactForm() {
  const ids = ['contactAsunto', 'contactPedido', 'contactMensaje'];
  ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const label = document.getElementById('contactFileLabel');
  if (label) label.textContent = 'Sin archivos';
  document.getElementById('contactFormWrap')?.classList.remove('d-none');
  document.getElementById('contactConfirm')?.classList.add('d-none');
}

function handleUpload(input) {
  if (input.files.length > 0) {
    mostrarToast({
      tipo: 'success', icono: 'bi-cloud-check',
      titulo: 'Archivo subido',
      mensaje: Array.from(input.files).map(f => f.name).join(', '),
      accion: null,
    });
  }
}


/* ══════════════════════════════════════════════════════════════
   7. NOTIFICACIONES EN TIEMPO REAL — polling al backend Django
   (reemplaza la lista simulada de listaNotificaciones)
══════════════════════════════════════════════════════════════ */
(function () {
  const POLL_MS        = 30_000;
  const URL_NOTIF      = '/clientes/notificaciones/';
  const URL_LEER       = (id) => `/clientes/notificaciones/${id}/leer/`;
  const URL_ORDENES    = '/clientes/actualizar-ordenes/';

  const badgeContador      = document.getElementById('notifCount');
  const listaDropdown      = document.getElementById('notifDropdownList');
  const contenedorTracker  = document.getElementById('orderTrackerContainer');

  /* Consultar notificaciones al backend */
  async function consultarNotificaciones() {
    try {
      const resp = await fetch(URL_NOTIF, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      if (!resp.ok) return;
      const data = await resp.json();
      actualizarBadge(data.no_leidas);
      actualizarDropdown(data.notificaciones);
      if (data.no_leidas > 0) await refrescarTracker();
    } catch (err) {
      console.warn('[HebraTech] notificaciones:', err);
    }
  }

  /* Badge del campanita */
  function actualizarBadge(cantidad) {
    if (!badgeContador) return;
    badgeContador.textContent     = cantidad > 9 ? '9+' : cantidad;
    badgeContador.style.display   = cantidad > 0 ? 'inline-flex' : 'none';
  }

  /* Lista en el dropdown */
  function actualizarDropdown(notificaciones) {
    if (!listaDropdown) return;

    if (!notificaciones.length) {
      listaDropdown.innerHTML = `
        <li class="px-3 py-3 text-center text-muted small">
          <i class="bi bi-bell-slash d-block mb-1 fs-4 opacity-50"></i>
          Sin notificaciones nuevas
        </li>`;
      return;
    }

    const iconos = {
      orden:   'bi-box-seam text-primary',
      factura: 'bi-receipt text-warning',
      sistema: 'bi-info-circle text-info',
    };

    listaDropdown.innerHTML = notificaciones.map(n => `
      <li class="notif-item px-2 py-2 ${n.leida ? 'opacity-50' : ''}"
          style="cursor:pointer;border-radius:8px;transition:background 0.15s;"
          onmouseenter="this.style.background='#f4f9fa'"
          onmouseleave="this.style.background=''"
          onclick="window.htMarcarLeida(${n.id}, this)">
        <div class="d-flex align-items-start gap-2">
          <i class="bi ${iconos[n.tipo] || 'bi-bell'} mt-1" style="font-size:1rem;flex-shrink:0;"></i>
          <div style="min-width:0;">
            <div class="small fw-semibold text-dark" style="line-height:1.3;">
              ${n.titulo}
              ${!n.leida
                ? '<span class="badge bg-primary ms-1" style="font-size:0.55rem;padding:2px 5px;border-radius:999px;">NUEVO</span>'
                : ''}
            </div>
            <div class="text-muted" style="font-size:0.75rem;margin-top:2px;line-height:1.4;white-space:normal;">
              ${n.mensaje}
            </div>
            <div style="font-size:0.65rem;color:#aab;margin-top:3px;">${n.fecha}</div>
          </div>
        </div>
      </li>
    `).join('<li><hr class="dropdown-divider my-1"></li>');
  }

  /* Marcar una como leída */
  window.htMarcarLeida = async function (id, elemento) {
    try {
      await fetch(URL_LEER(id), {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-CSRFToken': getCsrf() },
      });
      elemento?.classList.add('opacity-50');
      consultarNotificaciones();
    } catch (err) {
      console.warn('[HebraTech] marcar leída:', err);
    }
  };

  /* Marcar todas como leídas */
  window.htMarcarTodasLeidas = async function () {
    try {
      await fetch(URL_LEER(0), {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-CSRFToken': getCsrf() },
      });
      consultarNotificaciones();
    } catch (err) {
      console.warn('[HebraTech] marcar todas:', err);
    }
  };

  /* Refrescar el tracker de órdenes */
  async function refrescarTracker() {
    if (!contenedorTracker) return;
    try {
      const resp = await fetch(URL_ORDENES, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      if (!resp.ok) return;
      const data = await resp.json();
      if (data.html) contenedorTracker.innerHTML = data.html;
    } catch (err) {
      console.warn('[HebraTech] tracker:', err);
    }
  }

  /* Cookie CSRF */
  function getCsrf() {
    const c = document.cookie.split(';').find(x => x.trim().startsWith('csrftoken='));
    return c ? c.split('=')[1] : '';
  }

  /* Arranque */
  document.addEventListener('DOMContentLoaded', function () {
    consultarNotificaciones();
    setInterval(consultarNotificaciones, POLL_MS);
    document.getElementById('btnMarcarTodasLeidas')
      ?.addEventListener('click', window.htMarcarTodasLeidas);
  });
})();


/* ══════════════════════════════════════════════════════════════
   8. GESTIÓN DE SEDES (Modal Configuración)
══════════════════════════════════════════════════════════════ */
let listaSedes = [
  { id: 1, nombre: 'Sede Principal - Norte',    direccion: 'Calle 100 #15-23, Piso 4',     ciudad: 'Bogotá, D.C.' },
  { id: 2, nombre: 'Centro de Distribución Sur', direccion: 'Av. Ciudad de Cali #32-10 Sur', ciudad: 'Bogotá, D.C.' },
];

let sedeCollapse = null;

function renderSedesTable() {
  const tbody = document.getElementById('tablaSedesBody');
  if (!tbody) return;
  tbody.innerHTML = listaSedes.map(s => `
    <tr>
      <td class="ps-3 fw-semibold text-dark">${s.nombre}</td>
      <td>${s.direccion}</td>
      <td>${s.ciudad}</td>
      <td class="text-end pe-3">
        <button class="btn btn-sm btn-link text-muted p-1 me-1" onclick="prepareEditSede(${s.id})" title="Editar">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-sm btn-link text-danger p-1" onclick="deleteSede(${s.id})" title="Eliminar">
          <i class="bi bi-trash3"></i>
        </button>
      </td>
    </tr>`).join('');
}

function _getCollapse() {
  if (!sedeCollapse) {
    const el = document.getElementById('formSedeCollapse');
    if (el) sedeCollapse = new bootstrap.Collapse(el, { toggle: false });
  }
  return sedeCollapse;
}

function showSedeForm() {
  document.getElementById('formSedeTitle').textContent = 'Nueva Sede de Despacho';
  ['sedeId', 'sedeNombre', 'sedeDireccion'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const ciudad = document.getElementById('sedeCiudad');
  if (ciudad) ciudad.value = 'Bogotá, D.C.';
  _getCollapse()?.show();
}

function hideSedeForm() {
  _getCollapse()?.hide();
}

function prepareEditSede(id) {
  const s = listaSedes.find(x => x.id === id);
  if (!s) return;
  document.getElementById('formSedeTitle').textContent = 'Modificar Sede';
  document.getElementById('sedeId').value        = s.id;
  document.getElementById('sedeNombre').value    = s.nombre;
  document.getElementById('sedeDireccion').value = s.direccion;
  document.getElementById('sedeCiudad').value    = s.ciudad;
  _getCollapse()?.show();
}

function saveSedeData() {
  const idVal     = document.getElementById('sedeId')?.value;
  const nombre    = document.getElementById('sedeNombre')?.value.trim();
  const direccion = document.getElementById('sedeDireccion')?.value.trim();
  const ciudad    = document.getElementById('sedeCiudad')?.value.trim();

  if (!nombre || !direccion || !ciudad) {
    alert('Por favor completa todos los campos de la sede.');
    return;
  }

  if (!idVal) {
    const nuevoId = listaSedes.length ? Math.max(...listaSedes.map(s => s.id)) + 1 : 1;
    listaSedes.push({ id: nuevoId, nombre, direccion, ciudad });
    mostrarToast({ tipo: 'success', icono: 'bi-geo-alt-fill', titulo: 'Sede agregada', mensaje: nombre, accion: null });
  } else {
    const idx = listaSedes.findIndex(s => s.id === parseInt(idVal));
    if (idx !== -1) {
      listaSedes[idx] = { id: parseInt(idVal), nombre, direccion, ciudad };
      mostrarToast({ tipo: 'success', icono: 'bi-pencil-square', titulo: 'Sede actualizada', mensaje: nombre, accion: null });
    }
  }

  hideSedeForm();
  renderSedesTable();
}

function deleteSede(id) {
  const s = listaSedes.find(x => x.id === id);
  if (!s || !confirm(`¿Eliminar la sede "${s.nombre}"?`)) return;
  listaSedes = listaSedes.filter(x => x.id !== id);
  renderSedesTable();
  mostrarToast({ tipo: 'warning', icono: 'bi-trash3', titulo: 'Sede eliminada', mensaje: s.nombre, accion: null });
}


/* ══════════════════════════════════════════════════════════════
   9. INICIALIZACIÓN GENERAL
══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  renderSedesTable();
});