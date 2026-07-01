# apps/administrador/models.py

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


class Operario(models.Model):
    idOperario = models.AutoField(primary_key=True)
    idUsuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        db_column='idUsuario'
    )
    especialidad = models.CharField(max_length=100)
    fechaIngreso = models.DateField()
    estado = models.CharField(max_length=20, default='activo')

    class Meta:
        db_table = 'operarios'
        managed = False

    def __str__(self):
        return f'{self.idUsuario.nombre} — {self.especialidad}'


class Tarea(models.Model):
    COMPLEJIDAD_CHOICES = [
        ('baja', 'Baja'),
        ('media', 'Media'),
        ('alta', 'Alta'),
    ]

    idTarea = models.AutoField(primary_key=True)
    nombreTarea = models.CharField(max_length=150)
    descripcionTarea = models.TextField()
    fechaCreacion = models.DateField(auto_now_add=True)
    proceso = models.CharField(max_length=100)
    complejidad = models.CharField(max_length=10, choices=COMPLEJIDAD_CHOICES, default='media')

    class Meta:
        db_table = 'tareas'
        managed = False

    def __str__(self):
        return self.nombreTarea


class AsignacionTarea(models.Model):
    ESTADO_CHOICES = [
        ('Pendiente', 'Pendiente'),
        ('En Progreso', 'En Progreso'),
        ('Completada', 'Completada'),
        ('Cancelada', 'Cancelada'),
    ]
    PRIORIDAD_CHOICES = [
        ('Baja', 'Baja'),
        ('Media', 'Media'),
        ('Alta', 'Alta'),
        ('Urgente', 'Urgente'),
    ]

    idAsignacion = models.AutoField(primary_key=True)
    idTarea = models.ForeignKey(
        Tarea,
        on_delete=models.CASCADE,
        db_column='idTarea'
    )
    idOperario = models.ForeignKey(
        Operario,
        on_delete=models.CASCADE,
        db_column='idOperario'
    )
    descripcion = models.TextField()
    fechaAsignacion = models.DateField(auto_now_add=True)
    fechaInicio = models.DateField()
    fechaFinalizacion = models.DateField(null=True, blank=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='Pendiente')
    prioridad = models.CharField(max_length=10, choices=PRIORIDAD_CHOICES, default='Media')
    horasEstimadas = models.DecimalField(max_digits=5, decimal_places=2)
    horasReales = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = 'asignacion_tareas'
        managed = False

    def __str__(self):
        return f'Asignación #{self.idAsignacion}'


class Orden(models.Model):
    idOrden = models.AutoField(primary_key=True)
    idCliente = models.ForeignKey(
        'Cliente',
        on_delete=models.CASCADE,
        db_column='idCliente'
    )
    fechaCreacion = models.DateField(auto_now_add=True)
    fechaEntregaEstimada = models.DateField(null=True, blank=True)
    instrucciones = models.CharField(max_length=1000)
    cantidad = models.IntegerField(null=True, blank=True)
    precioUnitario = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    prioridad = models.CharField(max_length=10, default='Normal')
    estado = models.CharField(max_length=20, default='Pendiente')

    class Meta:
        db_table = 'ordenes'
        managed = False


class Cliente(models.Model):
    idCliente = models.AutoField(primary_key=True)
    idUsuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        db_column='idUsuario'
    )
    empresa = models.CharField(max_length=150, null=True, blank=True)
    nombre = models.CharField(max_length=150, null=True, blank=True)
    estado = models.CharField(max_length=20, default='activo')

    class Meta:
        db_table = 'clientes'
        managed = False

    def __str__(self):
        return self.empresa or self.nombre or f'Cliente #{self.idCliente}'


class Incidencia(models.Model):
    ESTADO_CHOICES = [
        ('Generado', 'Generado'),
        ('Revisado', 'Revisado'),
        ('Pendiente', 'Pendiente'),
    ]

    idIncidencia = models.AutoField(primary_key=True)
    idOperario = models.ForeignKey(
        Operario,
        on_delete=models.CASCADE,
        db_column='idUsuario'   # 👈 la columna real en MySQL es idUsuario, no idOperario
    )
    tipoIncidencia = models.CharField(max_length=50)
    descripcion = models.TextField()
    estado = models.CharField(max_length=30, choices=ESTADO_CHOICES, default='Generado')
    fechaGeneracion = models.DateField(auto_now_add=True)
    fechaRevision = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'incidencias'
        managed = False

    def __str__(self):
        return f'Incidencia #{self.idIncidencia} — {self.tipoIncidencia}'