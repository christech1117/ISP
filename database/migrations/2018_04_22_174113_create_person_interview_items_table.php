<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePersonInterviewItemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('person_interview_items', function (Blueprint $table) {
            $table->increments('interview_id')->comment('ISP訪談表項目固定資料');
            $table->enum('part', ['partI', 'partII', 'partIII'])->comment('第幾部分');
            $table->string('type')->comment('哪個大項、種類');
            $table->string('title')->comment('題目名稱');
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
        Schema::dropIfExists('person_interview_items');
    }
}
