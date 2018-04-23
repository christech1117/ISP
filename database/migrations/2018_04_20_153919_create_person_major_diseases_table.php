<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePersonMajorDiseasesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('person_major_diseases', function (Blueprint $table) {
            $table->increments('major_id');
            $table->enum('disease', ['yes', 'no'])->comment('是否有重大疾病');
            $table->string('code')->comment('代碼');
            $table->string('title')->comment('名稱');
            $table->date('effective_date')->comment('有效日期');
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
        Schema::dropIfExists('person_major_diseases');
    }
}
