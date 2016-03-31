var gulp = require('gulp');
var spawn = require('child_process').spawn; var node;
var eslint = require('gulp-eslint');
paths = {
  npm: '!./node_modules/*.*',
  servejs: ['./routes/*.js', './app.js', './modules/*.js'],
  publicjs: './public/*.js',
  devjs: './dev/*.js'
}

gulp.task('wip', ['serve'], function() {
  gulp.watch(paths.servejs, {interval: 1000}, ['serve']);
  gulp.watch(paths.devjs, { interval: 1000 }, ['serve']);
});

gulp.task('serve', ['build'], function() {
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

gulp.task('build', ['client-js-lint', 'server-js-lint']);

gulp.task('client-js-lint', function() {
  return gulp
    .src(paths.devjs)
    .pipe(eslint({
      extends: 'eslint:recommended',
      globals: {
        '$': true,
        '_': true,
        'document': true
      }
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(gulp.dest('./public/js/'));
});

gulp.task('server-js-lint', function() {
  return gulp
    .src(paths.servejs)
    .pipe(eslint({
      'parserOptions': {
        'ecmaVersion': 6
      }
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
})
