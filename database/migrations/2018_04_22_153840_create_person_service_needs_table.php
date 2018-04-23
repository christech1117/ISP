<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePersonServiceNeedsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('person_service_needs', function (Blueprint $table) {
            $table->increments('id')->commemt('[ISP]個案基本資料-對服務需求與期待');
            $table->integer('user_id')->comment('病人編號');
            $table->string('case_expect')->nullable()->comment('個案期待');
            $table->string('home_expect')->nullable()->comment('案家期待');
            $table->enum('problem', ['medical, job, care, other'])->comment('主訴問題');
            $table->string('problem_content')->nullable()->comment('主訴問題內容');
            $table->integer('needAssess_id')->nullable()->comment('服務需求評估，請說明');
            $table->integer('memo')->comment('服務需求評估編號，用;隔開id');
            $table->string('other_explain')->nullable()->comment('其他說明');
            $table->date('interview_date')->nullable()->comment('面試日期');
            $table->string('try_date')->nullable()->comment('試住/做期間');
            $table->string('formal_service')->nullable()->comment('正式服務');
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
        Schema::dropIfExists('person_service_needs');
    }
}
