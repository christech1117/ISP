<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersInfosTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users_infos', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('memberid'); // 所屬主管
            $table->string('name'); // 姓名
            $table->string('avatar')->nullable(); // 照片
            $table->date('work_start_date')->nullable(); // 就職日期
            $table->date('work_end_date')->nullable(); // 離職日期
            $table->enum('work_status', ['1', '0'])->default('1'); // 工作狀態
            $table->string('phone')->nullable(); // 電話
            $table->string('email')->nullable(); // E-mail
            $table->string('adress')->nullable(); // 聯絡住址
            $table->integer('departid')->nullable(); // 部門或單位
            $table->string('work_title')->nullable(); // 職稱
            $table->integer('planid')->nullable(); // 方案計畫名稱
            $table->integer('teamid')->nullable(); // 所屬團隊
            $table->string('role')->nullable(); // 角色
            $table->string('approve_status')->nullable(); // 審核
            $table->enum('income', ['no', 'look', 'edit'])->nullable(); // 個人收入
            $table->enum('is_del', ['1', '0'])->default('0'); // 是否刪除
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
        Schema::dropIfExists('users_infos');
    }
}
