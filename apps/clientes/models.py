# clientes/models.py

from django.db import models


class Usuario(models.Model):
    ROL_CHOICES = [
        ('administrador', 'Administrador'),
        ('operario', 'Operario'),
        ('cliente', 'Cliente'),
    ]
    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
        ('reportado', 'Reportado'),
    ]

    idUsuario = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    correoElectronico = models.CharField(max_length=200, unique=True)
    contrasena = models.CharField(max_length=255)
    telefono = models.CharField(max_length=20, null=True, blank=True)
    direccion = models.CharField(max_length=255, null=True, blank=True)
    rol = models.CharField(max_length=20, choices=ROL_CHOICES, default='cliente')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='activo')

    class Meta:
        db_table = 'usuarios'
        managed = False

    def __str__(self):
        return f'{self.nombre} {self.apellido}'


class Cliente(models.Model):
    TIPO_CHOICES = [
        ('Natural', 'Natural'),
        ('Empresa', 'Empresa'),
    ]
    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
        ('bloqueado', 'Bloqueado'),
    ]

    idCliente = models.AutoField(primary_key=True)
    idUsuario = models.OneToOneField(
        Usuario,
        on_delete=models.CASCADE,
        db_column='idUsuario'
    )
    tipoCliente = models.CharField(max_length=10, choices=TIPO_CHOICES, default='Natural')
    empresa = models.CharField(max_length=150, null=True, blank=True)
    nombre = models.CharField(max_length=150, null=True, blank=True)
    correoElectronico = models.CharField(max_length=200, null=True, blank=True)
    telefono = models.CharField(max_length=30, null=True, blank=True)
    ciudad = models.CharField(max_length=100, null=True, blank=True)
    direccion = models.CharField(max_length=255, null=True, blank=True)
    nit = models.CharField(max_length=30, null=True, blank=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='activo')

    class Meta:
        db_table = 'clientes'
        managed = False

    def __str__(self):
        return self.empresa or self.nombre or f'Cliente #{self.idCliente}'


class Producto(models.Model):
    idProducto = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    categoria = models.CharField(max_length=100)

    class Meta:
        db_table = 'productos'
        managed = False

    def __str__(self):
        return self.nombre


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
    idProducto = models.ForeignKey(
        Producto,
        on_delete=models.SET_NULL,
        db_column='idProducto',
        null=True, blank=True
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

    def __str__(self):
        return f'Orden #{self.idOrden} - {self.estado}'


class Factura(models.Model):
    ESTADO_CHOICES = [
        ('Pendiente de pago', 'Pendiente de pago'),
        ('Pagada', 'Pagada'),
    ]

    idFactura = models.AutoField(primary_key=True)
    idOrden = models.ForeignKey(
        Orden,
        on_delete=models.CASCADE,
        db_column='idOrden'
    )
    idCliente = models.ForeignKey(
        Cliente,
        on_delete=models.CASCADE,
        db_column='idCliente'
    )
    numeroFactura = models.CharField(max_length=30, unique=True)
    fechaEmision = models.DateTimeField(auto_now_add=True)
    fechaPago = models.DateTimeField(null=True, blank=True)
    rutaPDF = models.CharField(max_length=255)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='Pendiente de pago')

    class Meta:
        db_table = 'facturas'
        managed = False

    def __str__(self):
        return f'Factura {self.numeroFactura}'


# ── NUEVO: Notificaciones del cliente ────────────────────────
class Notificacion(models.Model):
    """
    Registro de notificaciones que el cliente ve en su portal.
    Se crea automáticamente via señal Django cada vez que
    el administrador cambia el estado de una orden.

    La tabla se crea manualmente con el SQL adjunto
    (managed = False porque el resto del proyecto no usa migraciones).
    """
    TIPO_CHOICES = [
        ('orden',    'Cambio de estado de orden'),
        ('factura',  'Factura emitida'),
        ('sistema',  'Mensaje del sistema'),
    ]

    idNotificacion = models.AutoField(primary_key=True)
    idCliente = models.ForeignKey(
        Cliente,
        on_delete=models.CASCADE,
        db_column='idCliente',
        related_name='notificaciones'
    )
    tipo = models.CharField(max_length=50, choices=TIPO_CHOICES, default='orden')
    titulo = models.CharField(max_length=200)
    mensaje = models.TextField()
    leida = models.BooleanField(default=False)
    fechaCreacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notificaciones'
        managed = False
        ordering = ['-fechaCreacion']

    def __str__(self):
        return f'[{self.tipo}] {self.titulo} → Cliente #{self.idCliente_id}'


# ── NUEVO: Cotizaciones ───────────────────────────────────────
class Cotizacion(models.Model):
    """
    Solicitud de cotización que el cliente genera desde el portal
    (botón "Generar cotización" en Acciones rápidas).

    A diferencia de Orden, una cotización NO reserva producción:
    es solo una estimación de costo que el cliente puede solicitar
    tantas veces como quiera, y por eso NO está sujeta a la
    restricción de "una orden activa a la vez".

    La tabla se crea manualmente con el SQL adjunto
    (managed = False, igual que el resto del proyecto).

    SQL sugerido:
    CREATE TABLE cotizaciones (
        idCotizacion INT AUTO_INCREMENT PRIMARY KEY,
        idCliente INT NOT NULL,
        idProducto INT NULL,
        cantidad INT NOT NULL,
        precioUnitario DECIMAL(10,2) NOT NULL,
        subtotalEstimado DECIMAL(12,2) NOT NULL,
        notas TEXT NULL,
        estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
        fechaCreacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (idCliente) REFERENCES clientes(idCliente) ON DELETE CASCADE,
        FOREIGN KEY (idProducto) REFERENCES productos(idProducto) ON DELETE SET NULL
    );
    """
    ESTADO_CHOICES = [
        ('Pendiente', 'Pendiente'),
        ('Revisada', 'Revisada'),
        ('Aprobada', 'Aprobada'),
        ('Rechazada', 'Rechazada'),
    ]

    idCotizacion = models.AutoField(primary_key=True)
    idCliente = models.ForeignKey(
        Cliente,
        on_delete=models.CASCADE,
        db_column='idCliente',
        related_name='cotizaciones'
    )
    idProducto = models.ForeignKey(
        Producto,
        on_delete=models.SET_NULL,
        db_column='idProducto',
        null=True, blank=True
    )
    cantidad = models.IntegerField()
    precioUnitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotalEstimado = models.DecimalField(max_digits=12, decimal_places=2)
    notas = models.TextField(null=True, blank=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='Pendiente')
    fechaCreacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'cotizaciones'
        managed = False
        ordering = ['-fechaCreacion']

    def __str__(self):
        return f'Cotización #{self.idCotizacion} — Cliente #{self.idCliente_id}'