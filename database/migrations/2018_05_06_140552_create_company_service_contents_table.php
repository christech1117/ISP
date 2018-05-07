<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCompanyServiceContentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('company_service_contents', function (Blueprint $table) {
            $table->increments('serice_id');
            $table->enum('live', ['large','small', 'night', 'community'])->comment('居住分為：大型機構、、小型機構、夜間型住宿機構、社區居住');
            $table->boolean('daytime')->comment('日間活動');
            $table->enum('job', ['Sheltered', 'Supportive'])->comment('就業分為：庇護性就業、支持性就業');
            $table->boolean('education')->comment('教育(學校)');
            $table->boolean('other')->comment('其他');;
            $table->string('other_memo')->nullable()->comment('其他內容');;
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
        Schema::dropIfExists('company_service_contents');
    }
}
