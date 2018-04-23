<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePersonTakedrugSatausesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('person_take_drug_satauses', function (Blueprint $table) {
            $table->increments('takeDrug_id');
            $table->integer('user_id')->comment('病人編號');
            $table->boolean('regular_take_drug')->comment('是否需要定期服藥');
            $table->boolean('initiative_take_drug')->comment('可自行服藥or拒絕服用');
            $table->string('inspect')->nullable()->comment('需由誰監督');
            $table->string('drug_name')->nullable()->comment('藥名');
            $table->string('effect')->nullable()->comment('作用');
            $table->string('number')->nullable()->comment('頻率/數量');
            $table->string('side_effect')->nullable()->comment('服藥副作用');
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
        Schema::dropIfExists('person_take_drug_satauses');
    }
}
