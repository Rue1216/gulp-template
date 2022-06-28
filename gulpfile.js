const gulp = require('gulp');
const jade = require('gulp-jade');
const sass = require('gulp-sass')(require('sass'));
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');

//initial cleaness
const clean = require('gulp-clean');
//babel
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
//browser sync
const browserSync = require('browser-sync').create();
//minify
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const minimist = require('minimist');
const gulpif = require('gulp-if');


//設定初始環境
const envOptions = {
  string: 'env',
  default:{
    env:'develop'
  },
}
const options = minimist(process.argv.slice(2), envOptions)
console.log(options)


//piping stream below

//clean the public folder
gulp.task('clean', function () {
  return gulp.src('./public', {read: false, allowEmpty: true})
      .pipe(clean());
});

// gulp.task('copyHTML', function(){
//     return gulp.src('./source/**/*.html')
//     .pipe(gulp.dest('./public/'))
// })

gulp.task('jade', function() {
    // var YOUR_LOCALS = {};
    return gulp.src('./source/**/*.jade')
      .pipe(plumber())
      .pipe(jade({
        pretty: true,
      }))
      .pipe(gulp.dest('./public/'))
      .pipe(browserSync.stream())
});


gulp.task('sass', function () {
    return gulp.src('./source/scss/**/*.scss')
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(postcss([autoprefixer()]))
      .pipe(sass().on('error', sass.logError))
      .pipe(gulpif(options.env === 'production', cleanCSS()))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('./public/css'))
      .pipe(browserSync.stream())
});

//babel
gulp.task('babel', () =>
	gulp.src('./source/js/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel({
			presets: ['@babel/preset-env']
		}))
		.pipe(concat('all.js'))
    .pipe(gulpif(options.env === 'production',uglify({
      compress:{
        //將 console 移除
        drop_console: true
      }
    })))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('./public/js'))
    .pipe(browserSync.stream())
);



//browser sync
gulp.task('browser-sync', function(){
  browserSync.init({
    server:{
      baseDir:'./public'
    },
    // 重新整理的間隔時間必須超過兩秒
    reloadDebounce: 2000
  })
});


//監聽有無更新
gulp.task('watch', function () {
    gulp.watch('./source/scss/**/*.scss', gulp.series('sass'));
    gulp.watch('./source/*.jade', gulp.series('jade'));
    gulp.watch('./source/js/**/*.js', gulp.series('babel'));
  });


//default mode
gulp.task('default',
  gulp.series(
    'clean',
    gulp.parallel('jade','sass','babel'),
    function(done){
      // browser sync
      browserSync.init({
        server:{
          baseDir:'./public'
        },
        // 重新整理的間隔時間必須超過兩秒
        reloadDebounce: 2000
      })
      // watch
      gulp.watch('./source/scss/**/*.scss', gulp.series('sass'));
      gulp.watch('./source/*.jade', gulp.series('jade'));
      gulp.watch('./source/js/**/*.js', gulp.series('babel'));
      done();
    }
  )
);

//交付時使用，記得要 run --env production
gulp.task('build',
  gulp.series(
    'clean',
    gulp.parallel( 'jade', 'sass', 'babel',)
  )
)

/* 

如果有載入 bower、imagemin，可以參考下列放置位置

*/ 

// gulp.task('build',
//   gulp.series(
//       'clean',
//       'bower',
//       'vendorJS',
//       gulp.parallel('jade','sass', 'babel', 'imageMin')
//   )
// )

// gulp.task('default',
//   gulp.series(
//       'clean',
//       'bower',
//       'vendorJS',
//       gulp.parallel('jade','sass', 'babel', 'imageMin'),
//       function(done){

//         done();
//       }
//   )
// )