<?php

use Illuminate\Database\Seeder;

class PersonObstacleTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $items = array(
        # 第一大類
            array('type' => '1', 'sub_type' => '智能障礙者', 'score' => 6, 'created_at' => NOW(), 'updated_at' => NOW(),),
            array('type' => '1', 'sub_type' => '植物人', 'score' => 9, 'created_at' => NOW(), 'updated_at' => NOW(),),
            array('type' => '1', 'sub_type' => '失智症', 'score' => 10, 'created_at' => NOW(), 'updated_at' => NOW(),),
            array('type' => '1', 'sub_type' => '自閉症', 'score' => 11, 'created_at' => NOW(), 'updated_at' => NOW(),),
            array('type' => '1', 'sub_type' => '慢性精神病', 'score' => 12, 'created_at' => NOW(), 'updated_at' => NOW(),),
            array('type' => '1', 'sub_type' => '頑性癲癇症', 'score' => 14, 'created_at' => NOW(), 'updated_at' => NOW(),),
            array('type' => '1', 'sub_type' => '其他', 'score' => 0, 'created_at' => NOW(), 'updated_at' => NOW(),),
        # 第二大類
            array('type' => '2', 'sub_type' => '視覺障礙', 'score' => 1, 'created_at' => NOW(), 'updated_at' => NOW(),),
            array('type' => '2', 'sub_type' => '聽覺障礙', 'score' => 2, 'created_at' => NOW(), 'updated_at' => NOW(),),
            array('type' => '2', 'sub_type' => '平衡機能障礙', 'score' => 3, 'created_at' => NOW(), 'updated_at' => NOW(),),
            array('type' => '2', 'sub_type' => '其他', 'score' => 0, 'created_at' => NOW(), 'updated_at' => NOW(),),
        # 第三大類
            array('type' => '3', 'sub_type' => '聲音或語言機能障礙', 'score' => 4, 'created_at' => NOW(), 'updated_at' => NOW(),),
            array('type' => '3', 'sub_type' => '其他', 'score' => 0, 'created_at' => NOW(), 'updated_at' => NOW(),),
        # 第四大類
            array('type' => '4', 'sub_type' => '重要器官失去功能-心臟', 'score' => 7, 'created_at' => NOW(), 'updated_at' => NOW(),),
            array('type' => '4', 'sub_type' => '重要器官失去功能-造血機能', 'score' => 7, 'created_at' => NOW(), 'updated_at' => NOW(),),
            array('type' => '4', 'sub_type' => '重要器官失去功能-呼吸器官', 'score' => 7, 'created_at' => NOW(), 'updated_at' => NOW(),),
            array('type' => '4', 'sub_type' => '其他', 'score' => 0, 'created_at' => NOW(), 'updated_at' => NOW(),),
        # 第五大類
            array('type' => '5', 'sub_type' => '重要器官失去功能-吞嚥機能', 'score' => 7, 'created_at' => NOW(), 'updated_at' => NOW(),),
            array('type' => '5', 'sub_type' => '重要器官失去功能-胃', 'score' => 7, 'created_at' => NOW(), 'updated_at' => NOW(),),
            array('type' => '5', 'sub_type' => '重要器官失去功能-腸道', 'score' => 7, 'created_at' => NOW(), 'updated_at' => NOW(),),
            array('type' => '5', 'sub_type' => '重要器官失去功能-肝臟', 'score' => 7, 'created_at' => NOW(), 'updated_at' => NOW(),),
            array('type' => '5', 'sub_type' => '其他', 'score' => 0, 'created_at' => NOW(), 'updated_at' => NOW(),),
        # 第六大類
            array('type' => '6', 'sub_type' => '重要器官失去功能-腎臟', 'score' => 7, 'created_at' => NOW(), 'updated_at' => NOW(),),
            array('type' => '6', 'sub_type' => '重要器官失去功能-膀胱', 'score' => 7, 'created_at' => NOW(), 'updated_at' => NOW(),),
            array('type' => '6', 'sub_type' => '其他', 'score' => 7, 'created_at' => NOW(), 'updated_at' => NOW(),),
        # 第七大類
            array('type' => '7', 'sub_type' => '肢體障礙', 'score' => 5, 'created_at' => NOW(), 'updated_at' => NOW(),),
            array('type' => '7', 'sub_type' => '其他', 'score' => 0, 'created_at' => NOW(), 'updated_at' => NOW(),),
        # 第八大類
            array('type' => '8', 'sub_type' => '顏面損傷', 'score' => 8, 'created_at' => NOW(), 'updated_at' => NOW(),),
            array('type' => '8', 'sub_type' => '其他', 'score' => 0, 'created_at' => NOW(), 'updated_at' => NOW(),),
        # 未分類
            array('type' => '0', 'sub_type' => '多重障礙者', 'score' => 13, 'created_at' => NOW(), 'updated_at' => NOW(),),
            array('type' => '0', 'sub_type' => '罕見疾病', 'score' => 15, 'created_at' => NOW(), 'updated_at' => NOW(),),
            array('type' => '0', 'sub_type' => '其他經中央衛生主管機關認定之障礙者', 'score' => 16, 'created_at' => NOW(), 'updated_at' => NOW(),),
        );

        DB::table('person_obstacle_types')->insert($items);
    }
}
