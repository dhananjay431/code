"use strict";

var InExRender = function () {
  function InExRender() {}

  var _proto = InExRender.prototype;

  _proto.init = function init(params) {
    this.eGui = document.createElement('span');
    this.eGui.innerHTML = JSON.stringify(params);
  };

  _proto.getGui = function getGui() {
    return this.eGui;
  };

  return InExRender;
}();