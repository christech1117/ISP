<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePersonMedicalStatusesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('person_medical_statuses', function (Blueprint $table) {
            $table->increments('medical_id');
            $table->integer('user_id')->comment('病人編號');
            $table->boolean('once_disease')->comment('曾患疾病');
            $table->string('once_disease_memo')->nullable()->comment('曾患疾病內容');
            $table->boolean('Hospitalization')->default(0)->comment('住院次數');
            $table->integer('Hospitalization_count')->nullable()->comment('住院次數(幾次)');
            $table->string('Hospitalization_source')->nullable()->comment('住院次數(原因)');
            $table->string('Hospitalization_location')->nullable()->comment('住院次數(地點)');
            $table->boolean('surgery')->comment('手術情形');
            $table->string('surgery_source')->nullable()->comment('手術情形(原因)');
            $table->string('surgery_location')->nullable()->comment('手術情形(地點)');
            $table->boolean('drug')->comment('藥物');
            $table->string('drug_memo')->nullable()->comment('藥物內容');
            $table->boolean('food')->comment('食物');
            $table->string('food_memo')->nullable()->comment('食物內容');
            $table->string('other')->nullable()->comment('其它');
            $table->boolean('goto_hospital')->comment('是否就診');
            $table->string('hospital')->nullable()->comment('就診醫院');
            $table->string('doctor')->nullable()->comment('主治醫師');
            $table->string('disease_title')->nullable()->comment('疾病名稱');
            $table->string('disease_symptom')->nullable()->comment('疾病症狀');
            $table->date('Referral_date')->nullable()->comment('複診時間');     
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
        Schema::dropIfExists('person_medical_statuses');
    }
}
