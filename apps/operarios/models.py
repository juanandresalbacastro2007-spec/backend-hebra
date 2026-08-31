# apps/operarios/models.py

from django.db import models


class Usuario(models.Model):
    idUsuario = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    correoElectronico = models.CharField(max_length=200, unique=True)
    contrasena = models.CharField(max_length=255)
    telefono = models.CharField(max_length=20, null=True, blank=True)
    direccion = models.CharField(max_length=255, null=True, blank=True)
    rol = models.CharField(max_length=20, default='operario')
    estado = models.CharField(max_length=20, default='activo')
    fotoPerfil = models.ImageField(
        upload_to='perfiles/',
        null=True,
        blank=True,
        db_column='fotoPerfil'
    )

    class Meta:
        db_table = 'usuarios'
        managed = False


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
    idTarea = models.AutoField(primary_key=True)
    nombreTarea = models.CharField(max_length=150)
    descripcionTarea = models.TextField()
    fechaCreacion = models.DateField()
    proceso = models.CharField(max_length=100)
    complejidad = models.CharField(max_length=10, default='media')

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
    prioridad = models.CharField(max_length=10, default='Media')
    horasEstimadas = models.DecimalField(max_digits=5, decimal_places=2)
    tipoPrenda = models.CharField(max_length=50, null=True, blank=True)
    cantidadPrendas = models.IntegerField(null=True, blank=True)
    horasReales = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = 'asignacion_tareas'
        managed = False


class Incidencia(models.Model):
    idIncidencia = models.AutoField(primary_key=True)

    # ✅ la columna en MySQL se llama 'idUsuario', no 'idOperario'
    idUsuario = models.ForeignKey(
        Operario,
        on_delete=models.CASCADE,
        db_column='idUsuario'
    )

    tipoIncidencia = models.CharField(max_length=50)
    descripcion = models.TextField()
    estado = models.CharField(max_length=30, default='Generado')
    fechaGeneracion = models.DateField()
    fechaRevision = models.DateField(null=True, blank=True)

    # ✅ NUEVO: respuesta del administrador visible para el operario
    respuesta = models.TextField(null=True, blank=True)
    # ✅ NUEVO: se pone en False cuando el admin responde; el operario la
    # "lee" al abrir el detalle, lo que la vuelve a poner en True.
    respuestaLeida = models.BooleanField(default=True)

    class Meta:
        db_table = 'incidencias'
        managed = False

    def __str__(self):
        return f'Incidencia #{self.idIncidencia} — {self.tipoIncidencia}'