from werkzeug.security import check_password_hash, generate_password_hash
from flask_login import UserMixin


class Empresa(UserMixin):
    def __init__(self, id=0, ruc='', razonSocial='', direccion='', telefono='', email='', username='', password='') -> None:
        self.id = id
        self.ruc = ruc
        self.razonSocial = razonSocial
        self.direccion = direccion
        self.telefono = telefono
        self.email = email
        self.username = username
        self.password = password

    @classmethod
    def check_password(cls, hashed_password, password):
        return check_password_hash(hashed_password, password)

    @classmethod
    def GenerarPasswordHash(cls, password):
        return generate_password_hash(password)
