document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Script cargado");
    
    const inputBusqueda = document.getElementById('campoBusqueda');
    const contenedorBotones = document.querySelector('.nav-pills');
    
    if (!inputBusqueda) {
        console.error("❌ No encontré #campoBusqueda");
        return;
    }
    
    if (!contenedorBotones) {
        console.error("❌ No encontré .nav-pills");
        return;
    }
    
    // Escuchar el evento input
    inputBusqueda.addEventListener('input', function() {
        const filtro = this.value.toLowerCase().trim();
        console.log(`Filtro: "${filtro}"`);
        
        // Obtener todos los botones dentro del contenedor
        const botones = contenedorBotones.querySelectorAll('button.nav-link');
        console.log(`Total de botones: ${botones.length}`);
        
        botones.forEach((boton, index) => {
            const textoCompleto = boton.textContent.toLowerCase();
            console.log(`Botón ${index}: ${textoCompleto}`);
            
            if (textoCompleto.includes(filtro) || filtro === '') {
                boton.style.display = 'flex';
                console.log(`  → Mostrado`);
            } else {
                boton.style.display = 'none';
                console.log(`  → Oculto`);
            }
        });
    });
});



/* validacion de datos llenos en el formulario de agregar*/
document.addEventListener('DOMContentLoaded', function () {
  const formAgregar = document.querySelector('#modalAgregarProveedor form');
  const alertContainer = document.getElementById('alertaErrorModal');

  if (formAgregar) {
    formAgregar.addEventListener('submit', function (event) {
      let esValido = true;
      let mensajeError = '';

      // 1. Verificar si hay campos vacíos
      const camposRequeridos = formAgregar.querySelectorAll('[required]');
      camposRequeridos.forEach(campo => {
        if (!campo.value.trim()) {
          esValido = false;
          mensajeError = 'Por favor completa todos los campos requeridos.';
        }
      });

      // 2. Validaciones específicas (solo si pasó la de vacíos)
      if (esValido) {
        const nit = formAgregar.querySelector('[name="nit"]').value.trim();
        const telefono = formAgregar.querySelector('[name="telefono"]').value.trim();

        if (nit.length < 9) {
          esValido = false;
          mensajeError = 'El NIT debe tener al menos 9 dígitos.';
        } else if (telefono.length < 7) {
          esValido = false;
          mensajeError = 'El teléfono debe tener al menos 7 dígitos.';
        }
      }

      // 3. Si hay un error, frena el envio y muestra la alerta en pantalla
      if (!esValido) {
        event.preventDefault();
        event.stopPropagation();

        alertContainer.innerText = mensajeError;
        alertContainer.classList.remove('d-none'); // Muestra la alerta roja
      } else {
        alertContainer.classList.add('d-none'); // Oculta si todo está bien
      }
    });
  }
});