const gulp = require('gulp');
const gulpif = require('gulp-if');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const minify = require('gulp-minify');

function isJavaScript(file) {
  // Check if file extension is '.js'
  return file.extname === '.js';
}

function defaut() {
  gulp.task('default', () =>
    gulp.src(['public/Games.js', 'public/script.js'])
      .pipe(babel({
        presets: ['@babel/preset-env'],
        plugins: ["@babel/plugin-proposal-class-properties"]
      })).pipe(gulpif(isJavaScript, uglify()))
      .pipe(gulp.dest('dist/public'))
  );
}


exports.default = defaut();
