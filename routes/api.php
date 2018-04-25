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

Route::get('/member', 'MemberController@getMemberList');
Route::get('/member/{id}', 'MemberController@getMemberById');
Route::post('/member', 'MemberController@addMember');
Route::put('/member/{id}', 'MemberController@updateMember');
Route::delete('/member/{id}', 'MemberController@deleteMember');