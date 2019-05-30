"use strict";

var CellRender = function () {
  function CellRender() {}

  var _proto = CellRender.prototype;

  _proto.init = function init(params) {
    this.eGui = document.createElement('span');
    var getData = params.params2.filter(function (d) {
      return d.key == params.value;
    });
    if (getData.length > 0) this.eGui.innerHTML = getData[0].value;else this.eGui.innerHTML = "-";
  };

  _proto.getGui = function getGui() {
    return this.eGui;
  };

  return CellRender;
}();

var CellText = function () {
  function CellText() {}

  var _proto2 = CellText.prototype;

  _proto2.init = function init() {
    this.html = document.createElement('input');
    this.html.value = params.value;
  };

  _proto2.getGui = function getGui() {
    return this.html;
  };

  _proto2.afterGuiAttached = function afterGuiAttached() {
    this.html.focus();
    this.html.select();
  };

  _proto2.getValue = function getValue() {
    return this.html.value;
  };

  _proto2.destroy = function destroy() {};

  _proto2.isPopup = function isPopup() {
    return false;
  };

  return CellText;
}();

var CellSelect = function () {
  function CellSelect() {
    this.selected();
  }

  var _proto3 = CellSelect.prototype;

  _proto3.init = function init(params) {
    this.div = document.createElement('div');
    this.div.style.width = '100%';
    this.div.style.height = '100%';
    this.gui = document.createElement('select');
    this.gui.style.width = '100%';
    this.gui.style.height = '100%';

    for (var i = 0; i < params.values.length; i++) {
      var op = document.createElement('option');
      op.text = params.values[i].text;
      op.value = params.values[i].value;
      this.gui.add(op);
    }

    this.div.appendChild(this.gui);
    var that = this;
    this.gui.addEventListener('change', function (event) {
      params.value = params.values[event.target.selectedIndex].value;

      if (params.value != undefined) {
        that.selected(params.value);
      }
    });
  };

  _proto3.selected = function selected(value) {
    this.seledtedValue = value;
  };

  _proto3.getGui = function getGui() {
    return this.div;
  };

  _proto3.getValue = function getValue() {
    return this.seledtedValue;
  };

  _proto3.afterGuiAttached = function afterGuiAttached() {
    this.div.focus();
  };

  return CellSelect;
}();

var CellSelectCb = function () {
  function CellSelectCb() {}

  var _proto4 = CellSelectCb.prototype;

  _proto4.init = function init(cb) {
    cb();
  };

  _proto4.selected = function selected(value) {
    this.seledtedValue = value;
  };

  _proto4.getGui = function getGui() {
    return this.div;
  };

  _proto4.getValue = function getValue() {
    return this.gui.options[e.selectedIndex].value;
  };

  _proto4.afterGuiAttached = function afterGuiAttached() {
    this.gui.focus();
  };

  return CellSelectCb;
}();