from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_mail import Mail, Message
from flask_login import LoginManager, login_user, logout_user, login_required, current_user, UserMixin
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import aliased
from sqlalchemy import literal_column
from pusher import Pusher
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import mean_squared_error
from sklearn.metrics import mean_absolute_error
from sklearn.metrics import roc_auc_score
from sklearn.metrics import accuracy_score
from sklearn.metrics import confusion_matrix
from sklearn.metrics import classification_report

import jwt
import pickle

from config import configuration

from services.BOPayfilt import BOPayfilt
from models.Empresa import Empresa
from utils.RecursoPayfilt import RecursoPayfilt
from utils.Security import Security
from utils.errors.CustomException import CustomException

from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, BooleanField, TextAreaField
from wtforms.validators import DataRequired, Length, Email, EqualTo, ValidationError

import pandas as pd
import numpy as np
import datetime

from pathlib import Path
from decouple import config

HERE = Path(__file__).parent

app = Flask(__name__)

# configure pusher object
pusher = Pusher(
    app_id=config('app_id'),
    key=config('key'),
    secret=config('secret'),
    cluster='us2',
    ssl=True)

login_manager_app = LoginManager(app)

app.config['SQLALCHEMY_DATABASE_URI'] = config('SQLALCHEMY_DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


app.config['SECRET_KEY'] = 'payfiltapp12345'


# EMAIL CONFIG
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = config('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = config('MAIL_PASSWORD')
mail = Mail(app)

# SQLAlchemy
db = SQLAlchemy(app)


# Modelos
class empresa(db.Model, UserMixin):
    __tablename__ = "empresa"
    id_empresa = db.Column(db.Integer, primary_key=True)
    ruc = db.Column(db.String(11))
    razon_social = db.Column(db.String(50))
    direccion = db.Column(db.String(60))
    telefono = db.Column(db.String(9))
    email = db.Column(db.String(30))
    username = db.Column(db.String(40))
    password = db.Column(db.String(102))

    def get_reset_token(self, expires_sec=600):
        reset_token = jwt.encode(
            {
                "user_id": self.id_empresa,
                "exp": datetime.datetime.now(tz=datetime.timezone.utc)
                + datetime.timedelta(seconds=expires_sec)
            },
            app.config['SECRET_KEY'],
            algorithm="HS256"
        )
        return reset_token

    @staticmethod
    def verify_reset_token(token):
        data = jwt.decode(
            token,
            app.config['SECRET_KEY'],
            leeway=datetime.timedelta(seconds=10),
            algorithms=["HS256"]
        )
        try:
            user_id = data.get('user_id')
        except:
            return None
        return empresa.query.get(user_id)


class dataset(db.Model):
    __tablename__ = "dataset"
    id_dataset = db.Column(db.Integer, primary_key=True)
    nombre_dataset = db.Column(db.String(54))
    estado = db.Column(db.String(3))
    id_empresa = db.Column(db.Integer, db.ForeignKey(
        'empresa.id_empresa'), nullable=False)
    accuracy = db.Column(db.Float)
    precisionn = db.Column(db.Float)
    recall = db.Column(db.Float)
    f1_score = db.Column(db.Float)
    mse = db.Column(db.Float)
    mae = db.Column(db.Float)
    rmse = db.Column(db.Float)


class operacion(db.Model):
    id_operacion = db.Column(db.Integer, primary_key=True)
    id_dataset = db.Column(
        db.Integer, db.ForeignKey('dataset.id_dataset'), nullable=True)
    id_empresa = db.Column(
        db.Integer, db.ForeignKey('empresa.id_empresa'), nullable=True)
    fecha_carga = db.Column(db.DateTime)
    transaction_time = db.Column(db.DateTime)
    credit_card_number = db.Column(db.String(20))
    merchant = db.Column(db.String(50))
    category = db.Column(db.String(30))
    amount = db.Column(db.Float)
    first = db.Column(db.String(25))
    last = db.Column(db.String(25))
    street = db.Column(db.String(50))
    city = db.Column(db.String(50))
    state = db.Column(db.String(5))
    zip = db.Column(db.String(11))
    lat = db.Column(db.Float)
    long = db.Column(db.Float)
    job = db.Column(db.String(50))
    dob = db.Column(db.DateTime)
    transaction_id = db.Column(db.String(42))
    merch_lat = db.Column(db.Float)
    merch_long = db.Column(db.Float)
    is_fraud = db.Column(db.String(1))
    prediction = db.Column(db.String(1))

    def to_dict(self):
        return {
            'id_operacion': self.id_operacion,
            'id_dataset': self.id_dataset,
            'id_empresa': self.id_empresa,
            'fecha_carga': self.fecha_carga,
            'transaction_time': self.transaction_time,
            'credit_card_number': self.credit_card_number,
            'merchant': self.merchant,
            'category': self.category,
            'amount': self.amount,
            'first': self.first,
            'last': self.last,
            'street': self.street,
            'city': self.city,
            'state': self.state,
            'zip': self.zip,
            'lat': self.lat,
            'long': self.long,
            'job': self.job,
            'dob': self.dob,
            'transaction_id': self.transaction_id,
            'merch_lat': self.merch_lat,
            'merch_long': self.merch_long,
            'is_fraud': self.is_fraud,
            'prediction': self.prediction,
        }


with app.app_context():
    db.create_all()


# Modelo de Random Forest
with open(HERE / 'encoder.pkl', 'rb') as file:
    encoder = pickle.load(file)
with open(HERE / 'classifier.pkl', 'rb') as file:
    rf = pickle.load(file)


# Forms
class RequestResetForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()], render_kw={
                        "placeholder": "Email"})
    submit = SubmitField(
        'Solicitar restablecimiento')

    def validate_email(self, email):
        user = empresa.query.filter_by(email=email.data).first()
        if user is None:
            raise ValidationError(
                'No existe una cuenta con ese email. Debes registrarte primero.')


