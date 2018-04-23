<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\MemberInfo;

class MemberInfoController extends Controller
{
    function index()
    {
        return view('memberInfo');
    }

    function getMemberList()
    {
        // return response()->json(MemberInfo::all(), 200);
        return MemberInfo::where('is_del', '=', 0)->get();
    }
    
    function getMemberById($id)
    {
        return response()->json(MemberInfo::find($id), 200);
    }

    function addMember(Request $request)
    {
        $memberInfo = new MemberInfo;
        $memberInfo->member_id = $request->input('member_id', '1');
        $memberInfo->name = $request->input('name', '測試人員02');
        $memberInfo->avatar = $request->input('avatar', 'http://img');
        $memberInfo->work_start_date = $request->input('work_start_date', '2018-04-11');
        $memberInfo->work_status = $request->input('work_status', '1');
        $memberInfo->phone = $request->input('phone', '0912345678');
        $memberInfo->email = $request->input('email', 'test@gmail.com');
        $memberInfo->adress = $request->input('adress', '台北市');
        $memberInfo->depart_id = $request->input('depart_id', '1');
        $memberInfo->work_title = $request->input('work_title', '主任');
        $memberInfo->plan_id = $request->input('plan_id', '1');
        $memberInfo->team_id = $request->input('team_id', '1');
        $memberInfo->role = $request->input('role', '角色');
        $memberInfo->approve_status = $request->input('approve_status', '審核狀態');
        $memberInfo->income = $request->input('income', 'look');
    
        $ok = $memberInfo->save();
        return response()->json(['ok' => $ok], 200);
    }

    function updateMember(Request $request, $id)
    {
        $ok = false;
        $msg = '';
        //
        $member = MemberInfo::find($id);
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

        $member = MemberInfo::find($id);
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
