var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var angular;
angular.module('App.quoteComparisionCtrl')
    .controller('targetCostCtrl', function ($scope, Upload, $window, $log, $state, NgTableParams, cmm) {
    var al = /** @class */ (function () {
        function al(str) {
            this.str = str;
        }
        al.prototype.show = function () {
            console.log("this.show=>", this.str);
        };
        return al;
    }());
    var b1 = /** @class */ (function (_super) {
        __extends(b1, _super);
        function b1(str) {
            var _this = _super.call(this, str) || this;
            _this.str = str + "b1";
            return _this;
        }
        b1.prototype.dis = function () {
            console.log("show=>", this.str);
        };
        return b1;
    }(al));
});
