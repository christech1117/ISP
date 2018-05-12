<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\CompanyBasic;

class CompanyBasicController extends Controller
{
    function index()
    {
        return view('company/basic');
    }

    function getCompanyBasic()
    {
        return response()->json(CompanyBasic::all(), 200);
    }
}
