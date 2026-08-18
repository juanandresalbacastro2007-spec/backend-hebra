/* ══════════════════════════════════════════
   PERFIL MODAL — HebraTech Admin
   Ruta sugerida: static/js/administrador/perfil.js
   ══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {
  const form       = document.getElementById('formEditarPerfil');
  const modalEl    = document.getElementById('modalEditarPerfil');
  const alertBox   = document.getElementById('perfilAlert');
  const btnGuardar = document.getElementById('btnGuardarPerfil');
  const spinner    = document.getElementById('spinnerGuardar');
  const btnText    = btnGuardar ? btnGuardar.querySelector('.btn-text') : null;

  if (!form || !modalEl) return;

  const inputNombre   = document.getElementById('perfilNombre');
  const inputApellido = document.getElementById('perfilApellido');
  const inputEmail    = document.getElementById('perfilEmail');
  const inputPass1    = document.getElementById('perfilPassword1');
  const inputPass2    = document.getElementById('perfilPassword2');
  const inputFoto     = document.getElementById('perfilFoto');
  const avatarPreview = document.getElementById('perfilAvatarPreview');

  /* ── Vista previa en tiempo real de la foto seleccionada ── */
  if (inputFoto && avatarPreview) {
    inputFoto.addEventListener('change', function (e) {
      const archivo = e.target.files[0];
      if (!archivo) return;

      if (!archivo.type.startsWith('image/')) {
        mostrarAlerta('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).', 'error');
        this.value = '';
        return;
      }

      limpiarAlerta();

      // Generar URL temporal para la previsualización
      const urlPreview = URL.createObjectURL(archivo);
      avatarPreview.innerHTML = `<img src="${urlPreview}" alt="Vista previa del avatar">`;
    });
  }

  /* ── Mostrar / Ocultar Contraseña ── */
  document.querySelectorAll('.toggle-password').forEach(icon => {
    icon.addEventListener('click', function () {
      const input = document.getElementById(this.dataset.target);
      if (!input) return;

      const esPassword = input.type === 'password';
      input.type = esPassword ? 'text' : 'password';
      this.classList.toggle('bi-eye-slash-fill', !esPassword);
      this.classList.toggle('bi-eye-fill', esPassword);
    });
  });

  /* ── Helpers de Estado y Alertas ── */
  function mostrarAlerta(mensaje, tipo) {
    alertBox.textContent = mensaje;
    alertBox.className = 'perfil-alert ' + (tipo === 'error' ? 'show-error' : 'show-success');
  }

  function limpiarAlerta() {
    alertBox.className = 'perfil-alert';
    alertBox.textContent = '';
  }

  function limpiarErroresCampos() {
    [inputNombre, inputApellido, inputEmail, inputPass1, inputPass2].forEach(el => el && el.classList.remove('is-invalid'));
  }

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  function setLoading(activo) {
    if (!btnGuardar) return;
    btnGuardar.disabled = activo;
    if (btnText) btnText.textContent = activo ? 'Guardando...' : 'Guardar cambios';
    if (spinner) spinner.classList.toggle('d-none', !activo);
  }

  /* ── Manejo de errores devueltos por el backend ── */
  function manejarErrorBackend(mensaje) {
    const msgLower = (mensaje || '').toLowerCase();

    if (msgLower.includes('correo') || msgLower.includes('email')) {
      inputEmail.classList.add('is-invalid');
      inputEmail.focus();
    } else if (msgLower.includes('contraseña')) {
      inputPass1.classList.add('is-invalid');
      inputPass2.classList.add('is-invalid');
      inputPass1.focus();
    } else if (msgLower.includes('nombre') && !msgLower.includes('apellido')) {
      inputNombre.classList.add('is-invalid');
      inputNombre.focus();
    } else if (msgLower.includes('apellido')) {
      inputApellido.classList.add('is-invalid');
      inputApellido.focus();
    }

    mostrarAlerta(mensaje || 'No se pudo actualizar el perfil.', 'error');
  }

  /* ── Envío del Formulario vía AJAX (FormData soporta archivos) ── */
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    limpiarAlerta();
    limpiarErroresCampos();

    const pass1 = inputPass1 ? inputPass1.value : '';
    const pass2 = inputPass2 ? inputPass2.value : '';

    if (pass1 || pass2) {
      if (pass1 !== pass2) {
        inputPass1.classList.add('is-invalid');
        inputPass2.classList.add('is-invalid');
        mostrarAlerta('Las contraseñas no coinciden.', 'error');
        return;
      }
      if (pass1.length < 8) {
        inputPass1.classList.add('is-invalid');
        mostrarAlerta('La contraseña debe tener al menos 8 caracteres.', 'error');
        return;
      }
    }

    setLoading(true);

    // FormData empaqueta automáticamente textos y archivos (<input type="file">)
    const formData = new FormData(form);

    try {
      const response = await fetch('/administrador/editar-perfil/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': getCookie('csrftoken'),
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
      });

      let data;
      try {
        data = await response.json();
      } catch (parseErr) {
        throw new Error('Respuesta inválida del servidor.');
      }

      if (response.ok && data.success) {
        mostrarAlerta(data.mensaje || 'Perfil actualizado correctamente.', 'success');

        const nombre = inputNombre.value.trim();
        const apellido = inputApellido.value.trim();

        // Actualizar nombre completo en el Sidebar
        const nombreSidebar = document.querySelector('.admin-name');
        if (nombreSidebar) nombreSidebar.textContent = `${nombre} ${apellido}`;

        // Actualizar el avatar en el Sidebar sin recargar
        const avataresSidebar = document.querySelectorAll('.admin-avatar');
        avataresSidebar.forEach(el => {
          if (data.foto_url) {
            el.innerHTML = `<img src="${data.foto_url}" alt="Avatar" class="admin-avatar-img">`;
          } else if (!data.tiene_foto) {
            el.textContent = nombre.charAt(0).toUpperCase();
          }
        });

        // Cerrar modal tras guardar con éxito
        setTimeout(() => {
          const instanciaModal = bootstrap.Modal.getInstance(modalEl);
          if (instanciaModal) instanciaModal.hide();

          limpiarAlerta();
          if (inputPass1) inputPass1.value = '';
          if (inputPass2) inputPass2.value = '';
          if (inputFoto) inputFoto.value = '';
        }, 1200);

      } else {
        manejarErrorBackend(data.mensaje);
      }
    } catch (err) {
      mostrarAlerta('Error de conexión con el servidor. Intenta nuevamente.', 'error');
    } finally {
      setLoading(false);
    }
  });

  /* ── Quitar clase de error al interactuar con las entradas ── */
  [inputNombre, inputApellido, inputEmail, inputPass1, inputPass2].forEach(input => {
    if (!input) return;
    input.addEventListener('input', function () {
      this.classList.remove('is-invalid');
    });
  });

  /* ── Resetear alertas al cerrar el modal ── */
  modalEl.addEventListener('hidden.bs.modal', function () {
    limpiarAlerta();
    limpiarErroresCampos();
  });
});