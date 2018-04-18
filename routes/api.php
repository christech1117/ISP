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

Route::get('/member', 'MemberInfoController@getUserList');
Route::get('/member/{id}', 'MemberInfoController@getUserById');
Route::post('/member', 'MemberInfoController@addUser');
Route::put('/member/{id}', 'MemberInfoController@updateUser');
Route::delete('/member/{id}', 'MemberInfoController@deleteUser');