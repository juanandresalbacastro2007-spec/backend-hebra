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