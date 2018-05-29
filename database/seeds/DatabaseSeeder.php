<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            # 個人層級
            PersonObstacleTypeSeeder::class, // 障礙類別
            PersonCustomLanguageSeeder::class, // 慣用語言
            PersonInsuranceSeeder::class, // 保險類型
        ]);
    }
}
