import pymysql
pymysql.install_as_MySQLdb()

import django.db.backends.mysql.base
import django.db.backends.mysql.features

# 1. Saltarse el bloqueo de la versión obsoleta de MariaDB
django.db.backends.mysql.base.BaseDatabaseWrapper.check_database_version_supported = lambda self: None

# 2. Forzar los datos simulados del servidor (evita el KeyError)
django.db.backends.mysql.base.DatabaseWrapper.mysql_server_data = property(
    lambda self: {
        "version": "10.4.0-MariaDB",
        "sql_mode": "STRICT_TRANS_TABLES",
        "sql_auto_is_null": False,
        "lower_case_table_names": 0,
    }
)

# 3. ¡BLOQUEAR EL RETURNING NATIVO! (Evita el error 1064 de sintaxis)
django.db.backends.mysql.features.DatabaseFeatures.can_return_rows_from_bulk_insert = property(lambda self: False)
django.db.backends.mysql.features.DatabaseFeatures.can_return_id_from_insert = property(lambda self: False)
django.db.backends.mysql.features.DatabaseFeatures.has_select_for_update_skip_locked = property(lambda self: False)