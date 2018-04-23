<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePersonBodyStatusesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('person_body_statuses', function (Blueprint $table) {
            $table->increments('body_id');
            $table->integer('user_id')->comment('人員編號');
            $table->string('type_id')->comment('項目編號');
            $table->string('content')->nullable()->comment('疾病內容');
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
        Schema::dropIfExists('person_body_statuses');
    }
}
