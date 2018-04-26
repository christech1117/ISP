<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Member;

class MemberController extends Controller
{
    function index()
    {
        return view('member');
    }

    function getMemberList()
    {
        // return response()->json(Member::all(), 200);
        return Member::where('is_del', '=', 0)->get();
    }
    
    function getMemberById($id)
    {
        return response()->json(Member::find($id), 200);
    }

    function addMember(Request $request)
    {
        $member = new Member;
        $member->name = $request->input('name', '測試人員02');
        $member->avatar = $request->input('avatar', 'http://img');
        $member->work_start_date = $request->input('work_start_date', '2018-04-11');
        $member->work_status = $request->input('work_status', '1');
        $member->phone = $request->input('phone', '0912345678');
        $member->email = $request->input('email', 'test@gmail.com');
        $member->adress = $request->input('adress', '台北市');
        $member->depart_id = $request->input('depart_id', '1');
        $member->work_title = $request->input('work_title', '主任');
        $member->plan_id = $request->input('plan_id', '1');
        $member->team_id = $request->input('team_id', '1');
        $member->role_id = $request->input('role_id', '1');
        $member->approve_status = $request->input('approve_status', '審核狀態');
        $member->income = $request->input('income', 'look');
    
        $ok = $member->save();
        return response()->json(['ok' => $ok], 200);
    }

    function updateMember(Request $request, $id)
    {
        $ok = false;
        $msg = '';
        //
        $member = Member::find($id);
        if ($member) {
            $member->member_id = $request->input('member_id', '1');
            $member->name = $request->input('name', '測試人員02-1');
            $member->avatar = $request->input('avatar', 'http://imgs');
            $member->work_start_date = $request->input('work_start_date', '2018-04-11');
            $member->work_status = $request->input('work_status', '1');
            $member->phone = $request->input('phone', '0912345679');
            $member->email = $request->input('email', 'test-1@gmail.com');
            $member->adress = $request->input('adress', '台北市2');
            $member->depart_id = $request->input('depart_id', '1');
            $member->work_title = $request->input('work_title', '主任2');
            $member->plan_id = $request->input('plan_id', '1');
            $member->teamid = $request->input('teamid', '1');
            $member->role = $request->input('role', '角色');
            $member->approve_status = $request->input('approve_status', '審核狀態');
            $member->income = $request->input('income', 'no');
    
            $ok = $member->save();
            if (!$ok) $msg = '更新失敗！';
        } else {
            $msg = '找不到該人員';
        }
        return response()->json(['ok' => $ok, 'msg' => $msg], 200);
    }

    function deleteMember(Request $request, $id)
    {
        $ok = false;
        $msg = '';

        $member = Member::find($id);
        if ($member) {
            $member->is_del = $request->input('is_del', '1');
    
            $ok = $member->save();
            if (!$ok) $msg = '刪除失敗！';
        } else {
            $msg = '找不到該人員';
        }
        return response()->json(['ok' => $ok, 'msg' => $msg], 200);
    }
    
}
