from database.DOPayfilt import DOPayfilt
from models.TipoAccion import TipoAccion
from models.Empresa import Empresa
from models.Dataset import Dataset


class BOPayfilt:

    @classmethod
    def login(cls, empresa):
        try:
            row = DOPayfilt.ObtenerEmpresaPorUsername(empresa)
            if row != None:
                empresa = Empresa(id=row[0], ruc=row[1], razonSocial=row[2], direccion=row[3], email=row[4],
                                  username=row[5], password=Empresa.check_password(row[6], empresa.password))
                return empresa
            else:
                return None
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def ObtenerEmpresaPorId(cls, id):
        try:
            row = DOPayfilt.ObtenerEmpresaPorId(id)
            if row != None:
                empresa = Empresa(id=row[0], ruc=row[1], razonSocial=row[2],
                                  direccion=row[3], telefono=row[4], email=row[5], username=row[6])
                return empresa
            else:
                return None
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def ObtenerIdEmpresaPorUsername(cls, username):
        try:
            idEmpresa = DOPayfilt.ObtenerIdEmpresaPorUsername(username)
            if idEmpresa != None:
                return idEmpresa
            else:
                return None
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def ObtenerListadoTipoAccion(cls):
        try:
            lstTipoAcciones = []

            for tipoAccion in DOPayfilt.ObtenerListadoTipoAccion():
                tipoAccionModel = TipoAccion(
                    tipoAccion[0], tipoAccion[1], tipoAccion[2])
                lstTipoAcciones.append(tipoAccionModel.to_json())

            return lstTipoAcciones

        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def ValidarExistenciaRUC(cls, ruc):
        try:
            return DOPayfilt.ValidarExistenciaRUC(ruc)
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def ValidarExistenciaEmail(cls, email):
        try:
            return DOPayfilt.ValidarExistenciaEmail(email)
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def ValidarExistenciaPassword(cls, passwordHash):
        try:
            return DOPayfilt.ValidarExistenciaPassword(passwordHash)
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def ValidarExistenciaDataset(cls, filename, idEmpresa):
        try:
            return DOPayfilt.ValidarExistenciaDataset(filename, idEmpresa)
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def RegistrarEmpresa(cls, _razonSocial, _ruc, _email, _telefono, _direccion, username, password):
        try:
            return DOPayfilt.RegistrarEmpresa(_razonSocial, _ruc, _email, _telefono, _direccion, username, password)
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def ActualizarEmpresaPorId(cls, id, _razonSocial, _ruc, _email, _telefono, _direccion):
        try:
            return DOPayfilt.ActualizarEmpresaPorId(id, _razonSocial, _ruc, _email, _telefono, _direccion)
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def RegistrarDataset(cls, nombreDataset, idEmpresa, accuracy, precision, recall, f1_score, mse, mae, rmse):
        try:
            return DOPayfilt.RegistrarDataset(nombreDataset, idEmpresa, accuracy, precision, recall, f1_score, mse, mae, rmse)
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def RegistrarOperacionDataset(cls, id_empresa, ip_address, email_address, billing_state, billing_postal, billing_address, user_agent, phone_number, event_timestamp):
        try:
            return DOPayfilt.RegistrarOperacionDataset(id_empresa, ip_address, email_address, billing_state,
                                                       billing_postal, billing_address, user_agent, phone_number, event_timestamp)
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def BulkRegistrarOperacionDataset(cls, my_df):
        try:
            return DOPayfilt.BulkRegistrarOperacionDataset(my_df)
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def ObtenerListadoOperacionDataset(cls):
        try:
            return DOPayfilt.ObtenerListadoOperacionDataset()
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def ObtenerDatasetActivo(cls, idEmpresa):
        try:
            rowDataset = DOPayfilt.ObtenerDatasetActivo(idEmpresa)
            if (rowDataset != None):
                dataset = Dataset(
                    rowDataset[0], rowDataset[1], rowDataset[2], rowDataset[3], rowDataset[4], rowDataset[5], rowDataset[6], rowDataset[7], rowDataset[8], rowDataset[9], rowDataset[10])
                return dataset
            else:
                return None
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def ObtenerListadoDataset(cls, idEmpresa):
        try:
            lstDatasets = []
            rowDatasets = DOPayfilt.ObtenerListadoDataset(idEmpresa)
            for item in rowDatasets:
                lstDatasets.append(Dataset(item[0], item[1], item[2], item[3]))
            return lstDatasets
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def DesactivarDatasets(cls, idDataset):
        try:
            return DOPayfilt.DesactivarDatasets(idDataset)
        except Exception as ex:
            raise Exception(ex)

    @classmethod
    def ActivarDatasetPorId(cls, idDataset):
        try:
            return DOPayfilt.ActivarDatasetPorId(idDataset)
        except Exception as ex:
            raise Exception(ex)
