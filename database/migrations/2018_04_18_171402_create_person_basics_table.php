<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePersonBasicsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('person_basics', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name')->comment('姓名');
            $table->string('birthday')->comment('出生日期');
            $table->enum('sex',['boy', 'girl'])->comment('性別');
            $table->string('identity')->unique()->comment('身分證字號');
            $table->string('')->comment('手冊核發日期');
            $table->string('')->comment('後續鑑定日期');
            $table->string('avatar')->comment('照片');
            $table->string('obstacle_type')->comment('障礙類別');
            $table->string('')->comment('障礙類別');
            $table->string('')->comment('障礙類別');
            $table->string('')->comment('障礙類別');
            $table->string('')->comment('障礙類別');
            $table->string('')->comment('障礙類別');
            $table->string('')->comment('障礙類別');
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
        Schema::dropIfExists('person_basics');
    }
}
