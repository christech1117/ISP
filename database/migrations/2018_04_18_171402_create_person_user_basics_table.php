<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePersonUserBasicsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('person_user_basics', function (Blueprint $table) {
            $table->increments('user_id');
            $table->string('name')->comment('姓名');
            $table->string('birthday')->comment('出生日期');
            $table->enum('sex',['boy', 'girl'])->comment('性別');
            $table->string('identity')->unique()->comment('身分證字號');
            $table->date('publish_date')->nullable()->comment('手冊核發日期');
            $table->date('identify_date')->nullable()->comment('後續鑑定日期');
            $table->string('avatar')->comment('照片');
            $table->enum('obstacle_level', ['low', 'medium', 'severe', 'vary_severe'])->comment('障礙等級');
            $table->enum('marriage', ['unmarried', 'married', 'other'])->comment('婚姻狀況');
            $table->integer('marriage_memo')->nullable()->comment('婚姻狀況(子/女幾人)');
            $table->string('house_adress')->comment('戶籍地址');
            $table->string('contact_adress')->comment('通訊地址');
            $table->string('family_img')->comment('家系圖暨生態圖');
            $table->string('height')->comment('身高');
            $table->string('weight')->comment('體重');
            $table->string('blood')->comment('血型');
            $table->string('care_people')->comment('主要照顧者');
            $table->string('decided_people')->comment('主要決策者');
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
        Schema::dropIfExists('person_user_basics');
    }
}
