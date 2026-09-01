// admin.js — HebraTech Panel de Administración

// Cerrar sidebar al hacer click fuera (mobile)

// ── Reloj en topbar ──────────────────────────────────────
function updateClock() {
  const el = document.getElementById('topClock');
  if (!el) return;
  const now = new Date();
  const hora = now.toLocaleTimeString('es-CO');
  const fecha = now.toLocaleDateString('es-CO', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
  });
  el.innerHTML = `<strong>${hora}</strong><br><span style="font-size:0.68rem;">${fecha}</span>`;
}
setInterval(updateClock, 1000);
updateClock();  

// ── Marcar nav-item activo según URL actual ──────────────
document.addEventListener('DOMContentLoaded', function () {
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-item').forEach(function (item) {
    const href = item.getAttribute('href');
    if (href && currentPath.startsWith(href) && href !== '/') {
      item.classList.add('active');
    }
  });
});

       document.addEventListener("DOMContentLoaded", function() {
            const buscarInput = document.getElementById('buscarInput');
            const searchForm = document.getElementById('searchForm');

            if (buscarInput && searchForm) {
                buscarInput.addEventListener('input', function() {
                    // Si el usuario vacía el input por completo, envía el form automáticamente para traer todo
                    if (this.value.trim() === "") {
                        searchForm.submit();
                    }
                });
            }
        });

document.addEventListener("DOMContentLoaded", function () {
  const forms = document.querySelectorAll('.needs-validation');

  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      // 1. Sincronizar y validar el costo unitario (debe ser mayor a 0)
      const costoVis = form.querySelector('#costoVisible');
      const costoHid = form.querySelector('#costoUnitario');
      if (costoVis && costoHid) {
        const valCosto = parseInt(costoHid.value, 10);
        if (!costoHid.value || isNaN(valCosto) || valCosto <= 0) {
          costoVis.setCustomValidity("El costo debe ser mayor a 0");
        } else {
          costoVis.setCustomValidity("");
        }
      }

      // 2. Validar que stockActual y stockMinimo sean mayores a 0
      const stockAct = form.querySelector('[name="stockActual"]');
      if (stockAct) {
        if (!stockAct.value || parseInt(stockAct.value, 10) <= 0) {
          stockAct.setCustomValidity("Debe ser mayor a 0");
        } else {
          stockAct.setCustomValidity("");
        }
      }

      const stockMin = form.querySelector('[name="stockMinimo"]');
      if (stockMin) {
        if (!stockMin.value || parseInt(stockMin.value, 10) <= 0) {
          stockMin.setCustomValidity("Debe ser mayor a 0");
        } else {
          stockMin.setCustomValidity("");
        }
      }

      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      form.classList.add('was-validated');
    }, false);
  });
});

function formatearMiles(input) {
  let valor = input.value.replace(/\D/g, "");
  const hiddenField = document.getElementById("costoUnitario");

  if (hiddenField) {
    hiddenField.value = valor;
  }

  if (valor !== "" && parseInt(valor, 10) > 0) {
    input.value = new Intl.NumberFormat("es-CO").format(valor);
    input.setCustomValidity("");
  } else {
    input.value = valor === "0" ? "0" : "";
    input.setCustomValidity("El costo debe ser mayor a 0");
  }
}

function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar, aside, .app-sidebar');
  if (sidebar) {
    sidebar.classList.toggle('open');
  } else {
    alert("Error: No se encontró ningún elemento de menú lateral en el HTML.");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const formPerfil = document.getElementById("formEditarPerfil");
  const alertBox = document.getElementById("perfilAlert");

  if (formPerfil) {
    formPerfil.addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = new FormData(this);
      const token = document.querySelector('[name=csrfmiddlewaretoken]').value;

      fetch(this.action, {
        method: 'POST',
        headers: {
          'X-CSRFToken': token
        },
        body: formData
      })
      .then(async res => {
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Error al actualizar la información.");
        }
        return data;
      })
      .then(data => {
        window.location.reload();
      })
      .catch(err => {
        console.error("Detalle del error:", err);
        if (alertBox) {
          alertBox.classList.remove("d-none");
          alertBox.innerText = err.message;
        }
      });
    });
  }
});