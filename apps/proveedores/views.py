# apps/proveedores/views.py

from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .models import Proveedor
from .forms import ProveedorForm
from django.contrib import messages
from django.utils import timezone
import json
from apps.usuarios.models import Usuario

from apps.core.decorators import login_required_rol, login_required_api

# ── Decoradores de protección (gestionado por el administrador) ────
admin_required = login_required_rol(rol_esperado='administrador', session_key='usuario_id')
admin_required_api = login_required_api(rol_esperado='administrador', session_key='usuario_id')


@admin_required
def lista_proveedores(request):
    # Esta es tu vista real que cargará el HTML limpio de proveedores
    return render(request, 'proveedores/proveedores.html')


@admin_required_api
@require_POST
def cambiar_estado_proveedor(request, id):
    try:
        proveedor = Proveedor.objects.get(idProveedor=id)
        data = json.loads(request.body)

        # ✅ CORRECCIÓN: Forzamos minúsculas para que coincida con los CHOICES del modelo
        estado_input = data.get('estado', 'activo').lower()
        proveedor.estado = estado_input
        proveedor.save()

        return JsonResponse({'success': True, 'estado': proveedor.estado})
    except Proveedor.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Proveedor no encontrado'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@admin_required
def listar_proveedores(request):
    proveedores = Proveedor.objects.all().order_by('-fechaRegistro')
    form = ProveedorForm()
    return render(request, 'proveedores/proveedores.html', {
        'proveedores': proveedores, 
        'form': form
    })


@admin_required
def crear_proveedor(request):
    if request.method == 'POST':
        form = ProveedorForm(request.POST)
        if form.is_valid():
            nuevo_proveedor = form.save(commit=False)
            # ⚠️ Pendiente de revisar con Jorge: esto asocia SIEMPRE el
            # proveedor al usuario id=1, sin importar quién lo cree.
            # Debería ser request.session.get('usuario_id').
            nuevo_proveedor.idUsuario_id = 1 
            nuevo_proveedor.save()
            messages.success(request, '✅ Proveedor creado exitosamente')
            return redirect('admin_proveedores')
    
    form = ProveedorForm()
    return render(request, 'proveedores/proveedores.html', {
        'form': form,
        'proveedores': Proveedor.objects.all().order_by('-fechaRegistro')
    })


@admin_required
def editar_proveedor(request, id):
    proveedor = get_object_or_404(Proveedor, idProveedor=id)
    
    if request.method == 'POST':
        form = ProveedorForm(request.POST, instance=proveedor)
        if form.is_valid():
            form.save()
            messages.success(request, f'✏️ {proveedor.nombreEmpresa} actualizado correctamente')
            return redirect('admin_proveedores')
    else:
        form = ProveedorForm(instance=proveedor)
    
    proveedores = Proveedor.objects.all().order_by('-fechaRegistro')
    return render(request, 'proveedores/proveedores.html', {
        'form': form,
        'proveedores': proveedores
    })


@admin_required
def eliminar_proveedor(request, id):
    proveedor = get_object_or_404(Proveedor, idProveedor=id)
    
    # ✅ CORRECCIÓN: Cambiado a minúsculas
    proveedor.estado = 'inactivo'
    proveedor.save()
    
    messages.warning(request, f'🗑️ {proveedor.nombreEmpresa} desactivado correctamente')
    return redirect('admin_proveedores')



@admin_required
def crear_proveedor(request):
    if request.method == 'POST':
        form = ProveedorForm(request.POST)
        if form.is_valid():
            proveedor = form.save(commit=False)
            
            # Obtener ID del usuario desde la sesión o del objeto de usuario
            usuario_id = getattr(request.user, 'idUsuario', None) or getattr(request.user, 'id', None) or request.session.get('usuario_id')
            
            # Si no hay usuario en sesión, puedes tomar el primer registro activo como respaldo
            if not usuario_id:
                from apps.usuarios.models import Usuario  # Ajusta a tu import real de Usuario
                primer_usuario = Usuario.objects.first()
                usuario_id = primer_usuario.pk if primer_usuario else 1

            proveedor.idUsuario_id = usuario_id
            proveedor.save()
            
            messages.success(request, '✅ Proveedor creado con éxito.')
            return redirect('admin_proveedores')