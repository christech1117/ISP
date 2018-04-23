<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePersonInterviewTablesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('person_interview_tables', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('user_id')->comment('病人編號');
            $table->integer('interview_id')->comment('訪談表編號');
            $table->string('type')->comment('支持型態');
            $table->string('frequency')->comment('支持頻率');
            $table->string('time')->comment('支持時間');
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
        Schema::dropIfExists('person_interview_tables');
    }
}
