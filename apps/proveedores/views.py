from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .models import Proveedor
from .forms import ProveedorForm
from django.contrib import messages
from django.utils import timezone
import json

@require_POST
def cambiar_estado_proveedor(request, id):
    try:
        import json
        proveedor = Proveedor.objects.get(idProveedor=id)
        data = json.loads(request.body)
        proveedor.estado = data.get('estado', 'ACTIVO')
        proveedor.save()
        return JsonResponse({'success': True, 'estado': proveedor.estado})
    except Proveedor.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Proveedor no encontrado'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

def listar_proveedores(request):
    proveedores = Proveedor.objects.all().order_by('-fechaRegistro')
    form = ProveedorForm()
    return render(request, 'administrador/proveedores.html', {
        'proveedores': proveedores, 
        'form': form
    })

def crear_proveedor(request):
    if request.method == 'POST':
        form = ProveedorForm(request.POST)
        if form.is_valid():
            nuevo_proveedor = form.save(commit=False)
            nuevo_proveedor.idUsuario_id = 1 
            nuevo_proveedor.save()
            messages.success(request, '✅ Proveedor creado exitosamente')
            return redirect('proveedores')
    
    form = ProveedorForm()
    return render(request, 'administrador/proveedores.html', {
        'form': form,
        'proveedores': Proveedor.objects.all().order_by('-fechaRegistro')
    })

def editar_proveedor(request, id):
    proveedor = get_object_or_404(Proveedor, idProveedor=id)
    
    if request.method == 'POST':
        form = ProveedorForm(request.POST, instance=proveedor)
        if form.is_valid():
            form.save()
            messages.success(request, f'✏️ {proveedor.nombreEmpresa} actualizado correctamente')
            return redirect('proveedores')
    else:
        form = ProveedorForm(instance=proveedor)
    
    proveedores = Proveedor.objects.all().order_by('-fechaRegistro')
    return render(request, 'administrador/proveedores.html', {
        'form': form,
        'proveedores': proveedores
    })

def eliminar_proveedor(request, id):
    proveedor = get_object_or_404(Proveedor, idProveedor=id)
    proveedor.estado = 'INACTIVO'
    proveedor.save()
    messages.warning(request, f'🗑️ {proveedor.nombreEmpresa} desactivado correctamente')
    return redirect('proveedores')