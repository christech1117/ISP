<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Route::middleware('auth:api')->get('/user', function (Request $request) {
//     return $request->user();
// });

# 人員管理
Route::get('/member', 'MemberController@getMemberList');
Route::get('/member/{id}', 'MemberController@getMemberById');
Route::post('/member', 'MemberController@addMember');
Route::put('/member/{id}', 'MemberController@updateMember');
Route::delete('/member/{id}', 'MemberController@deleteMember');

# 組織管理
Route::get('/company/basic', 'CompanyBasicController@getCompanyBasic');

# 個人層級
Route::get('/person/PersonObstacleType', 'PersonObstacleTypeController@getObstacleType');
Route::get('/person/PersonCustomLanguage', 'PersonCustomLanguageController@index');
Route::get('/person/PersonInsurance', 'PersonInsuranceController@index');