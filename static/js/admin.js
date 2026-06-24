// admin.js — HebraTech Panel de Administración

// ── Sidebar toggle (mobile) ──────────────────────────────
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('open');
}

// Cerrar sidebar al hacer click fuera (mobile)
document.addEventListener('click', function (e) {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.querySelector('.sidebar-toggle');
  if (
    sidebar &&
    sidebar.classList.contains('open') &&
    !sidebar.contains(e.target) &&
    toggle &&
    !toggle.contains(e.target)
  ) {
    sidebar.classList.remove('open');
  }
});

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
