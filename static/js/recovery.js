$(document).ready(function () {
  $("#find").click(function () {
    if ($("#select-dataset").find(":selected").val() != "0") {
      showMessage(
        "",
        "¿Desea activar el dataset seleccionado?",
        "dark",
        "Ok",
        function () {
          var idDataset = $("#select-dataset").val();
          var formData = new FormData();
          formData.append("idDataset", idDataset);
          $.ajax({
            type: "POST",
            url: "/datasets/activacion",
            data: formData,
            contentType: false,
            processData: false,
            success: function (data) {
              $("#select-dataset").empty().append(data.htmlresponse);
              $("#tbl_dataset").DataTable().clear().destroy();
              initializeTblDataset(idDataset);

              $("#dataset").val("");
              showMessageSingle(
                "",
                "Dataset activado satisfactoriamente.",
                "green",
                "Ok",
                function () {}
              );
            },
            error: function () {
              showMessageSingle(
                "",
                "Error interno al intentar activar el dataset.",
                "red",
                "Ok",
                function () {}
              );
            },
          });
        },
        function () {
          //history.back();
        },
        "NO"
      );
    } else {
      showMessageSingle(
        "",
        "No hay datasets cargados actualmente.",
        "red",
        "Ok",
        function () {}
      );
    }
  });
});
