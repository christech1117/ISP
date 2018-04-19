<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUserGuardiansTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('user_guardians', function (Blueprint $table) {
            $table->increments('guardian_id');
            $table->integer('user_id')->unique()->comment('病人編號');
            $table->string('name')->comment('姓名');
            $table->string('relation')->comment('關係');
            $table->string('tel_morning')->comment('日間電話');
            $table->string('tel_night')->comment('夜間電話');
            $table->string('contact_adress')->comment('通訊地址');
            $table->string('contact_email')->comment('電子信箱');
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
        Schema::dropIfExists('user_guardians');
    }
}
