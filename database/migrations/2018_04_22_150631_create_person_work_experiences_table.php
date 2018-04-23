<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePersonWorkExperiencesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('person_work_experiences', function (Blueprint $table) {
            $table->increments('work_id')->comment('[ISP]個案基本資料-就業經歷');
            $table->integer('user_id')->comment('病人編號');
            $table->string('work_tiele')->comment('工作單位名稱');
            $table->date('start_time')->comment('開始日期');
            $table->date('end_time')->comment('結束日期');
            $table->string('work_title')->comment('職務');
            $table->string('income')->comment('待遇');
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
        Schema::dropIfExists('person_work_experiences');
    }
}
