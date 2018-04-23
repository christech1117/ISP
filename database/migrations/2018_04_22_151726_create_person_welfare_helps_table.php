<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePersonWelfareHelpsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('person_welfare_helps', function (Blueprint $table) {
            $table->increments('welfare_id')->comment('[ISP]個案基本資料-福利補助');
            $table->integer('user_id')->comment('病人編號');
            $table->string('project')->comment('項目');
            $table->string('price')->comment('金額');
            $table->date('start_time')->comment('開始日期');
            $table->date('end_time')->comment('結束日期');
            $table->string('welfare_departent')->comment('補助單位');
            $table->string('memo')->nullable()->comment('備註(自費額)');
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
        Schema::dropIfExists('person_welfare_helps');
    }
}
