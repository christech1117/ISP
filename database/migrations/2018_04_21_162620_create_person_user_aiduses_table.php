<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePersonUserAidusesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('person_user_aiduses', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('user_id')->comment('病人編號');
            $table->integer('aid_id')->comment('輔助使用編號');
            $table->integer('action_memo')->nullable()->comment('行動輔具其他內容');
            $table->integer('learn_memo')->nullable()->comment('學習性輔具其他內容');
            $table->integer('live_memo')->nullable()->comment('生活輔具其他內容');
            $table->integer('prevent_memo')->nullable()->comment('預防/治療性其他內容');
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
        Schema::dropIfExists('person_user_aiduses');
    }
}
