var gulp = require('gulp');
var spawn = require('child_process').spawn; var node;
var eslint = require('gulp-eslint');
paths = {
  npm: './node_modules/*.*',
  js: './**/*.js',
  publicjs: './public/*.js',
  devjs: './dev/*.js'
}

gulp.task('wip', ['serve'], function() {
  gulp.watch([paths.js, '!'+paths.npm], { interval: 10000 }['serve']);
});

gulp.task('serve', ['lint'], function() {
  if (node) node.kill();
  node = spawn('node', ['app.js'], { stdio: 'inherit' });
  node.on('close', function(code) {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });
});

process.on('exit', function() {
  if (node) node.kill();
});

gulp.task('lint', function() {
  return gulp
    .src(paths.devjs)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(gulp.dest('./public/js/'));
});
