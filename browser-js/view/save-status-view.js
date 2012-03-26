var $span;
var currentText = "Up to date";

function init(preventReset) {
  $span = $('#save-status');
  if (preventReset) {
    $span.text(currentText);
  } else {
    set("Up to date");
  }
}

function saving() {
  set("Saving...");
}

function saved() {
  var now = new Date();

  set("Last saved " + now.toLocaleTimeString());
}

function set(text) {
  currentText = text;
  $span.text(text);
}

module.exports = {
  init: init,
  saving: saving,
  saved: saved
};

init();