class ResetPasswordForm(FlaskForm):
    submit = SubmitField('Restablecer credenciales')


# Servicios Web
@app.route('/obtenerToken', methods=['POST'])
def obtenerToken():
    username = request.json['username']
    password = request.json['password']
    idEmpresa = BOPayfilt.ObtenerIdEmpresaPorUsername(username)
    empresa = Empresa(idEmpresa, '', '', '', '', '',
                      username, password)
    authenticated_user = BOPayfilt.login(empresa)
    if (authenticated_user.password):
        encoded_token = Security.generate_token(authenticated_user)
        return jsonify({'success': True, 'token': encoded_token})
    else:
        response = jsonify({'message': 'Unauthorized'})
        return response, 401


@app.route('/onlineDetection', methods=['POST'])
def get_languages():
    has_access = Security.verify_token(request.headers)

    if has_access[0]:
        try:
            data = request.get_json()
            op = operacion()
            op.id_empresa = has_access[1]
            op.fecha_carga = datetime.datetime.now()
            op.transaction_time = data["transaction_time"]
            op.credit_card_number = data["credit_card_number"]
            op.merchant = data["merchant"]
            op.category = data["category"]
            op.amount = data["amount"]
            op.first = data["first"]
            op.last = data["last"]
            op.street = data["street"]
            op.city = data["city"]
            op.state = data["state"]
            op.zip = data["zip"]
            op.lat = data["lat"]
            op.long = data["long"]
            op.job = data["job"]
            op.dob = data["dob"]
            op.transaction_id = data["transaction_id"]
            op.merch_lat = data["merch_lat"]
            op.merch_long = data["merch_long"]
            op.is_fraud = data["is_fraud"]

            date_format = '%Y-%m-%d %H:%M:%S'
            date_obj = datetime.datetime.strptime(
                op.transaction_time, date_format)

            # Prediccion
            encoded = encoder.transform([[op.category, op.merchant, op.job]])
            prediction = rf.predict(
                [[date_obj.hour, encoded[0][0], op.amount, encoded[0][1], encoded[0][2]]])

            op.prediction = prediction[0]

            # Commit
            db.session.add(op)
            db.session.commit()

            pusher.trigger(u'onlineDetection', u'add', {
                u'id_operacion': op.id_operacion,
                u'fecha_carga': str(op.fecha_carga),
                u'transaction_time': data["transaction_time"],
                u'credit_card_number': data["credit_card_number"],
                u'merchant': data["merchant"],
                u'category': data["category"],
                u'amount': data["amount"],
                u'first': data["first"],
                u'last': data["last"],
                u'street': data["street"],
                u'city': data["city"],
                u'state': data["state"],
                u'zip': data["zip"],
                u'lat': data["lat"],
                u'long': data["long"],
                u'job': data["job"],
                u'dob': data["dob"],
                u'transaction_id': data["transaction_id"],
                u'merch_lat': data["merch_lat"],
                u'merch_long': data["merch_long"],
                u'is_fraud': data["is_fraud"],
                u'prediction': data["prediction"],
            })

            tipoAcciones = BOPayfilt.ObtenerListadoTipoAccion()

            if (len(tipoAcciones) > 0):
                return jsonify({'languages': tipoAcciones, 'message': "SUCCESS", 'success': True})
            else:
                return jsonify({'message': "NOTFOUND", 'success': True})
        except CustomException:
            return jsonify({'message': "ERROR", 'success': False})
    else:
        response = jsonify({'message': 'Unauthorized'})
        return response, 401


