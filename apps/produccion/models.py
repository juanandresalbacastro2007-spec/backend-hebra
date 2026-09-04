from django.db import models
from django_fsm import FSMField, transition
from simple_history.models import HistoricalRecords


class Producto(models.Model):
    CATEGORIA_CHOICES = [
        ('Camisa',    'Camisa'),
        ('Pantalón',  'Pantalón'),
        ('Uniforme',  'Uniforme'),
        ('Chaqueta',  'Chaqueta'),
        ('Accesorio', 'Accesorio'),
    ]

    idProducto  = models.AutoField(primary_key=True)
    nombre      = models.CharField(max_length=150)
    descripcion = models.TextField()
    precio      = models.DecimalField(max_digits=10, decimal_places=2)
    categoria   = models.CharField(max_length=100, choices=CATEGORIA_CHOICES)

    class Meta:
        db_table = 'productos'
        managed  = False

    def __str__(self):
        return self.nombre


class Produccion(models.Model):
    ESTADO_CHOICES = [
        ('Pendiente',   'Pendiente'),
        ('En Progreso', 'En Progreso'),
        ('Completado',  'Completado'),
        ('Detenido',    'Detenido'),
    ]

    idProduccion      = models.AutoField(primary_key=True)
    idOrden           = models.IntegerField(null=True, blank=True, db_column='idOrden')
    idProducto        = models.ForeignKey(Producto, on_delete=models.CASCADE, db_column='idProducto')
    descripcion       = models.CharField(max_length=255)
    cantidadRequerida = models.IntegerField()
    fechaInicio       = models.DateField()
    fechaEstimadaFin  = models.DateField()
    fechaRealFin      = models.DateField(null=True, blank=True)
    estado            = FSMField(default='Pendiente', choices=ESTADO_CHOICES)

    history = HistoricalRecords()   # tabla nueva propia, no toca 'produccion'

    class Meta:
        db_table = 'produccion'
        managed  = False

    # ── Transiciones válidas ──────────────────────────
    @transition(field=estado, source='Pendiente', target='En Progreso')
    def iniciar(self):
        pass

    @transition(field=estado, source='En Progreso', target='Completado')
    def completar(self):
        pass

    @transition(field=estado, source=['Pendiente', 'En Progreso'], target='Detenido')
    def detener(self):
        pass

    @transition(field=estado, source='Detenido', target='En Progreso')
    def reanudar(self):
        pass