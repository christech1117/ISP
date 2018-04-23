<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePersonEducationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('person_educations', function (Blueprint $table) {
            $table->increments('edu_id')->comment('[ISP]個案基本資料-教育狀況：教育程度在user_basics的table裡');
            $table->integer('user_id')->comment('病人編號');
            $table->string('school')->comment('學校');
            $table->date('graduate_date')->comment('畢業日期');
            $table->string('department')->comment('科系');
            $table->string('memo')->nullable()->comment('備註');
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
        Schema::dropIfExists('person_educations');
    }
}
