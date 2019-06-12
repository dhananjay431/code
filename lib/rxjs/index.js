"use strict";

exports.__esModule = true;

var ajax_1 = require("rxjs/ajax");

var rxjs_1 = require("rxjs");

rxjs_1.forkJoin({
  google: ajax_1.ajax.getJSON('https://api.github.com/users/google'),
  microsoft: ajax_1.ajax.getJSON('https://api.github.com/users/microsoft'),
  users: ajax_1.ajax.getJSON('https://api.github.com/users')
}).subscribe(console.log);