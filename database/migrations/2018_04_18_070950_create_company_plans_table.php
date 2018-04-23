<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCompanyPlansTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('company_plans', function (Blueprint $table) {
            $table->increments('plan_id');
            $table->string('plan_name')->comment('方案計畫名稱');
            $table->string('area_name')->comment('服務據點名稱');
            $table->integer('member_id')->nullable()->comment('計畫承辦人');
            $table->string('tel')->nullable()->comment('電話');
            $table->string('Email')->nullable()->comment('Email');
            $table->string('service_start_date')->comment('服務開辦日期');
            $table->string('service_end_date')->nullable()->comment('服務結束日期');
            $table->string('service_time')->nullable()->comment('服務時間');
            $table->integer('service_count')->default(0)->comment('服務人數');
            $table->string('price')->default(0)->comment('收費');
            $table->string('description')->nullable()->comment('說明');
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
        Schema::dropIfExists('company_plans');
    }
}
