<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/dashboard', function () {
    return view('hello');
});

// Route::get('/organization/member', 'MemberController@index');
Route::get('/member', function () {
    return view('member');
});

# 組織管理
Route::get('/company/basic', function () {
    return view('/company/basic');
});

Route::get('/company/plan', function () {
    return view('/company/plan');
});

Route::get('/company/department', function () {
    return view('/company/department');
});

# 個人層級
Route::get('/person/personbasic', function () {
    return view('/person/personbasic');
});