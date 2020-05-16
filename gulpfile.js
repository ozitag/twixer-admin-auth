'use strict';
require('dotenv').config();

const gulp = require('gulp');
const sass = require('gulp-sass');
const htmlmin = require('gulp-htmlmin');
const rename = require('gulp-rename')
const watch = require('gulp-watch');
const babel = require('gulp-babel');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const handlebars = require('gulp-compile-handlebars');

sass.compiler = require('node-sass');

gulp.task('sass', () => {
    return gulp.src('./src/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(rename('app.css'))
        .pipe(cleanCSS({compatibility: 'ie9'}))
        .pipe(gulp.dest('./build'));
});

gulp.task('html', function () {
    const templateData = {
        title: process.env.PAGE_TITLE || 'OZiTAG',
        base_path: process.env.BASE_PATH || '',
        is_logo_png: process.env.IS_LOGO_PNG || false,
    };

    return gulp.src('src/index.hbs')
        .pipe(handlebars(templateData))
        .pipe(rename('index-' + process.env.PAGE_TITLE + '.html'))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('build'));
});

gulp.task('scripts', () => {
    return gulp.src('src/js/app.js').pipe(babel({
        presets: ['@babel/env']
    })).pipe(rename('app.js')).pipe(uglify()).pipe(gulp.dest('build'))
});

gulp.task('watch', () => {
    watch('src/*.hbs', gulp.series('html'));
    watch('src/sass/**/*.scss', gulp.series('sass'));
    watch('src/js/**/*.js', gulp.series('scripts'));
});

gulp.task('favicon', () => {
    return gulp.src('./assets/favicon/*').pipe(gulp.dest('./build/favicon'));
});

gulp.task('logo', () => {
    return gulp.src('./assets/logo.png').pipe(gulp.dest('./build'));
});

gulp.task('build', gulp.parallel('favicon', 'logo', 'html', 'sass', 'scripts'));
gulp.task('dev', gulp.parallel('build', 'watch'));
gulp.task('default', gulp.parallel('build'));