# Rutas
@login_manager_app.user_loader
def load_user(id):
    return BOPayfilt.ObtenerEmpresaPorId(id)


@app.route('/')
def index():
    return redirect(url_for('login'))


@app.route("/login", methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('home'))
    if request.method == 'POST':
        empresa = Empresa(0, '', '', '', '', '',
                          request.form['username'], request.form['password'])
        loggedEmpresa = BOPayfilt.login(empresa)
        if loggedEmpresa != None:
            if loggedEmpresa.password:
                login_user(loggedEmpresa)
                return redirect(url_for('home'))
            else:
                flash("Contraseña incorrecta...")
                return render_template('auth/login.html')
        else:
            flash("Usuario no encontrado...")
            return render_template('auth/login.html')
    else:
        return render_template('auth/login.html')


@app.route("/logout")
def logout():
    logout_user()
    return redirect(url_for('login'))


@app.route('/signup')
def signup():
    return render_template('auth/signup.html')


@app.route('/recovery')
def recovery():
    return render_template('auth/recovery.html')


def send_reset_email(user):
    token = user.get_reset_token()
    msg_body = f'''To reset your password, visit the following link:
{url_for('reset_token',token=token, _external=True)}
<br>If you did not make this request then simply ignore this email and no change'''
    RecursoPayfilt.EnviarCorreo(
        app, user.email, "Recuperación de cuenta PayFilt", msg_body)


@app.route('/reset_password', methods=['GET', 'POST'])
def reset_request():
    if current_user.is_authenticated:
        return redirect(url_for('home'))
    form = RequestResetForm()
    if form.validate_on_submit():
        user = empresa.query.filter_by(email=form.email.data).first()
        send_reset_email(user)
        flash('Un correo electrónico ha sido enviado con las instrucciones para restablecer sus credenciales de acceso.', 'info')
        return redirect(url_for('login'))
    return render_template('auth/reset_request.html', title='Reset Password', form=form)


@app.route('/reset_password/<token>', methods=['GET', 'POST'])
def reset_token(token):
    if current_user.is_authenticated:
        return redirect(url_for('home'))
    user = empresa.verify_reset_token(token)
    if user is None:
        flash('Este es un token inválido o ya expirado', 'warning')
        return redirect(url_for('reset_request'))

    form = ResetPasswordForm()
    if form.validate_on_submit():
        username = RecursoPayfilt.GenerarUsername(user.razon_social, user.ruc)
        password = RecursoPayfilt.GenerarPassword()
        passwordHash = Empresa.GenerarPasswordHash(password)
        user.username = username
        user.password = passwordHash
        db.session.commit()

        msg_body = f"Bienvenido a PayFilt<br/><br/>Su nombre de usuario es: {username}<br/>Su contraseña es: {password}"
        RecursoPayfilt.EnviarCorreo(
            app, user.email, "Credenciales restablecidas PayFilt", msg_body)

        flash('¡Su nombre de usuario y contraseña han sido actualizados y reenviados a su correo electrónico! Ahora puedes iniciar sesión.')
        return redirect(url_for('login'))
    return render_template('auth/reset_token.html', title='Reset Password', form=form)


@app.route('/home')
def home():
    if current_user.is_authenticated == False:
        return redirect(url_for('login'))
    else:
        lstTipoAcciones = BOPayfilt.ObtenerListadoTipoAccion()
        return render_template('home.html', lstTipoAcciones=lstTipoAcciones)


@app.route('/profile')
def profile():
    if current_user.is_authenticated == False:
        return redirect(url_for('login'))
    else:
        empresa = BOPayfilt.ObtenerEmpresaPorId(current_user.id)
        return render_template('profile.html', empresa=empresa)


