"use strict";
require("dotenv").config();

const gulp = require("gulp");
const sass = require("gulp-sass");
const htmlmin = require("gulp-htmlmin");
const rename = require("gulp-rename");
const watch = require("gulp-watch");
const babel = require("gulp-babel");
const cleanCSS = require("gulp-clean-css");
const uglify = require("gulp-uglify");
const handlebars = require("gulp-compile-handlebars");
const fs = require("fs");

sass.compiler = require("node-sass");

gulp.task("sass", () => {
  return gulp
    .src("./src/sass/**/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(rename("app.css"))
    .pipe(cleanCSS({ compatibility: "ie9" }))
    .pipe(gulp.dest("./build"));
});

gulp.task("html", function () {
  const templateData = {
    title: process.env.PAGE_TITLE || "OZiTAG",
    base_path: process.env.BASE_PATH || "",
    is_logo_png: process.env.IS_LOGO_PNG && (process.env.IS_LOGO_PNG.toString() === '1' || process.env.IS_LOGO_PNG.toString().toUpperCase() === 'TRUE'),
    brand_color: process.env.BRAND_COLOR || "#DD6900",
    language: process.env.LANGUAGE || "EN",
  };

  const options = {
    ignorePartials: true,
    batch: [`src`],
    helpers: {
      times: function (n, block) {
        let accum = "";
        for (let i = 0; i < n; ++i) accum += block.fn(i + 1);
        return accum;
      },
      ifCond: function (v1, v2, options) {
        if (v1 === v2) {
          return options.fn(this);
        }
        return options.inverse(this);
      },
      concat: function (...args) {
        return `${args.slice(0, -1).join("")}`;
      },
    },
  };

  return gulp
    .src("src/index.hbs")
    .pipe(handlebars(templateData, options))
    .pipe(rename("index.html"))
    .pipe(htmlmin({ collapseWhitespace: true }))
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

gulp.task("favicon", () => {
  return gulp.src("./assets/favicon/*").pipe(gulp.dest("./build/favicon"));
});

gulp.task("logo", () => {
  const files = [];

  if (fs.existsSync("./assets/logo.png")) {
    files.push("./assets/logo.png");
  }

  if (fs.existsSync("./assets/logo.svg")) {
    files.push("./assets/logo.svg");
  }

  return gulp.src(files).pipe(gulp.dest("./build"));
});

gulp.task("build", gulp.parallel("favicon", "logo", "html", "sass", "scripts"));
gulp.task("dev", gulp.parallel("build", "watch"));
gulp.task("default", gulp.parallel("build"));
