<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCompanyBasicsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('company_basics', function (Blueprint $table) {
            $table->increments('compony_id');
            $table->string('company_name')->unique()->comment('組織\單位名稱');
            $table->string('member_id')->unique()->comment('聯絡人姓名');
            $table->string('tel')->unique()->comment('電話');
            $table->string('email')->unique()->comment('Email');
            $table->string('service_area')->comment('服務地區類別');
            $table->integer('user_count')->default(0)->comment('服務人數');
            $table->integer('member_count')->default(0)->comment('全職人員數量');
            $table->string('service_people')->comment('服務對象類別');
            $table->string('people_age')->comment('服務對象年齡層百分比');
            $table->string('budget')->comment('年度預算');
            $table->string('service_content')->comment('組織服務內容');
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
        Schema::dropIfExists('company_basics');
    }
}
