<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUserIdentitiesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('user_identities', function (Blueprint $table) {
            $table->increments('identity_id');
            $table->enum('welfare', ['general', 'low_middle', 'low'])->default('general')->comment('福利');
            $table->string('low_memo')->nullable()->comment('低收入戶第幾款');
            $table->string('Insurance')->nullable()->comment('保險');
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
        Schema::dropIfExists('user_identities');
    }
}
