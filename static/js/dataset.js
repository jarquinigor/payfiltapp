$(document).ready(function () {
  var idDataset = $("#idDataset").text();

  initializeTblDataset(idDataset);

  $("#upload").click(function () {
    var fileInput = document.getElementById("dataset");
    if (fileInput.files[0] != null) {
      var filename = fileInput.files[0].name;
      if (
        $("#dataset").val() != "" &&
        filename.length - 4 >= 8 &&
        filename.length - 4 <= 50
      ) {
        showMessage(
          "",
          "¿Desea cargar el dataset adjunto?",
          "dark",
          "Ok",
          function () {
            var dataset = $("#dataset").get(0).files[0];
            var formData = new FormData();
            formData.append("dataset", dataset);
            $.ajax({
              type: "POST",
              url: "/uploader",
              data: formData,
              contentType: false,
              processData: false,
              success: function (data) {
                console.log(data.color);
                if (data.color != "red") {
                  $("#select-dataset").empty().append(data.htmlresponse);
                }

                $("#dataset").val("");
                showMessageSingle(
                  "",
                  data.mensaje, //MODIFICAR
                  data.color,
                  "Ok",
                  function () {}
                );
              },
              error: function () {
                showMessageSingle(
                  "",
                  "Error interno al intentar cargar el dataset.",
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
        $("#dataset").val("");
        showMessageSingle(
          "",
          "El nombre del archivo .csv adjunto debe de tener entre 8 y 50 caracteres",
          "red",
          "Ok",
          function () {}
        );
      }
    } else {
      showMessageSingle(
        "",
        "Debe de adjuntar un archivo .csv",
        "red",
        "Ok",
        function () {}
      );
    }
  });

  $("#activar").click(function () {
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

function initializeTblDataset(idDataset) {
  metrics_data_table = $("#tbl_dataset").DataTable({
    language: {
      url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json",
      infoFiltered: "",
    },
    dom: "Bfrtip",
    buttons: [
      "csv",
      {
        extend: "excel",
        // exportOptions: {
        //   columns: ":visible",
        // },
        action: newexportaction,
      },
      {
        extend: "pdfHtml5",
        orientation: "landscape",
        pageSize: "LEGAL",
      },
      "print",
      {
        extend: "pageLength",
        className: "pageLengthButton",
      },
    ],
    responsive: true,
    ajax: "/api/data?idDataset=" + idDataset,
    serverSide: true,
    columns: [
      //{ data: "id_operacion" },
      {
        data: "transaction_time",
        render: DataTable.render.datetime("YYYY-MM-DD HH:mm:ss"),
      },
      { data: "credit_card_number" },
      { data: "zip" },
      { data: "merchant" },
      { data: "category" },
      { data: "amount" },
      { data: "first" },
      { data: "last" },
      { data: "state" },
      { data: "is_fraud" },
      { data: "prediction" },
      { data: "city" },
      { data: "street" },
      { data: "lat" },
      { data: "long" },
      { data: "job" },
      { data: "dob", render: DataTable.render.datetime("YYYY-MM-DD") },
      { data: "transaction_id" },
      { data: "merch_lat" },
      { data: "merch_long" },
    ],
  });
}

function newexportaction(e, dt, button, config) {
  var self = this;
  var oldStart = dt.settings()[0]._iDisplayStart;
  dt.one("preXhr", function (e, s, data) {
    // Just this once, load all data from the server...
    data.start = 0;
    data.length = 2147483647;
    dt.one("preDraw", function (e, settings) {
      // Call the original action function
      if (button[0].className.indexOf("buttons-copy") >= 0) {
        $.fn.dataTable.ext.buttons.copyHtml5.action.call(
          self,
          e,
          dt,
          button,
          config
        );
      } else if (button[0].className.indexOf("buttons-excel") >= 0) {
        $.fn.dataTable.ext.buttons.excelHtml5.available(dt, config)
          ? $.fn.dataTable.ext.buttons.excelHtml5.action.call(
              self,
              e,
              dt,
              button,
              config
            )
          : $.fn.dataTable.ext.buttons.excelFlash.action.call(
              self,
              e,
              dt,
              button,
              config
            );
      } else if (button[0].className.indexOf("buttons-csv") >= 0) {
        $.fn.dataTable.ext.buttons.csvHtml5.available(dt, config)
          ? $.fn.dataTable.ext.buttons.csvHtml5.action.call(
              self,
              e,
              dt,
              button,
              config
            )
          : $.fn.dataTable.ext.buttons.csvFlash.action.call(
              self,
              e,
              dt,
              button,
              config
            );
      } else if (button[0].className.indexOf("buttons-pdf") >= 0) {
        $.fn.dataTable.ext.buttons.pdfHtml5.available(dt, config)
          ? $.fn.dataTable.ext.buttons.pdfHtml5.action.call(
              self,
              e,
              dt,
              button,
              config
            )
          : $.fn.dataTable.ext.buttons.pdfFlash.action.call(
              self,
              e,
              dt,
              button,
              config
            );
      } else if (button[0].className.indexOf("buttons-print") >= 0) {
        $.fn.dataTable.ext.buttons.print.action(e, dt, button, config);
      }
      dt.one("preXhr", function (e, s, data) {
        // DataTables thinks the first item displayed is index 0, but we're not drawing that.
        // Set the property to what it was before exporting.
        settings._iDisplayStart = oldStart;
        data.start = oldStart;
      });
      // Reload the grid with the original page. Otherwise, API functions like table.cell(this) don't work properly.
      setTimeout(dt.ajax.reload, 0);
      // Prevent rendering of the full data to the DOM
      return false;
    });
  });
  // Requery the server with the new one-time export settings
  dt.ajax.reload();
}
