<?php

use Illuminate\Database\Seeder;

class PersonInsuranceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $items = array(
            array('type' => '勞保', 'created_at' => NOW(), 'updated_at' => NOW()),
            array('type' => '公保', 'created_at' => NOW(), 'updated_at' => NOW()),
            array('type' => '榮保', 'created_at' => NOW(), 'updated_at' => NOW()),
            array('type' => '福保', 'created_at' => NOW(), 'updated_at' => NOW()),
            array('type' => '農/漁保', 'created_at' => NOW(), 'updated_at' => NOW()),
            array('type' => '國保', 'created_at' => NOW(), 'updated_at' => NOW()),
            array('type' => '健保', 'created_at' => NOW(), 'updated_at' => NOW()),
            array('type' => '其他', 'created_at' => NOW(), 'updated_at' => NOW()),
        );
        DB::table('person_insurances')->insert($items);
    }
}
