# apps/proveedores/views.py

from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .models import Proveedor
from .forms import ProveedorForm
from django.contrib import messages
import json
from apps.core.decorators import login_required_rol, login_required_api
from apps.administrador.models import Usuario

# ── Decoradores de protección (gestionado por el administrador) ────
admin_required = login_required_rol(rol_esperado='administrador', session_key='usuario_id')
admin_required_api = login_required_api(rol_esperado='administrador', session_key='usuario_id')


@admin_required
def listar_proveedores(request):
    usuario = Usuario.objects.get(idUsuario=request.session['usuario_id'])
    proveedores = Proveedor.objects.all().order_by('-fechaRegistro')
    form = ProveedorForm()
    return render(request, 'proveedores/proveedores.html', {
        'usuario': usuario,
        'seccion_activa': 'proveedores',
        'proveedores': proveedores,
        'form': form
    })


@admin_required
def crear_proveedor(request):
    if request.method == 'POST':
        form = ProveedorForm(request.POST)
        if form.is_valid():
            proveedor = form.save(commit=False)

            # ID del usuario logueado (sesión manual, no auth de Django)
            usuario_id = request.session.get('usuario_id')
            proveedor.idUsuario_id = usuario_id

            proveedor.save()
            messages.success(request, '✅ Proveedor creado con éxito.')
            return redirect('admin_proveedores')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'⚠️ {error}')
            return redirect('admin_proveedores')

    return redirect('admin_proveedores')


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
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'⚠️ {error}')

    usuario = Usuario.objects.get(idUsuario=request.session['usuario_id'])
    proveedores = Proveedor.objects.all().order_by('-fechaRegistro')
    return render(request, 'proveedores/proveedores.html', {
        'usuario': usuario,
        'seccion_activa': 'proveedores',
        'form': ProveedorForm(instance=proveedor),
        'proveedores': proveedores
    })


@admin_required
def eliminar_proveedor(request, id):
    proveedor = get_object_or_404(Proveedor, idProveedor=id)

    proveedor.estado = 'inactivo'
    proveedor.save()

    messages.warning(request, f'🗑️ {proveedor.nombreEmpresa} desactivado correctamente')
    return redirect('admin_proveedores')


@admin_required_api
@require_POST
def cambiar_estado_proveedor(request, id):
    try:
        proveedor = Proveedor.objects.get(idProveedor=id)
        data = json.loads(request.body)

        estado_input = data.get('estado', 'activo').lower()
        proveedor.estado = estado_input
        proveedor.save()

        return JsonResponse({'success': True, 'estado': proveedor.estado})
    except Proveedor.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Proveedor no encontrado'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)