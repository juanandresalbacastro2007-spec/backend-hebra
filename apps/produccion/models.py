from django.db import models


class Prenda(models.Model):
    CATEGORIA_CHOICES = [
        ('Camisa',    'Camisa'),
        ('Pantalón',  'Pantalón'),
        ('Uniforme',  'Uniforme'),
        ('Chaqueta',  'Chaqueta'),
        ('Accesorio', 'Accesorio'),
    ]
    ESTADO_CHOICES = [
        ('Activo',        'Activo'),
        ('En pausa',      'En pausa'),
        ('Descontinuado', 'Descontinuado'),
    ]

    idPrenda      = models.AutoField(primary_key=True)
    nombre        = models.CharField(max_length=150)
    codigo        = models.CharField(max_length=30, unique=True)
    categoria     = models.CharField(max_length=20, choices=CATEGORIA_CHOICES)
    tallas        = models.CharField(max_length=100, default='Única')
    tiempoMinutos = models.IntegerField(default=30)
    stockObjetivo = models.IntegerField(default=100)
    descripcion   = models.TextField(null=True, blank=True)
    estado        = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='Activo')

    class Meta:
        db_table = 'prendas'
        managed = False


class OrdenProduccion(models.Model):
    ESTADO_CHOICES = [
        ('Pendiente',  'Pendiente'),
        ('En Proceso', 'En Proceso'),
        ('Completado', 'Completado'),
        ('Pausado',    'Pausado'),
    ]
    PRIORIDAD_CHOICES = [
        ('Normal',  'Normal'),
        ('Alta',    'Alta'),
        ('Urgente', 'Urgente'),
    ]

    idOrdenProduccion = models.AutoField(primary_key=True)
    numero            = models.CharField(max_length=20, unique=True)
    idPrenda          = models.ForeignKey(
                            Prenda, on_delete=models.CASCADE, db_column='idPrenda_id'
                        )
    cliente           = models.CharField(max_length=150, default='Sin cliente')
    cantidad          = models.IntegerField()
    producidas        = models.IntegerField(default=0)
    operario          = models.CharField(max_length=150, default='Sin asignar')
    lineaProduccion   = models.CharField(max_length=50, null=True, blank=True)
    fechaEntrega      = models.DateField()
    prioridad         = models.CharField(max_length=10, choices=PRIORIDAD_CHOICES, default='Normal')
    estado            = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='Pendiente')
    observaciones     = models.TextField(null=True, blank=True)
    fechaCreacion     = models.DateField(auto_now_add=True)

    class Meta:
        db_table = 'ordenes_produccion'
        managed = False