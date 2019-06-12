"use strict";
exports.__esModule = true;
var ajax_1 = require("rxjs/ajax");
var rxjs_1 = require("rxjs");
/*
  when all observables complete, provide the last
  emitted value from each as dictionary
*/
rxjs_1.forkJoin(
// as of RxJS 6.5+ we can use a dictionary of sources
{
    google: ajax_1.ajax.getJSON('https://api.github.com/users/google'),
    microsoft: ajax_1.ajax.getJSON('https://api.github.com/users/microsoft'),
    users: ajax_1.ajax.getJSON('https://api.github.com/users')
})
    // { google: object, microsoft: object, users: array }
    .subscribe(console.log);
