/* proveedores.js — HebraTech · Módulo de Proveedores v2 */

document.addEventListener('DOMContentLoaded', function () {

  /* ── Contadores KPI ───────────────────────────────────── */
  (function actualizarKPIs() {
    const items = document.querySelectorAll('.prov-item[data-estado]');
    let activos = 0, inactivos = 0;
    items.forEach(btn => {
      if (btn.dataset.estado === 'activo') activos++;
      else inactivos++;
    });
    const elA = document.getElementById('cntActivos');
    const elI = document.getElementById('cntInactivos');
    if (elA) elA.textContent = activos;
    if (elI) elI.textContent = inactivos;
  })();

  /* ── Búsqueda en tiempo real ──────────────────────────── */
  const inputBusqueda = document.getElementById('campoBusqueda');
  const btnLimpiar    = document.getElementById('btnLimpiarBusqueda');
  const sinResultados = document.getElementById('sinResultados');

  function filtrarLista() {
    const filtro  = inputBusqueda.value.toLowerCase().trim();
    const estadoActivo = document.querySelector('.ftab.active')?.dataset.filtro || 'todos';
    const botones = document.querySelectorAll('.prov-item');
    let visibles  = 0;

    botones.forEach(btn => {
      const texto  = btn.textContent.toLowerCase();
      const estado = btn.dataset.estado;

      const pasaTexto  = !filtro || texto.includes(filtro);
      const pasaEstado = estadoActivo === 'todos' || estado === estadoActivo;

      if (pasaTexto && pasaEstado) {
        btn.style.display = 'flex';
        visibles++;
      } else {
        btn.style.display = 'none';
      }
    });

    if (sinResultados) {
      sinResultados.classList.toggle('d-none', visibles > 0);
    }

    /* Botón limpiar */
    if (btnLimpiar) {
      btnLimpiar.classList.toggle('d-none', !filtro);
    }
  }

  if (inputBusqueda) {
    inputBusqueda.addEventListener('input', filtrarLista);
  }

  if (btnLimpiar) {
    btnLimpiar.addEventListener('click', function () {
      inputBusqueda.value = '';
      filtrarLista();
      inputBusqueda.focus();
    });
  }

  /* ── Filtro por estado ────────────────────────────────── */
  document.querySelectorAll('.ftab').forEach(tab => {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.ftab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      filtrarLista();
    });
  });

  /* ── Copiar NIT al portapapeles ────────────────────────── */
  window.copiarNIT = function (nit, btn) {
    navigator.clipboard.writeText(nit).then(() => {
      const original = btn.innerHTML;
      btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>¡Copiado!';
      btn.style.background    = 'rgba(40,167,69,0.08)';
      btn.style.borderColor   = 'rgba(40,167,69,0.4)';
      btn.style.color         = '#1a7a38';
      setTimeout(() => {
        btn.innerHTML = original;
        btn.style.background  = '';
        btn.style.borderColor = '';
        btn.style.color       = '';
      }, 1800);
    }).catch(() => {
      alert('No se pudo copiar. NIT: ' + nit);
    });
  };

  /* ── Validación del formulario Agregar ────────────────── */
  const formAgregar    = document.querySelector('#modalAgregarProveedor form');
  const alertContainer = document.getElementById('alertaErrorModal');

  if (formAgregar) {
    formAgregar.addEventListener('submit', function (event) {
      let esValido = true;
      let mensajeError = '';

      const camposRequeridos = formAgregar.querySelectorAll('[required]');
      camposRequeridos.forEach(campo => {
        if (!campo.value.trim()) {
          esValido = false;
          mensajeError = 'Por favor completa todos los campos requeridos.';
        }
      });

      if (esValido) {
        const nit      = formAgregar.querySelector('[name="nit"]').value.trim();
        const telefono = formAgregar.querySelector('[name="telefono"]').value.trim();

        if (nit.length < 9) {
          esValido = false;
          mensajeError = 'El NIT debe tener al menos 9 dígitos.';
        } else if (telefono.length < 7) {
          esValido = false;
          mensajeError = 'El teléfono debe tener al menos 7 dígitos.';
        }
      }

      if (!esValido) {
        event.preventDefault();
        event.stopPropagation();
        if (alertContainer) {
          alertContainer.innerText = mensajeError;
          alertContainer.classList.remove('d-none');
        }
      } else {
        if (alertContainer) alertContainer.classList.add('d-none');
      }
    });
  }

});