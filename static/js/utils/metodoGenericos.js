function showMessage(
  title,
  content,
  type,
  textBtntryAgain,
  callbackTryAgain,
  callbackClose,
  textClose
) {
  $.confirm({
    title: title,
    content: content,
    type: type,
    typeAnimated: true,
    theme: "dark",
    buttons: {
      tryAgain: {
        text: textBtntryAgain,
        btnClass: "btn-" + type,
        action: function () {
          callbackTryAgain();
        },
      },
      close: {
        text: textClose == null || textClose == "" ? "CERRAR" : textClose,
        action: function () {
          callbackClose();
        },
      },
    },
  });
}

function showMessageSingle(
  title,
  content,
  type,
  textBtntryAgain,
  callbackTryAgain
) {
  $.confirm({
    title: title,
    content: content,
    type: type,
    typeAnimated: true,
    theme: "dark",
    buttons: {
      tryAgain: {
        text: textBtntryAgain,
        btnClass: "btn-" + type,
        action: function () {
          callbackTryAgain();
        },
      },
    },
  });
}
