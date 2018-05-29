<?php

use Illuminate\Database\Seeder;

class PersonCustomLanguageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $items = array(
            array('title' => '國語', 'created_at' => NOW(), 'updated_at' => NOW(),),
            array('title' => '臺語', 'created_at' => NOW(), 'updated_at' => NOW(),),
            array('title' => '客家話', 'created_at' => NOW(), 'updated_at' => NOW(),),
            array('title' => '原住民語', 'created_at' => NOW(), 'updated_at' => NOW(),),
            array('title' => '手語', 'created_at' => NOW(), 'updated_at' => NOW(),),
            array('title' => '其他', 'created_at' => NOW(), 'updated_at' => NOW(),),
        );
        DB::table('person_custom_languages')->insert($items);
    }
}
