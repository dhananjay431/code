const { src, dest, parallel , watch, series } = require('gulp');
// const babel = require('gulp-babel');
var prettify = require('gulp-html-prettify');
var removeHtmlComments = require('gulp-remove-html-comments');
var removeEmptyLines = require('gulp-remove-empty-lines');

// function tstojs(){
//     return src('./erfq/*.js')
//     .pipe(babel({
//         presets: ['@babel/env']
//     }))
//     .pipe(dest('dist'));
// }

function htmlp(){
  return src('./erfq/*/*.htm')
    .pipe(prettify({indent_char: ' ', indent_size: 2}))
    .pipe(removeHtmlComments())
    .pipe(removeEmptyLines())
    .pipe(dest('lib'))
}
exports.default = function() {
   // watch('./*.js', series(tstojs));
   
    watch('./erfq/*/*.htm', series(htmlp));
  };