@app.route("/ajaxfile", methods=["POST", "GET"])
def ajaxfile():
    if request.method == 'POST':
        BOPayfilt.ActualizarEmpresaPorId(request.form['id'], request.form['razonSocial'], request.form['ruc'],
                                         request.form['email'], request.form['telefono'], request.form['direccion'])
        empresa = BOPayfilt.ObtenerEmpresaPorId(current_user.id)
        return jsonify({'htmlresponse': render_template('response/profileResponse.html', empresa=empresa)})
    else:
        return redirect(url_for('profile'))


@app.route('/online')
def online():
    if current_user.is_authenticated == False:
        return redirect(url_for('login'))
    else:
        lstTipoAcciones = BOPayfilt.ObtenerListadoTipoAccion()
        return render_template('online.html', lstTipoAcciones=lstTipoAcciones)


@app.route('/datasets')
def datasets():
    if current_user.is_authenticated == False:
        return redirect(url_for('login'))
    else:
        idEmpresa = current_user.id
        datasetActivo = BOPayfilt.ObtenerDatasetActivo(idEmpresa)
        lstDatasets = BOPayfilt.ObtenerListadoDataset(idEmpresa)
        return render_template('dataset.html', idEmpresa=idEmpresa, datasetActivo=datasetActivo, lstDatasets=lstDatasets)


@app.route('/datasets/activacion', methods=["POST"])
def activacionDatasets():
    if current_user.is_authenticated == False:
        return redirect(url_for('login'))
    else:
        # Obtenemos el idDataset
        idDataset = int(request.form['idDataset'])
        # Actualizamos el estado de dicho dataset
        BOPayfilt.DesactivarDatasets(idDataset)
        BOPayfilt.ActivarDatasetPorId(idDataset)
        # Lógica para mostrar combobox actualizado
        idEmpresa = current_user.id
        # datasetActivo = BOPayfilt.ObtenerDatasetActivo(idEmpresa)
        lstDatasets = BOPayfilt.ObtenerListadoDataset(idEmpresa)
        # retornar sección de combobox dataset cargados para ser activado con el select en aquel activado por id de arriba
        return jsonify({'htmlresponse': render_template('response/datasetComboBoxResponse.html', lstDatasets=lstDatasets)})


@app.route('/api/data')
def data():
    idDataset = request.args.get('idDataset')
    if idDataset == '':
        idDataset = 0

    o = aliased(operacion)
    d = aliased(dataset)

    query = db.session.query(o).join(
        d, o.id_dataset == d.id_dataset).filter(o.id_dataset == idDataset).filter(d.estado == 'A')

    # search filter
    search = request.args.get('search[value]')

    if search:
        query = query.filter(db.or_(
            o.transaction_time.like(f'{search}%'),
            o.credit_card_number.like(f'{search}%'),
            o.merchant.like(f'{search}%'),
            o.category.like(f'{search}%'),
            o.amount.like(f'{search}%'),
            o.first.like(f'{search}%'),
            o.last.like(f'{search}%'),
            o.street.like(f'{search}%'),
            o.city.like(f'{search}%'),
            o.state.like(f'{search}%'),
            o.zip.like(f'{search}%'),
            # o.lat.like(f'%{search}%'),
            # o.long.like(f'%{search}%'),
            o.job.like(f'{search}%'),
            o.dob.like(f'{search}%'),
            o.transaction_id.like(f'{search}%'),
            # o.merch_lat.like(f'%{search}%'),
            # o.merch_long.like(f'%{search}%'),
            # o.is_fraud.like(f'%{search}%'),
            # o.prediction.like(f'%{search}%'),
        ))

    total_filtered = query.count()

    # sorting
    order = []
    i = 0
    while True:
        col_index = request.args.get(f'order[{i}][column]')
        if col_index is None:
            break
        col_name = request.args.get(f'columns[{col_index}][data]')
        if col_name not in ['id_operacion', 'transaction_time', 'credit_card_number', 'merchant', 'category', 'amount', 'first', 'last', 'street', 'city', 'state', 'zip', 'lat', 'long', 'job', 'dob', 'transaction_id', 'merch_lat', 'merch_long', 'is_fraud', 'prediction']:
            col_name = 'id_operacion'
        descending = request.args.get(f'order[{i}][dir]') == 'desc'
        col = getattr(o, col_name)
        if descending:
            col = col.desc()
        order.append(col)
        i += 1
    if order:
        query = query.order_by(*order)

    # pagination
    start = request.args.get('start', type=int)
    length = request.args.get('length', type=int)
    query = query.offset(start).limit(length)

    # response
    return {
        'data': [o.to_dict() for o in query],
        'recordsFiltered': total_filtered,
        'recordsTotal': o.query.count(),
        'draw': request.args.get('draw', type=int),
    }


