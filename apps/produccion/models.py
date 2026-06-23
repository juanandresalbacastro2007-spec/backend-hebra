from django.db import models


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


class Produccion(models.Model):
    ESTADO_CHOICES = [
        ('Pendiente',   'Pendiente'),
        ('En Progreso', 'En Progreso'),
        ('Completado',  'Completado'),
        ('Detenido',    'Detenido'),
    ]

    idProduccion       = models.AutoField(primary_key=True)
    idOrden            = models.IntegerField(null=True, blank=True,
                             db_column='idOrden')
    idProducto         = models.ForeignKey(
                             Producto,
                             on_delete=models.CASCADE,
                             db_column='idProducto'
                         )
    descripcion        = models.CharField(max_length=255)
    cantidadRequerida  = models.IntegerField()
    fechaInicio        = models.DateField()
    fechaEstimadaFin   = models.DateField()
    fechaRealFin       = models.DateField(null=True, blank=True)
    costoEstimado      = models.DecimalField(max_digits=12, decimal_places=2,
                             null=True, blank=True)
    costoReal          = models.DecimalField(max_digits=12, decimal_places=2,
                             null=True, blank=True)
    estado             = models.CharField(max_length=20,
                             choices=ESTADO_CHOICES, default='Pendiente')

    class Meta:
        db_table = 'produccion'
        managed  = False