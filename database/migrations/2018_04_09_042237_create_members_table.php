<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMembersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('members', function (Blueprint $table) {
            $table->increments('member_id');
            $table->string('name')->comment('姓名');
            $table->string('avatar')->nullable()->comment('照片');
            $table->date('work_start_date')->nullable()->comment('就職日期');
            $table->date('work_end_date')->nullable()->comment('離職日期');
            $table->boolean('work_status')->default(true)->comment('工作狀態');
            $table->string('phone')->nullable()->comment('電話');
            $table->string('email')->nullable()->comment('Email');
            $table->string('adress')->nullable()->comment('聯絡住址');
            $table->integer('depart_id')->nullable()->comment('部門或單位');
            $table->string('work_title')->nullable()->comment('職稱');
            $table->integer('plan_id')->nullable()->comment('方案計畫名稱');
            $table->integer('team_id')->nullable()->comment('所屬團隊');
            $table->integer('role_id')->comment('角色');
            $table->string('approve_status')->nullable()->comment('審核');
            $table->enum('income', ['no', 'look', 'edit'])->nullable()->comment('個人收入');
            $table->boolean('is_del')->default(false)->comment('是否刪除');
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
        Schema::dropIfExists('members');
    }
}
