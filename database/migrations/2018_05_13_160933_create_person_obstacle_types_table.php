<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePersonObstacleTypesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('person_obstacle_types', function (Blueprint $table) {
            $table->increments('obstacletype_id')->comment('障礙類別');
            $table->string('type')->comment('大項');
            $table->string('sub_type')->comment('細項');
            $table->integer('score')->comment('分數');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('person_obstacle_types');
    }
}
