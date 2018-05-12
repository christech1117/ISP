// let mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

// mix.js('resources/assets/js/app.js', 'public/js')
//    .sass('resources/assets/sass/app.scss', 'public/css');

const { mix } = require('laravel-mix');
mix.js('resources/assets/js/fontawesome-all.js', 'public/js')
   .js('resources/assets/js/app.js', 'public/js')
   .js('resources/assets/js/hello.js', 'public/js')
   .js('resources/assets/js/member.js', 'public/js')
   // company
   .js('resources/assets/js/company/basic.js', 'public/js')
   .js('resources/assets/js/company/department.js', 'public/js')
   .js('resources/assets/js/company/plan.js', 'public/js')
   // person
   .js('resources/assets/js/person/personBasic.js', 'public/js')

   .extract(['lodash', 'jquery', 'axios', 'vue'])
   .sass('resources/assets/scss/app.scss', 'public/css');