<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePersonObstacleProcessesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('person_obstacle_processes', function (Blueprint $table) {
            $table->increments('obstacle_id');
            $table->integer('user_id')->comment('病人編號');
            $table->date('obstacle_time')->comment('障礙時間');
            $table->enum('source', ['innate', 'disease', 'accident', 'traffic_accient', 'job_hurt', 'other'])->comment('障礙成因: innate(先天), disease(疾病), accient(意外), traffic_accient(交通事故), job_hurt(職業傷害)');
            $table->string('source_memo')->comment('障礙成因其他內容');
            $table->string('process')->nullable()->comment('障礙過程');
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
        Schema::dropIfExists('person_obstacle_processes');
    }
}
