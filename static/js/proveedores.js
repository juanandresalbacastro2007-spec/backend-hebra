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

  /* ── Validación Bootstrap del formulario Agregar ──────── */
  const formAgregarProveedor = document.getElementById('formAgregarProveedor');

  if (formAgregarProveedor) {
    formAgregarProveedor.addEventListener('submit', function (e) {
      if (!formAgregarProveedor.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
      }
      formAgregarProveedor.classList.add('was-validated');
    });
  }

});