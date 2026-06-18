from django.shortcuts import render, redirect # 1. Asegúrate de importar 'redirect'

def home_view(request):
    return render(request, 'usuarios/home.html')

# Vista para el Login
def login_view(request):
    if request.method == 'POST':
        # 2. Capturamos los datos que vienen del formulario HTML
        correo = request.POST.get('correo')
        rol_seleccionado = request.POST.get('role')
        contrasena = request.POST.get('contraseña')

        # [Opcional] Aquí harás la validación con la base de datos más adelante.
        
        # 3. Redireccionamos según el rol seleccionado
        if rol_seleccionado == 'cliente':
            return redirect('cliente_portal') # Redirige al name='cliente_portal' de tus urls
        elif rol_seleccionado == 'administrador':
            # return redirect('admin_portal') # Cambia esto por el nombre de tu vista de admin
            pass
        elif rol_seleccionado == 'operario':
            # return redirect('operario_portal') # Cambia esto por el nombre de tu vista de operario
            pass

    # Si es una petición GET (cuando recién entran a la página), solo muestra el HTML
    return render(request, 'usuarios/login.html')

def recuperar_view(request):
    return render(request, 'usuarios/recuperar.html')