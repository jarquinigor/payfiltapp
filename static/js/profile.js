// $(document).ready(function(){
//     $('#actualizacionDatos').click(function(){
//         var id = $('#id').text();
//         var razonSocial = $('#razonSocial').text();
//         var ruc = $('#ruc').text();
//         var email = $('#email').text();
//         var telefono = $('#telefono').text();
//         var direccion = $('#direccion').text();

//         $('#idM').val(id);
//         $('#razonSocialM').val(razonSocial);
//         $('#rucM').val(ruc);
//         $('#emailM').val(email);
//         $('#telefonoM').val(telefono);
//         $('#direccionM').val(direccion);

//         $('#empModal').modal('show');

//     });
// });

function ActualizacionDatos() {
  var id = $("#id").text();
  var razonSocial = $("#razonSocial").text();
  var ruc = $("#ruc").text();
  var email = $("#email").text();
  var telefono = $("#telefono").text();
  var direccion = $("#direccion").text();

  $("#idM").val(id);
  $("#razonSocialM").val(razonSocial);
  $("#rucM").val(ruc);
  $("#emailM").val(email);
  $("#telefonoM").val(telefono);
  $("#direccionM").val(direccion);

  $("#empModal").modal("show");
}

function ActualizarDatos() {
  var id = $("#idM").val();
  var razonSocial = $("#razonSocialM").val();
  var ruc = $("#rucM").val();
  var email = $("#emailM").val();
  var telefono = $("#telefonoM").val();
  var direccion = $("#direccionM").val();

  var errores = 0;
  var contenido = "Solucione los siguientes errores:";

  if (razonSocial.length < 5 || razonSocial.length > 50) {
    errores += 1;
    contenido +=
      "<br/>- El campo Razón social debe de tener de 5 a 50 caracteres.";
  }
  if (ruc.length < 11 || ruc.length > 11) {
    errores += 1;
    contenido += "<br/>- El campo RUC debe de tener de 11 caracteres.";
  }
  if (email.length < 12 || email.length > 30) {
    errores += 1;
    contenido += "<br/>- El campo Email debe de tener de 12 a 30 caracteres.";
  }
  if (
    telefono.length < 9 ||
    telefono.length > 9 ||
    validarTelefono(telefono) != true
  ) {
    errores += 1;
    contenido +=
      "<br/>- El campo Teléfono debe de tener de 9 caracteres numéricos.";
  }
  if (direccion.length < 15 || direccion.length > 60) {
    errores += 1;
    contenido +=
      "<br/>- El campo Dirección debe de tener de 15 a 60 caracteres.";
  }

  var empresa = {
    id: id,
    razonSocial: razonSocial,
    ruc: ruc,
    telefono: telefono,
    direccion: direccion,
    email: email,
  };

  if (errores == 0) {
    $.ajax({
      url: "/ajaxfile",
      type: "post",
      data: empresa,
      success: function (data) {
        //console.log(data)
        $("#empModal").modal("hide");
        $("#datosEmpresa").empty().append(data.htmlresponse);
        showMessageSingle(
          "",
          "Se actualizaron los datos de usuario satisfactoriamente.", //MODIFICAR
          "green",
          "Ok",
          function () {}
        );
      },
    });
  } else {
    showMessageSingle(
      "",
      contenido, //MODIFICAR
      "red",
      "Ok",
      function () {}
    );
  }
}

function validarTelefono(telefono) {
  var re = /^(0|[1-9][0-9]{0,8})$/;

  return re.test(telefono);
}
