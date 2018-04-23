<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePersonCaseSourcesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('person_case_sources', function (Blueprint $table) {
            $table->increments('case_source_id');
            $table->integer('user_id')->comment('病人編號');
            $table->enum('type', ['initiative','passive'])->comment('個案來源(主動或被動)');
            $table->string('initiative_type')->nullable()->comment('主動個案種類');
            $table->string('initiative_type_memo')->nullable()->comment('主動個案種類其他內容');
            $table->string('passive_type')->nullable()->comment('被動個案種類');
            $table->string('passive_type_memo')->nullable()->comment('被動個案種類其他內容');
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
        Schema::dropIfExists('person_case_sources');
    }
}
