import random
import string

from flask import render_template, redirect, url_for
from flask_mail import Mail, Message
from datetime import datetime


class RecursoPayfilt:

    @classmethod
    def GenerarPassword(cls):
        # choose from all lowercase letter
        letters = string.ascii_lowercase
        result_str = ''.join(random.choice(letters) for i in range(12))
        return result_str

    @classmethod
    def GenerarUsername(cls, _razonSocial, _ruc):
        _razonSocial = _razonSocial[0:12]
        _ruc = _ruc[0:4]
        aleatorio = random.randint(1000, 9999)
        nombreUsuario = _razonSocial.replace(" ", "") + _ruc + str(aleatorio)
        return nombreUsuario

    @classmethod
    def EnviarCorreo(cls, app, _email, msg_title, msg_body):
        msg_title = msg_title
        # "noreply@app.com"
        sender = "noreply@payfiltapp.com"
        msg = Message(msg_title, sender=sender, recipients=[_email])
        data = {
            'app_name': "PayFilt",
            'title': msg_title,
            'body': msg_body,
        }
        msg.html = render_template("email.html", data=data)
        try:
            mail = Mail(app)
            mail.send(msg)
            return redirect(url_for('login'))
        except Exception as e:
            print(e)
            return redirect(url_for('signup'))
