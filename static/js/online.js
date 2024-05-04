// Configure Pusher instance
const pusher = new Pusher("10d6e46a85e23fbc14de", {
  cluster: "us2",
  encrypted: true,
});

$(document).ready(function () {
  //initializeTblDataset();
  dataTable = $("#tbl_online").DataTable({
    columnDefs: [
      {
        defaultContent: "-",
        targets: "_all",
      },
    ],
    order: [[1, "desc"]],
    language: {
      url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json",
      infoFiltered: "",
    },
    dom: "Bfrtip",
    buttons: [
      "csv",
      {
        extend: "excel",
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
    ajax: "/api/onlineData",
    serverSide: true,
    columns: [
      {
        data: "fecha_carga",
        render: DataTable.render.datetime("YYYY-MM-DD HH:mm:ss"),
      },
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
      { data: "city" },
      { data: "prediction" },
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

  var customerChannel = pusher.subscribe("onlineDetection");
  customerChannel.bind("add", function (data) {
    dataTable.row
      .add([
        data.fecha_carga,
        data.transaction_time,
        data.credit_card_number,
        data.zip,
        data.merchant,
        data.category,
        data.amount,
        data.first,
        data.last,
        data.state,
        data.city,
        data.prediction,
        data.street,
        data.lat,
        data.long,
        data.job,
        data.dob,
        data.transaction_id,
        data.merch_lat,
        data.merch_long,
      ])
      .draw(false);
  });
});

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
