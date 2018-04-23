<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePersonServiceNeedAssessesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('person_service_need_assesses', function (Blueprint $table) {
            $table->increments('needAsses_id')->comment('ISP]個案基本資料-服務需求評估');
            $table->string('type')->comment('服務種類');
            $table->string('title')->comment('服務項目');
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
        Schema::dropIfExists('person_service_need_assesses');
    }
}
