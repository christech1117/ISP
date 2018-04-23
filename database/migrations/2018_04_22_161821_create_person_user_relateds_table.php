<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePersonUserRelatedsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('person_user_relateds', function (Blueprint $table) {
            $table->increments('id')->commemt('[ISP]個案基本資料-最下面資料(主任、組長、督導、社工員)');
            $table->integer('user_id')->comment('病人編號');
            $table->string('senior')->nullable()->comment('主任');
            $table->string('leader')->nullable()->comment('組長');
            $table->string('supervision')->nullable()->comment('督導');
            $table->string('social_worker')->nullable()->comment('社工員/師');
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
        Schema::dropIfExists('person_user_relateds');
    }
}
