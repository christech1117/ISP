<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCompanyDepartmentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('company_departments', function (Blueprint $table) {
            $table->increments('depart_id');
            $table->enum('depart_type', ['day, live, job'])->comment('單位種類');
            $table->string('service_type')->comment('服務類型');
            $table->string('depart_name')->comment('單位名稱');
            $table->integer('plan_id')->comment('方案');
            $table->integer('member_id')->nullable()->comment('主責人');
            $table->string('adress')->nullable()->comment('住址');
            $table->string('tel')->nullable()->comment('電話');
            
            // 居住、就業...
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
        Schema::dropIfExists('company_departments');
    }
}
