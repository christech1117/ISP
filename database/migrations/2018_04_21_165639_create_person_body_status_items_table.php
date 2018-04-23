<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePersonBodyStatusItemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('person_body_status_items', function (Blueprint $table) {
            $table->increments('id');
            $table->enum('type', ['disease', 'notice'])->comment('疾病or注意事項');
            $table->string('title')->comment('項目名稱');
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
        Schema::dropIfExists('person_body_status_items');
    }
}
