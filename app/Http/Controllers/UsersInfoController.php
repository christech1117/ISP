<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\UsersInfo;

class UsersInfoController extends Controller
{
    function index()
    {
        return view('usersInfo');
    }

    function getUserList()
    {
        return response()->json(UsersInfo::all(), 200);
    }
    
    function getUserById($id)
    {
        return response()->json(UsersInfo::find($id), 200);
    }

    function addUser(Request $request)
    {
        $usersInfo = new UsersInfo;
        $usersInfo->memberid = $request->input('memberid', '1');
        $usersInfo->name = $request->input('name', '測試人員02');
        $usersInfo->avatar = $request->input('avatar', 'http://img');
        $usersInfo->work_start_date = $request->input('work_start_date', '2018-04-11');
        $usersInfo->work_status = $request->input('work_status', '1');
        $usersInfo->phone = $request->input('phone', '0912345678');
        $usersInfo->email = $request->input('email', 'test@gmail.com');
        $usersInfo->adress = $request->input('adress', '台北市');
        $usersInfo->departid = $request->input('departid', '1');
        $usersInfo->work_title = $request->input('work_title', '主任');
        $usersInfo->planid = $request->input('planid', '1');
        $usersInfo->teamid = $request->input('teamid', '1');
        $usersInfo->role = $request->input('role', '角色');
        $usersInfo->approve_status = $request->input('approve_status', '審核狀態');
        $usersInfo->income = $request->input('income', 'look');
    
        $ok = $usersInfo->save();
        return response()->json(['ok' => $ok], 200);
    }

    function updateUser(Request $request, $id)
    {
        $ok = false;
        $msg = '';
        //
        $user = UsersInfo::find($id);
        if ($user) {
            $user->memberid = $request->input('memberid', '1');
            $user->name = $request->input('name', '測試人員02-1');
            $user->avatar = $request->input('avatar', 'http://imgs');
            $user->work_start_date = $request->input('work_start_date', '2018-04-11');
            $user->work_status = $request->input('work_status', '1');
            $user->phone = $request->input('phone', '0912345679');
            $user->email = $request->input('email', 'test-1@gmail.com');
            $user->adress = $request->input('adress', '台北市2');
            $user->departid = $request->input('departid', '1');
            $user->work_title = $request->input('work_title', '主任2');
            $user->planid = $request->input('planid', '1');
            $user->teamid = $request->input('teamid', '1');
            $user->role = $request->input('role', '角色');
            $user->approve_status = $request->input('approve_status', '審核狀態');
            $user->income = $request->input('income', 'no');
    
            $ok = $user->save();
            if (!$ok) $msg = '更新失敗！';
        } else {
            $msg = '找不到該人員';
        }
        return response()->json(['ok' => $ok, 'msg' => $msg], 200);
    }

    function deleteUser(Request $request, $id)
    {
        $ok = false;
        $msg = '';

        $user = UsersInfo::find($id);
        if ($user) {
            $user->is_del = $request->input('is_del', '1');
    
            $ok = $user->save();
            if (!$ok) $msg = '刪除失敗！';
        } else {
            $msg = '找不到該人員';
        }
        return response()->json(['ok' => $ok, 'msg' => $msg], 200);
    }
    
}
