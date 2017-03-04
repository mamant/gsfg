const gulp = require('gulp');
const data = require('gulp-data');
const rename = require("gulp-rename");
const fs = require('fs');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const postcss = require('gulp-postcss');
const cssnano = require('gulp-cssnano');
const sorting = require('postcss-sorting');
const cssnext = require("postcss-cssnext");
const precss = require('precss');

const settings = {
  projectName: 'getstarred',
  cssDestPath: './dest/css',
  jsDestPath: './dest/js'
  };

gulp.task('css', function() {
    return gulp.src('src/css/main.css')
      .pipe(postcss([
        precss(),
        cssnext(),
        sorting(),
      ]))
      .pipe( cssnano() )
      .pipe(concat(settings.projectName + '.css'))
      .pipe(rename({ suffix: '.min' }))
      .pipe(gulp.dest(settings.cssDestPath))
});

gulp.task('js', function() {
    return gulp.src('src/js/main.js')
      .pipe(concat(settings.projectName + '.js'))
      .pipe(rename({ suffix: '.min' }))
      .pipe(gulp.dest(settings.jsDestPath))
});

gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: './dest/'
        },
    })
});

gulp.task('dev', ['browserSync', 'css', 'js'], function() {
    gulp.watch('./src/css/*', ['css', browserSync.reload]);
    gulp.watch('./src/js/*', ['js', browserSync.reload]);
    gulp.watch('./dest/*.html', browserSync.reload);
});
