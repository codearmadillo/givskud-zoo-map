const gulp      = require('gulp');
const babel     = require('gulp-babel');

var config = {
    babel: {
        presets: ["env"]
    }
}

gulp.task('default', ['js', 'watch']);
gulp.task('js', function(){
    return gulp.src('src/module.js')
            .pipe(babel(config.babel))
            .pipe(gulp.dest('dest'));
});
gulp.task('watch', function(){
    gulp.watch('src/module.js', ['js']);
});