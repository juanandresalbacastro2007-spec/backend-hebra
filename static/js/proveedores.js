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