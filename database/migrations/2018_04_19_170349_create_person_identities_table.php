<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePersonIdentitiesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('person_identities', function (Blueprint $table) {
            $table->increments('identity_id')->comment('病人編號');
            $table->integer('user_id')->nullable()->comment('病人編號');
            $table->enum('welfare', ['general', 'low_middle', 'low'])->default('general')->comment('福利');
            $table->string('low_memo')->nullable()->comment('低收入戶第幾款');
            $table->boolean('sick_card')->default(false)->comment('有無重大傷病卡');
            $table->string('sick_card_memo')->nullable()->comment('有重大傷病卡的內容');
            $table->boolean('guardian_declaration')->default(false)->comment('監護宣告');
            $table->string('guardian_declaration_memo')->nullable()->comment('有監護宣告的內容');
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
        Schema::dropIfExists('person_identities');
    }
}
