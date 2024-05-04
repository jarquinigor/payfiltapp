class Dataset:
    def __init__(self, idDataset, nombreDataset, estado, idEmpresa, accuracy=0.0, precision=0.0, recall=0.0, f1_score=0.0, mse=0.0, mae=0.0, rmse=0.0) -> None:
        self.idDataset = idDataset
        self.nombreDataset = nombreDataset
        self.estado = estado
        self.idEmpresa = idEmpresa
        self.accuracy = accuracy
        self.precision = precision
        self.recall = recall
        self.f1_score = f1_score
        self.mse = mse
        self.mae = mae
        self.rmse = rmse
