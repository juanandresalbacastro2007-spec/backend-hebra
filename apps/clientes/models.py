from django.db import models


class Usuario(models.Model):
    idUsuario = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    correoElectronico = models.CharField(max_length=200, unique=True)
    contrasena = models.CharField(max_length=255)
    telefono = models.CharField(max_length=20, null=True, blank=True)
    direccion = models.CharField(max_length=255, null=True, blank=True)
    rol = models.CharField(max_length=20, default='cliente')
    estado = models.CharField(max_length=20, default='activo')

    class Meta:
        db_table = 'usuarios'
        managed = False  # Django NO toca esta tabla


class Cliente(models.Model):
    idCliente = models.AutoField(primary_key=True)
    idUsuario = models.OneToOneField(
        Usuario,
        on_delete=models.CASCADE,
        db_column='idUsuario'
    )
    tipoCliente = models.CharField(max_length=10, default='Natural')
    empresa = models.CharField(max_length=150, null=True, blank=True)
    nombre = models.CharField(max_length=150, null=True, blank=True)
    correoElectronico = models.CharField(max_length=200, null=True, blank=True)
    telefono = models.CharField(max_length=30, null=True, blank=True)
    ciudad = models.CharField(max_length=100, null=True, blank=True)
    direccion = models.CharField(max_length=255, null=True, blank=True)
    nit = models.CharField(max_length=30, null=True, blank=True)
    estado = models.CharField(max_length=20, default='activo')

    class Meta:
        db_table = 'clientes'
        managed = False


class Producto(models.Model):
    idProducto = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    categoria = models.CharField(max_length=100)

    class Meta:
        db_table = 'productos'
        managed = False


class Orden(models.Model):
    ESTADO_CHOICES = [
        ('Pendiente', 'Pendiente'),
        ('Procesando', 'Procesando'),
        ('Enviado', 'Enviado'),
        ('Entregado', 'Entregado'),
        ('Cancelado', 'Cancelado'),
    ]
    PRIORIDAD_CHOICES = [
        ('Normal', 'Normal'),
        ('Urgente', 'Urgente'),
    ]

    idOrden = models.AutoField(primary_key=True)
    idCliente = models.ForeignKey(
        Cliente,
        on_delete=models.CASCADE,
        db_column='idCliente'
    )
    fechaCreacion = models.DateField(auto_now_add=True)
    fechaEntregaEstimada = models.DateField(null=True, blank=True)
    instrucciones = models.CharField(max_length=1000)
    cantidad = models.IntegerField(null=True, blank=True)
    precioUnitario = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    prioridad = models.CharField(
        max_length=10, choices=PRIORIDAD_CHOICES, default='Normal'
    )
    estado = models.CharField(
        max_length=20, choices=ESTADO_CHOICES, default='Pendiente'
    )

    class Meta:
        db_table = 'ordenes'
        managed = False