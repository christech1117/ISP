<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PersonObstacleTypeController extends Controller
{
    function getObstacleType()
    {
        return response()->json(PersonObstacleType::all(), 200);
    }
}