@app.route('/api/onlineData')
def onlineData():
    o = aliased(operacion)
    e = aliased(empresa)

    query = db.session.query(o).join(
        e, o.id_empresa == e.id_empresa).filter(o.id_dataset == None)

    # search filter
    search = request.args.get('search[value]')

    if search:
        query = query.filter(db.or_(
            o.fecha_carga.like(f'%{search}%'),
            o.transaction_time.like(f'%{search}%'),
            o.credit_card_number.like(f'%{search}%'),
            o.merchant.like(f'%{search}%'),
            o.category.like(f'%{search}%'),
            o.amount.like(f'%{search}%'),
            o.first.like(f'%{search}%'),
            o.last.like(f'%{search}%'),
            o.street.like(f'%{search}%'),
            o.city.like(f'%{search}%'),
            o.state.like(f'%{search}%'),
            o.zip.like(f'%{search}%'),
            # o.lat.like(f'%{search}%'),
            # o.long.like(f'%{search}%'),
            o.job.like(f'%{search}%'),
            o.dob.like(f'%{search}%'),
            o.transaction_id.like(f'%{search}%'),
            # o.merch_lat.like(f'%{search}%'),
            # o.merch_long.like(f'%{search}%'),
            # o.is_fraud.like(f'%{search}%'),
            # o.prediction.like(f'%{search}%'),
        ))

    total_filtered = query.count()

    # sorting
    order = []
    i = 0
    while True:
        col_index = request.args.get(f'order[{i}][column]')
        if col_index is None:
            break
        col_name = request.args.get(f'columns[{col_index}][data]')
        if col_name not in ['id_operacion', 'fecha_carga', 'transaction_time', 'credit_card_number', 'merchant', 'category', 'amount', 'first', 'last', 'street', 'city', 'state', 'zip', 'lat', 'long', 'job', 'dob', 'transaction_id', 'merch_lat', 'merch_long', 'is_fraud', 'prediction']:
            col_name = 'id_operacion'
        descending = request.args.get(f'order[{i}][dir]') == 'desc'
        col = getattr(o, col_name)
        if descending:
            col = col.desc()
        order.append(col)
        i += 1
    if order:
        query = query.order_by(*order)

    # pagination
    start = request.args.get('start', type=int)
    length = request.args.get('length', type=int)
    query = query.offset(start).limit(length)

    # response
    return {
        'data': [o.to_dict() for o in query],
        'recordsFiltered': total_filtered,
        'recordsTotal': o.query.count(),
        'draw': request.args.get('draw', type=int),
    }


@app.route('/datasets/analysis')
def datasetsAnalysis():
    if current_user.is_authenticated == False:
        return redirect(url_for('login'))
    else:
        dataset = BOPayfilt.ObtenerDatasetActivo(current_user.id)
        return render_template('analysis.html', dataset=dataset)


@app.route('/online/analysis')
def onlineAnalysis():
    if current_user.is_authenticated == False:
        return redirect(url_for('login'))
    else:
        dataset = BOPayfilt.ObtenerDatasetActivo(current_user.id)
        return render_template('analysis.html', dataset=dataset)


@app.route("/register", methods=["POST"])
def register():
    _razonSocial = request.form['razonSocial']
    _ruc = request.form['ruc']
    _email = request.form['email']
    _telefono = request.form['telefono']
    _direccion = request.form['direccion']

    # Validacion de Email
    flgEmail = BOPayfilt.ValidarExistenciaEmail(_email)
    if flgEmail == True:
        flash("El email ingresado ya se encuentra registrado...")
    flgRUC = BOPayfilt.ValidarExistenciaRUC(_ruc)
    if flgRUC == True:
        flash("El RUC ingresado ya se encuentra registrado...")

    if flgEmail != True and flgRUC != True:
        # Generar Nombre Usuario
        username = RecursoPayfilt.GenerarUsername(_razonSocial, _ruc)
        # Generamos el password
        password = RecursoPayfilt.GenerarPassword()
        # Obtenemos su hash
        passwordHash = Empresa.GenerarPasswordHash(password)
        # Registramos a la empresa en la BD
        BOPayfilt.RegistrarEmpresa(
            _razonSocial, _ruc, _email, _telefono, _direccion, username, passwordHash)
        # Enviamos correo
        msg_body = f"Bienvenido a PayFilt<br/><br/>Su nombre de usuario es: {username}<br/>Su contraseña es: {password}"
        return RecursoPayfilt.EnviarCorreo(app, _email, "Bienvenido a PayFilt", msg_body)
    else:
        # mostramos signup.html con flashes
        return render_template('auth/signup.html')


