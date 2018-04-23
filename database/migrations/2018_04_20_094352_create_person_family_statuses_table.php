<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePersonFamilyStatusesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('person_family_statuses', function (Blueprint $table) {
            $table->increments('fam_status_id');
            $table->increments('user_id')->comment('病人編號');
            $table->enum('live_house', ['room', 'suite', 'apartment', 'bungalow', 'villa', 'other'])->comment('住所型態: room(雅房), suite(套房), apartment(公寓), bungalow(平房), villa(透天獨棟)');
            $table->string('live_house_memo')->nullable()->comment('住所型態其他內容');
            $table->enum('live_type', ['rent', 'own', 'borrow'])->comment('住所類型: rent(租賃), own(自有), borrow(借住)');
            $table->string('live_type_memo')->nullable()->comment('住所類型內容');
            $table->enum('economy', ['rich', 'middle', 'general', 'low_income', 'other'])->comment('經濟狀況');
            $table->string('economy_memo')->comment('經濟狀況其他內容');
            $table->string('economy_source')->comment('家庭主要經濟來源者');
            $table->string('month_income')->comment('家庭月收入約幾元');
            $table->string('month_pay')->comment('家庭月支出約幾元');
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
        Schema::dropIfExists('person_family_statuses');
    }
}
