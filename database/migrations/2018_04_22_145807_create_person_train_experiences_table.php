<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePersonTrainExperiencesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('person_train_experiences', function (Blueprint $table) {
            $table->increments('train_id')->comment('[ISP]個案基本資料-安置/訓練服務經歷');
            $table->integer('user_id')->comment('病人編號');
            $table->string('service_organization')->comment('服務機構');
            $table->date('start_time')->comment('開始日期');
            $table->date('end_time')->comment('結束日期');
            $table->string('service_content')->comment('服務內容');
            $table->string('leave_reason')->comment('離開原因');
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
        Schema::dropIfExists('person_train_experiences');
    }
}