def validarCabeceras(df_headers):
    df_cabeceras = ['transaction_time', 'credit_card_number', 'merchant', 'category', 'amount', 'first', 'last', 'street',
                    'city', 'state', 'zip', 'lat', 'long', 'job', 'dob', 'transaction_id', 'merch_lat', 'merch_long', 'is_fraud']
    num_cabeceras = 0
    for cabecera in df_cabeceras:
        if cabecera in df_headers:
            num_cabeceras += 1
    return num_cabeceras


# Dataset uploader
@app.route('/uploader', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        f = request.files['dataset'].filename
        # Validar que filename no exista en datasets
        if f.endswith('.csv'):
            flg = BOPayfilt.ValidarExistenciaDataset(f, current_user.id)
            if flg != True:
                # Alteramos DataFrame y registramos operaciones en tabla Operaciones
                df = pd.read_csv(request.files['dataset'])
                df_headers = list(df.columns.values)
                df_len = len(df)
                # Validación estructural de dataset
                if len(df_headers) == 19 and validarCabeceras(df_headers) == 19:
                    if df_len >= 200 and df_len <= 20000:
                        # Tratamiento dataset
                        df["transaction_time"] = pd.to_datetime(
                            df["transaction_time"], infer_datetime_format=True)
                        df["dob"] = pd.to_datetime(
                            df["dob"], infer_datetime_format=True)
                        df.credit_card_number = df.credit_card_number.astype(
                            'category')
                        df.is_fraud = df.is_fraud.astype('category')
                        df['hour_of_day'] = df.transaction_time.dt.hour
                        # newdf features
                        features = ['transaction_id', 'hour_of_day',
                                    'category', 'amount', 'merchant', 'job']
                        newdf = df[features].set_index("transaction_id")
                        newdf.loc[:, ['category', 'merchant', 'job']] = encoder.transform(
                            newdf[['category', 'merchant', 'job']])
                        df.drop('hour_of_day', axis=1, inplace=True)
                        df['prediction'] = rf.predict(newdf)
                        # Registramos el dataset como 'I', inactivo
                        report = classification_report(
                            df['is_fraud'], df['prediction'], output_dict=True)
                        macro_precision = report['macro avg']['precision']
                        macro_recall = report['macro avg']['recall']
                        macro_f1 = report['macro avg']['f1-score']
                        accuracy = report['accuracy']
                        mse = mean_squared_error(
                            df['is_fraud'], df['prediction'])
                        mae = mean_absolute_error(
                            df['is_fraud'], df['prediction'])
                        rmse = mean_squared_error(
                            df['is_fraud'], df['prediction'], squared=False)

                        idDataset = BOPayfilt.RegistrarDataset(
                            f, current_user.id, accuracy, macro_precision, macro_recall, macro_f1, mse, mae, rmse)
                        lstDatasets = BOPayfilt.ObtenerListadoDataset(
                            current_user.id)
                        df.insert(0, 'id_dataset', idDataset)
                        # Registramos operaciones al dataset
                        BOPayfilt.BulkRegistrarOperacionDataset(df)
                        return jsonify({'htmlresponse': render_template('response/datasetComboBoxResponse.html', lstDatasets=lstDatasets), 'mensaje': 'Dataset cargado satisfactoriamente.', 'color': 'green'})
                    else:
                        return jsonify({'htmlresponse': render_template('response/datasetComboBoxResponse.html'), 'mensaje': 'El dataset cargado debe de tener entre 200 y 20000 registros', 'color': 'red'})
                else:
                    return jsonify({'htmlresponse': render_template('response/datasetComboBoxResponse.html'), 'mensaje': 'El dataset no cuenta con el modelo de datos adecuado para ser cargado', 'color': 'red'})
            else:
                return jsonify({'htmlresponse': render_template('response/datasetComboBoxResponse.html'), 'mensaje': 'El nombre del dataset cargado ya existe', 'color': 'red'})
        else:
            return jsonify({'htmlresponse': render_template('response/datasetComboBoxResponse.html'), 'mensaje': 'Solo se pueden cargar datasets en formato .csv', 'color': 'red'})


@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    return response


if __name__ == '__main__':
    app.config.from_object(configuration['development'])
    app.run()
