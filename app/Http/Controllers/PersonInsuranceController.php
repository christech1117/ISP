<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\PersonInsurance;

class PersonInsuranceController extends Controller
{
    function index()
    {
        return response()->json(PersonInsurance::all(), 200);
    }
}
