import mysql.connector
from mysql.connector import Error
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from decouple import config


def get_conn():
    host_name = config('host_name')
    db_name = config('db_name')
    u_name = config('u_name')
    u_pass = config('u_pass')
    port_num = 3307

    my_eng = create_engine('mysql+pymysql://' + u_name +
                           ':' + u_pass + '@' + host_name + ':' + str(port_num) + '/' + db_name, echo=False, connect_args={'connect_timeout': 1000})

    conn = my_eng.connect()
    return conn


def get_connection():
    try:
        return mysql.connector.connect(
            host=config('host_name'),
            user=config('u_name'),
            password=config('u_pass'),
            database=config('db_name'),
            port=config('db_port')
        )
    except mysql.connector.errors as err:
        raise err


class DOPayfilt:

    @classmethod
    def ObtenerEmpresaPorUsername(cls, empresa):  # login
        try:
            sql = """SELECT id_empresa, ruc, razon_social, direccion, email, username, password 
                     FROM empresa 
                     WHERE username='{}'""".format(empresa.username)
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(sql)
            empresa = cursor.fetchone()
            # conn.commit()
            conn.disconnect()
            return empresa

        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def ObtenerEmpresaPorId(cls, id):
        try:
            sql = """SELECT id_empresa, ruc, razon_social, direccion, telefono, email, username 
                     FROM empresa
                     WHERE id_empresa='{}'""".format(id)
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(sql)
            empresa = cursor.fetchone()
            # conn.commit()
            conn.disconnect()
            return empresa

        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def ObtenerIdEmpresaPorUsername(cls, username):
        try:
            sql = """SELECT id_empresa
                     FROM empresa
                     WHERE username='{}'""".format(username)
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(sql)
            empresa = cursor.fetchone()
            # conn.commit()
            conn.disconnect()
            return int(empresa[0])

        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def ObtenerListadoTipoAccion(cls):
        try:
            sql = """SELECT id_tipo_accion, descripcion_tipo_accion, codigo_tipo_accion 
                     FROM tipo_accion"""
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(sql)
            lstTipoAcciones = cursor.fetchall()
            # conn.commit()
            conn.disconnect()
            return lstTipoAcciones

        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def ValidarExistenciaRUC(cls, ruc):
        try:
            sql = """SELECT id_empresa 
                     FROM empresa
                     WHERE ruc = '{}'""".format(ruc)
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(sql)
            if len(cursor.fetchall()) > 0:
                conn.disconnect()
                return True
            else:
                conn.disconnect()
                return False
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def ValidarExistenciaEmail(cls, email):
        try:
            sql = """SELECT id_empresa 
                     FROM empresa
                     WHERE email = '{}'""".format(email)
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(sql)
            if len(cursor.fetchall()) > 0:
                conn.disconnect()
                return True
            else:
                conn.disconnect()
                return False
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def ValidarExistenciaPassword(cls, passwordHash):
        try:
            sql = """SELECT id_empresa 
                     FROM empresa
                     WHERE password = '{}'""".format(passwordHash)
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(sql)
            if len(cursor.fetchall()) > 0:
                conn.disconnect()
                return True
            else:
                conn.disconnect()
                return False
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def ValidarExistenciaDataset(cls, filename, idEmpresa):
        try:
            sql = """SELECT id_dataset, nombre_dataset, estado, id_empresa 
                     FROM dataset
                     WHERE nombre_dataset = '{0}'
                     and id_empresa = '{1}'""".format(filename, idEmpresa)
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(sql)
            if len(cursor.fetchall()) > 0:
                conn.disconnect()
                return True
            else:
                conn.disconnect()
                return False
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def RegistrarEmpresa(cls, _razonSocial, _ruc, _email, _telefono, _direccion, username, password):
        try:
            sql = "INSERT INTO empresa (razon_social, ruc, email, telefono, direccion, username, password) VALUES (%s, %s, %s, %s, %s, %s, %s);"
            datos = (_razonSocial, _ruc, _email, _telefono,
                     _direccion, username, password)
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(sql, datos)
            conn.commit()
            conn.disconnect()

        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def ActualizarEmpresaPorId(cls, id, _razonSocial, _ruc, _email, _telefono, _direccion):
        try:
            sql = "UPDATE empresa set razon_social=%s, ruc=%s, email=%s, telefono=%s, direccion=%s WHERE id_empresa=%s"
            print(sql)
            datos = (_razonSocial, _ruc, _email, _telefono,
                     _direccion, id)
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(sql, datos)
            conn.commit()
            conn.disconnect()
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def RegistrarDataset(cls, nombreDataset, idEmpresa, accuracy, precision, recall, f1_score, mse, mae, rmse):
        try:
            # print(type(accuracy), type(precision),
            #       type(recall), type(f1_score))
            # print(accuracy, precision, recall, f1_score)
            print("MSE", mse)
            print("MAE", mae)
            print("RMSE", rmse)
            rounded_accuracy = float("{:.4f}".format(accuracy))
            rounded_precision = float("{:.4f}".format(precision))
            rounded_recall = float("{:.4f}".format(recall))
            rounded_f1_score = float("{:.4f}".format(f1_score))
            rounded_mse = float("{:.4f}".format(mse))
            rounded_mae = float("{:.4f}".format(mae))
            rounded_rmse = float("{:.4f}".format(rmse))

            sql = "INSERT INTO dataset (nombre_dataset, estado, id_empresa, accuracy, precisionn, recall, f1_score, mse, mae, rmse) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);"
            datos = (nombreDataset, 'I', idEmpresa,
                     rounded_accuracy, rounded_precision, rounded_recall, rounded_f1_score, rounded_mse, rounded_mae, rounded_rmse)
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(sql, datos)
            idDataset = cursor.lastrowid
            conn.commit()
            conn.disconnect()
            return idDataset

        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def RegistrarOperacionDataset(cls, id_empresa, ip_address, email_address, billing_state, billing_postal, billing_address, user_agent, phone_number, event_timestamp):
        try:
            sql = "INSERT INTO operacion (id_dataset, id_empresa, ip_address, email_address, billing_state, billing_postal, billing_address, user_agent, phone_number, event_timestamp) VALUES (NULL, %s, %s, %s, %s, %s, %s, %s, %s, %s);"

            datos = (id_empresa, ip_address, email_address, billing_state,
                     billing_postal, billing_address, user_agent, phone_number, event_timestamp)
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(sql, datos)
            conn.commit()
            conn.disconnect()

        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def BulkRegistrarOperacionDataset(cls, my_df):
        try:
            my_df.to_sql('operacion', get_conn(), index=False,
                         if_exists='append')

        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def ObtenerListadoOperacionDataset(cls):
        try:
            sql = """SELECT o.id_operacion,o.ip_address,o.email_address,o.billing_state,o.billing_postal,o.billing_address,o.user_agent,o.phone_number,o.EVENT_TIMESTAMP,o.risk_level,o.model_insightscore,o.EVENT_LABEL
                     FROM operacion o JOIN dataset d on o.id_dataset = d.id_dataset
                     WHERE d.estado = 'A';"""
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(sql)
            lstOperaciones = cursor.fetchall()
            # conn.commit()
            conn.disconnect()
            return lstOperaciones
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def ObtenerDatasetActivo(cls, idEmpresa):
        try:
            sql = """SELECT id_dataset, nombre_dataset, estado, id_empresa, accuracy, precisionn, recall, f1_score, mse, mae, rmse 
                     FROM dataset
                     WHERE id_empresa = {}
                     and estado = 'A'""".format(idEmpresa)
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(sql)
            rowDataset = cursor.fetchone()
            # conn.commit()
            conn.disconnect()
            return rowDataset
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def ObtenerListadoDataset(cls, idEmpresa):
        try:
            sql = """SELECT id_dataset, nombre_dataset, estado, id_empresa  
                     FROM dataset
                     WHERE id_empresa = {}""".format(idEmpresa)
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(sql)
            lstDatasets = cursor.fetchall()
            # conn.commit()
            conn.disconnect()
            return lstDatasets
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def DesactivarDatasets(cls, idDataset):
        try:
            sql = "UPDATE dataset set estado='I' WHERE id_dataset<>{} and estado='A'".format(
                idDataset)
            # datos = (idDataset)
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(sql)
            conn.commit()
            conn.disconnect()
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def ActivarDatasetPorId(cls, idDataset):
        try:
            sql = "UPDATE dataset set estado='A' WHERE id_dataset={}".format(
                idDataset)
            # datos = (idDataset)
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(sql)
            conn.commit()
            conn.disconnect()
        except Exception as ex:
            raise Exception(ex)
