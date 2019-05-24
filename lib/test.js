"use strict";

var _test = _interopRequireDefault(require("./test2"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

var a = [12, 31, 23, 123, 123, 123, 312, 3123, 1, 233, 123, 123, 2134, 124, 324, 5, 346, 46, 46].map(function (d) {
  return d * d;
});
console.log(a);
console.log("imp=>", _test["default"]);
var b = ["123", "asdfasfd"];
var c = [1, 2, 3].concat(b, [1, 2, 32, 3, 123, 123, 231]);

var _x$y$a$b = {
  x: 1,
  y: 2,
  a: 3,
  b: 4
},
    x = _x$y$a$b.x,
    y = _x$y$a$b.y,
    z = _objectWithoutProperties(_x$y$a$b, ["x", "y"]);

console.log(x);
console.log(y);
console.log(z);

var n = _objectSpread({
  x: x,
  y: y
}, z);

console.log(n);
console.log(obj);

function demo(part1) {
  for (var _len = arguments.length, part2 = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    part2[_key - 1] = arguments[_key];
  }

  return {
    part1: part1,
    part2: part2
  };
}

console.log(demo(1, 2, 3, 4, 5, 6));