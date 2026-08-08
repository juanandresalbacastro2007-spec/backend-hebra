from django import forms
from .models import Proveedor

class ProveedorForm(forms.ModelForm):
    class Meta:
        model = Proveedor
        fields = ['nombreEmpresa', 'nit', 'nombreContacto', 'telefono', 'correo', 'direccion', 'estado']
        widgets = {
            'nombreEmpresa': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Nombre de Empresa'}),
            'nit': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'NIT'}),
            'nombreContacto': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Nombre Contacto'}),
            'telefono': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Teléfono'}),
            'correo': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Correo'}),
            'direccion': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Dirección'}),
            'estado': forms.Select(attrs={'class': 'form-select'}),
        }

    # 👇 Agregas esta función dentro de ProveedorForm 👇
    def clean_nombreEmpresa(self):
        nombre = self.cleaned_data.get('nombreEmpresa')
        
        if nombre:
            nombre_limpio = nombre.strip()
            
            # Buscamos si ya existe en la BD (sin importar mayúsculas/minúsculas)
            query = Proveedor.objects.filter(nombreEmpresa__iexact=nombre_limpio)
            
            # Si estamos editando un proveedor existente, excluimos su propio ID
            if self.instance and self.instance.pk:
                query = query.exclude(pk=self.instance.pk)
                
            if query.exists():
                raise forms.ValidationError('Ya existe un proveedor registrado con este nombre de empresa.')
                
        return nombre