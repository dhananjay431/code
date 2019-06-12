"use strict";

angular.module('multipleSelect', []).component('dbmultiple', {
  transclude: true,
  template: "<div class=\"dropdown\" ng-transclude>\n  <button class=\"btn border dropdown-toggle\" \n  type=\"button\" \n  style=\"width:100%;\"\n  id=\"dropdownMenuButton\" \n  data-toggle=\"dropdown\" \n  aria-haspopup=\"true\" \n  aria-expanded=\"false\">\n  <div class=\"float-left\">\n  </div>\n    {{$ctrl.model.length > 2 ? \"more than 2\":($ctrl.model.length == 0 ? 'Select':$ctrl.model.toString())}}\n  </button>\n  <div class=\"dropdown-menu\" aria-labelledby=\"dropdownMenuButton\">\n  <span class=\"dropdown-item\" ng-repeat=\"d in $ctrl.op.op\">\n      <input type=\"checkbox\" class=\"m-2\" ng-model=\"d.value\" ng-change=\"$ctrl.change($ctrl.op)\">{{d.name}}\n    </span>\n  </div>\n</div>",
  controller: function controller() {
    this.change = function (data) {
      this.model = data.op.filter(function (d) {
        return d.value == true;
      }).map(function (d) {
        return d.name;
      });
    };
  },
  bindings: {
    op: '<',
    model: '='
  }
});