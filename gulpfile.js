var gulp = require('gulp');
var spawn = require('child_process').spawn;
var node;

gulp.task('default', ['server'], function() {
  gulp.watch(['./app.js','./public/**/*.js'], ['server']);
});

gulp.task('server', function() {
  if (node) node.kill();
  node = spawn('node', ['app.js'], { stdio: 'inherit' });
  node.on('close', function(code) {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });
})

process.on('exit', function() {
  if (node) node.kill();
});
