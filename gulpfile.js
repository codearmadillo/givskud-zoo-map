const gulp      = require('gulp');
const babel     = require('gulp-babel');
const gutil     = require('gulp-util');
const uglify    = require('gulp-uglify');

var config = {
    babel: {
        presets: ["env"]
    }
}

gulp.task('default', ['js', 'watch']);
gulp.task('js', function(){
    return gulp.src('src/module.js')
            .pipe(babel(config.babel))
            .pipe(gutil.env.type !== 'production' ? gutil.noop() : uglify())
            .pipe(gutil.env.type !== 'production' ? gulp.dest('dest') : gulp.dest('prod'));
});
gulp.task('watch', function(){
    gulp.watch('src/module.js', ['js']);
});