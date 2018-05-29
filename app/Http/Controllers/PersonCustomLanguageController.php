<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\PersonCustomLanguage;

class PersonCustomLanguageController extends Controller
{
    function index()
    {
        return response()->json(PersonCustomLanguage::all(), 200);
    }
}
