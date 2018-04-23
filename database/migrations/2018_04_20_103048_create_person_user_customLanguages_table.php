<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePersonUserCustomLanguagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('person_user_customLanguages', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('user_id')->comment('病人編號');
            $table->integer('custom_id')->comment('慣用語言編號');
            $table->string('title_memo')->comment('慣用語言其他內容');
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
        Schema::dropIfExists('person_user_customLanguages');
    }
}
