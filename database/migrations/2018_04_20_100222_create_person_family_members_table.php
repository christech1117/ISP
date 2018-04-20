<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePersonFamilyMembersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('person_family_members', function (Blueprint $table) {
            $table->increments('fam_member_id');
            $table->integer('user_id')->comment('病人編號');
            $table->string('title')->comment('稱謂');
            $table->string('name')->comment('姓名');
            $table->integer('age')->comment('年齡');
            $table->string('service_title')->nullable()->comment('服務單位/職稱(學校)');
            $table->boolean('is_obstacle')->comment('是否障礙');
            $table->string('is_obstacle_memo')->nullable()->comment('是否障礙內容');
            $table->boolean('life')->nullable()->comment('存歿');
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
        Schema::dropIfExists('person_family_members');
    }
}
