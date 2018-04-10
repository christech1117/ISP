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

Route::get('/users', 'UsersInfoController@getUserList');
Route::get('/users/{id}', 'UsersInfoController@getUserById');
Route::post('/users', 'UsersInfoController@addUser');
Route::put('/users/{id}', 'UsersInfoController@updateUser');
Route::delete('/users/{id}', 'UsersInfoController@deleteUser');