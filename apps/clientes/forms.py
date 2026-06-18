from django import forms
from .models import Orden, Producto


class OrdenForm(forms.Form):
    producto = forms.ModelChoiceField(
        queryset=Producto.objects.filter(),
        label='Producto',
        empty_label='-- Selecciona un producto --'
    )
    cantidad = forms.IntegerField(
        label='Cantidad',
        min_value=1
    )
    fechaEntregaEstimada = forms.DateField(
        label='Fecha de entrega estimada',
        widget=forms.DateInput(attrs={'type': 'date'})
    )
    instrucciones = forms.CharField(
        label='Instrucciones especiales',
        widget=forms.Textarea(attrs={'rows': 4}),
        required=False
    )
    prioridad = forms.ChoiceField(
        label='Prioridad',
        choices=[('Normal', 'Normal'), ('Urgente', 'Urgente')]
    )