'use strict';

var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    clean = require('gulp-clean'),
    minifyHTML = require('gulp-minify-html'),
    sass = require('gulp-sass'),
    minifyCss = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    spritesmith = require('gulp.spritesmith'),
    buffer = require('vinyl-buffer'),
    imagemin = require('gulp-imagemin'),
    merge = require('merge-stream');


//------ Clean ------//
gulp.task('clean', function () {
    return gulp.src(['static', 'build'], {read: false})
        .pipe(clean());
});


//------ Styles ------//
gulp.task('css', ['css:sass', 'css:normalize']);

gulp.task('css:sass', function () {
    return gulp.src('./app/sass/styles.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest('./static/css'))
        .pipe(browserSync.stream());
});

gulp.task('css:normalize', function () {
    return gulp.src('./bower/normalize-css/normalize.css')
        .pipe(minifyCss({compatibility: 'ie8'}))
        .pipe(gulp.dest('./static/css'));
});


//------ JS ------//
gulp.task('js', ['js:jquery', 'js:scripts']);

gulp.task('js:jquery', function () {
    return gulp.src('./bower/jquery/jquery.min.js')
        .pipe(gulp.dest('./static/js'));
});

gulp.task('js:scripts', function () {
    return gulp.src('./app/js/**/*.js')
        .pipe(concat('script.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./static/js'))
        .pipe(browserSync.stream());
});


//------ Images ------//
gulp.task('images', function () {
    return gulp.src('./app/img/**/*.*')
        .pipe(gulp.dest('./static/img/'))
        .pipe(browserSync.stream());
});

gulp.task('sprite', function () {
    var spriteData = gulp.src('./app/sprite/*.png').pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: 'sprite.scss',
        imgPath: '../img/sprite.png'
    }));

    var imgStream = spriteData.img
        .pipe(buffer())
        .pipe(imagemin())
        .pipe(gulp.dest('./static/img/'));

    var cssStream = spriteData.css
        .pipe(gulp.dest('./app/sass'));

    return merge(imgStream, cssStream);
});


//------ Html ------//
gulp.task('minify-html', function () {
    var opts = {
        conditionals: true,
        spare: true
    };

    return gulp.src('./app/*.html')
        .pipe(minifyHTML(opts))
        .pipe(gulp.dest('./static/'))
        .pipe(browserSync.stream());
});


//------ Server ------//
gulp.task('server', function () {
    browserSync({
        port: 9000,
        server: {
            baseDir: 'static'
        }
    });
});


//------ Watch ------//
gulp.task('watch', function () {
    gulp.watch('./app/sass/**/*.scss', ['css:sass']);
    gulp.watch('./app/**/*.html', ['minify-html']);
    gulp.watch('./app/js/**/*.js', ['js:scripts']);
    gulp.watch('./app/img/**/*.{jpg,jpeg,png,svg}', ['images']);
    gulp.watch('./app/sprite/**/*.png', ['sprite']);

    gulp.watch([
        './static/*.html',
        './static/js/**/*.js',
        './static/css/**/*.css',
        './static/img/**/*.{jpg,jpeg,png,svg}'
    ]).on('change', browserSync.reload);
});

gulp.task('build', ['clean', 'css', 'js', 'images', 'sprite', 'minify-html']);
gulp.task('default', ['clean', 'css', 'js', 'images', 'sprite', 'minify-html', 'server', 'watch']);