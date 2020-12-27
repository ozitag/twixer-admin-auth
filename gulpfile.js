"use strict";
require("dotenv").config();

const fs = require("fs");
const gulp = require("gulp");
const sass = require("gulp-sass");
const htmlmin = require("gulp-htmlmin");
const rename = require("gulp-rename");
const watch = require("gulp-watch");
const babel = require("gulp-babel");
const cleanCSS = require("gulp-clean-css");
const uglify = require("gulp-uglify");
const handlebars = require("gulp-compile-handlebars");
const replace = require('gulp-replace');

sass.compiler = require("node-sass");

gulp.task("sass", () => {
    return gulp
        .src("./src/sass/**/*.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(rename("app.css"))
        .pipe(cleanCSS({compatibility: "ie9"}))
        .pipe(gulp.dest("./build"));
});

gulp.task("html", function () {
    const envLogo = process.env.LOGO;

    let basePath = process.env.BASE_PATH || "";
    if (basePath.length > 0 && basePath[basePath.length - 1] === '/') {
        basePath = basePath.slice(0, basePath.length - 1);
    }

    let logo = null;
    if ('LOGO' in process.env) {
        if (typeof process.env.LOGO === "string" && process.env.LOGO.length > 0 && process.env.LOGO.toLowerCase() !== 'false' && process.env.LOGO.toLowerCase() !== 'null' && process.env.LOGO !== '0') {
            logo = envLogo.startsWith('http:') || envLogo.startsWith('https:') ? envLogo : basePath + '/' + envLogo;
        }
    }

    const templateData = {
        basePath: basePath,
        baseUrl: basePath.length > 0 ? basePath.slice(0, basePath.lastIndexOf('/')) : '/admin',
        apiBaseUrl: process.env.API_BASE_URL || '/api',

        title: process.env.PAGE_TITLE || "OZiTAG",
        brandColor: process.env.BRAND_COLOR || "#DD6900",
        logo: logo ? logo : null,
        language: process.env.LANGUAGE || "EN",

        /*
            brandColor: '#8a0e30',
            logo: 'https://belmebel.by/admin/v2/auth/logo.svg',
            language: 'RU',
        */

        /*
            brandColor: '#252c32',
            logo: 'https://banuba-catalog.dev.ozitag.com/admin/auth/logo.svg',
            language: 'EN',
        */

        recaptchaEnabled: !!process.env.RECAPTCHA_SITE_KEY,
        recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY || null,
        recaptchaVersion: process.env.RECAPTCHA_VERSION ? process.env.RECAPTCHA_VERSION.toString().substr(0, 1) : null,
        recaptchaInvisible: process.env.RECAPTCHA_VERSION === '2-invisible',

        /*
            apiBaseUrl: 'http://localhost:5512/api',
            recaptchaEnabled: true,
            recaptchaSiteKey: '6Leg7RUaAAAAAE59yJvLC9hmCCqC_bOnUGrpIKON',
            recaptchaVersion: '2',
            recaptchaInvisible: true
        */

        /*
            apiBaseUrl: 'http://localhost:5512/api',
            recaptchaEnabled: true,
            recaptchaSiteKey: '6LdyTxQaAAAAANvlA8Nc77upMH2j_aMRaJMvz9pr',
            recaptchaVersion: '2',
            recaptchaInvisible: false
        */

        /*
            apiBaseUrl: 'http://localhost:5512/api',
            recaptchaEnabled: true,
            recaptchaSiteKey: '6LexSxQaAAAAANSF7f1Go70qaUPz_OA-Dnh82Fox',
            recaptchaVersion: '3'
        */

        googleAuthEnabled: !!process.env.GOOGLE_CLIENT_ID,
        googleAuthClientId: process.env.GOOGLE_CLIENT_ID,
    };

    const options = {
        ignorePartials: true,
        batch: [`src`],
        helpers: {
            ifCond: function (v1, v2, options) {
                if (v1 === v2) {
                    return options.fn(this);
                }
                return options.inverse(this);
            },
        },
    };

    return gulp
        .src("src/index.hbs")
        .pipe(handlebars(templateData, options))
        .pipe(rename("index.html"))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest("build"));
});

gulp.task("scripts", () => {
    return gulp
        .src("src/js/app.js")
        .pipe(
            babel({
                presets: [
                    [
                        "@babel/preset-env",
                        {
                            useBuiltIns: "entry", // alternative mode: "entry"
                            corejs: 3, // default would be 2
                            targets: "> 0.25%, not dead",
                            // set your own target environment here (see Browserslist)
                        },
                    ],
                ],
            })
        )
        .pipe(rename("app.js"))
        .pipe(uglify())
        .pipe(gulp.dest("build"));
});

gulp.task("watch", () => {
    watch("src/*.hbs", gulp.series("html"));
    watch("src/sass/**/*.scss", gulp.series("sass"));
    watch("src/js/**/*.js", gulp.series("scripts"));
});

gulp.task("favicon-move", () => {
    return gulp.src("./assets/favicon/*").pipe(gulp.dest("./build/favicon"));
});

gulp.task('favicon-fix-paths', () => {
    const basePath = process.env.BASE_PATH || "";

    return gulp.src(['./assets/favicon/browserconfig.xml', './assets/favicon/site.webmanifest'])
        .pipe(replace('/favicon', basePath + '/favicon'))
        .pipe(gulp.dest('build/favicon'));
});


gulp.task("logo", () => {
    const files = [];

    if ('LOGO' in process.env) {
        if (typeof process.env.LOGO === "string" && process.env.LOGO.length > 0 && process.env.LOGO.toLowerCase() !== 'false' && process.env.LOGO.toLowerCase() !== 'null' && process.env.LOGO !== '0') {
            if (process.env.LOGO.startsWith('http:') === false && process.env.LOGO.startsWith('https:') === false) {
                if (fs.existsSync("./assets/" + process.env.LOGO)) {
                    files.push("./assets/" + process.env.LOGO);
                }
            }
        }
    } else {
        files.push("./assets/logo.svg");
    }

    return gulp.src(files).pipe(gulp.dest("./build"));
});

gulp.task('favicon', gulp.series('favicon-move', 'favicon-fix-paths'));
gulp.task("build", gulp.parallel("favicon", "logo", "html", "sass", "scripts"));
gulp.task("dev", gulp.parallel("build", "watch"));
gulp.task("default", gulp.parallel("build"));
