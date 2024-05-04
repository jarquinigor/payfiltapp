class TipoAccion:
    def __init__(self, id, descripcion, codigo) -> None:
        self.id = id
        self.descripcion = descripcion
        self.codigo = codigo

    def to_json(self):
        return {
            'id': self.id,
            'descripcion': self.descripcion,
            'codigo': self.codigo
        }
