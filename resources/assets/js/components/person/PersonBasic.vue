<template>
  <div class="content">
    <vuestic-widget class="modals-list larger-padding" :headerText="'個案基本資料'">
      <div class="top-tool">
        <button class="btn btn-warning btn-with-icon rounded-icon" @click="showModal()">
          <div class="btn-with-icon-content">
            <i class="fas fa-pencil-alt"></i>
          </div>
        </button>
      </div>
      <modal :show.sync="show" v-bind:large="true" v-bind:force="true" ref="modal" :cancelText="'取消'" :okText="'新增'">
        <div slot="title">新增人員</div>
        <table border="1" class="table">
          <tr>
            <th>組織\單位名稱</th>
            <td colspan="3"></td>
          </tr>
          <tr>
            <th>聯絡人姓名</th>
            <td> </td>
            <th>電話</th>
            <td> </td>
          </tr>
          <tr>
            <th>Email</th>
            <td colspan="3"></td>
          </tr>
          <tr colspan="4">
            <th>服務地區類別</th>
            <td colspan="3">
              <div class="d-inline-block">
                <vuestic-checkbox :label="'都市'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'郊區'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'綜合'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
            </td>
          </tr>
          <tr>
            <th>服務人數</th>
            <td> </td>
            <th>全職人員數量</th>
            <td> </td>
          </tr>
          <tr>
            <th>服務對方類型</th>
            <td colspan="3">
              <div class="d-inline-block">
                <vuestic-checkbox :label="'智能/發展障礙'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'高齡'" :id="'checkbox2'" v-model="checkboxTwoModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'精神/行為健康'" :id="'checkbox3'" v-model="checkboxTwoModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'特殊教育'" :id="'checkbox4'" v-model="checkboxTwoModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'其他'" :id="'checkbox5'" v-model="checkboxTwoModel"></vuestic-checkbox>
              </div>
            </td>
          </tr>
          <tr>
            <th>服務對象年齡層百分比</th>
            <td colspan="3">
              <p>兒童 0 ~ 12 歲：</p>
              <p>青少年 13 ~ 18 歲：</p>
              <p>高齡 65+ 歲：</p>
              <p>成人 19 ~ 65 歲：</p>
            </td>
          </tr>
          <tr>
            <th>年度預算</th>
            <td colspan="3"></td>
          </tr>
          <tr>
            <th>組織服務內容</th>
            <td colspan="3">
              <ol>
                <li>
                  <div class="d-inline-block">
                    <vuestic-checkbox :label="'居住 ➔'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                  </div>
                  <div class="d-inline-block">
                    <vuestic-checkbox :label="'大型機構(&gt;200人)'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                  </div>
                  <div class="d-inline-block">
                    <vuestic-checkbox :label="'小型機構(30人~200人)'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                  </div>
                  <div class="d-inline-block">
                    <vuestic-checkbox :label="'夜間型住宿機構(&lt;29人)'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                  </div>
                  <div class="d-inline-block">
                    <vuestic-checkbox :label="'社區居住(&lt;6人)'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                  </div>
                </li>
                <li>
                  <vuestic-checkbox :label="'日間活動'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </li>
                <li>
                  <div class="d-inline-block">
                    <vuestic-checkbox :label="'就業 ➔'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                  </div>
                  <div class="d-inline-block">
                    <vuestic-checkbox :label="'庇護性就業'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                  </div>
                  <div class="d-inline-block">
                    <vuestic-checkbox :label="'支持性就業'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                  </div>
                </li>
                <li>
                  <vuestic-checkbox :label="'教育(學校)'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </li>
                <li>
                  <vuestic-checkbox :label="'其他'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </li>
              </ol>
            </td>
          </tr>
        </table>
      </modal>
      <h5>一、基本資料</h5>
      <table border="1" class="table text-center">
        <tr>
          <th>姓名</th>
          <td colspan="2"></td>
          <th>出生日期</th>
          <td colspan="2"></td>
          <td rowspan="3"></td>
        </tr>
        <tr>
          <th>性別</th>
          <td colspan="2"></td>
          <th>身分證字號</th>
          <td colspan="2"></td>
        </tr>
        <tr>
          <th>手冊核發日期</th>
          <td colspan="2"></td>
          <th>後續鑑定日期</th>
          <td colspan="2"></td>
        </tr>
        <tr>
          <th rowspan="10">障礙類別</th>
        </tr>
        <tr>
          <th>第一大類</th>
          <td colspan="6">
            <p-check
              v-for="obstacle in obstacles"
              :key="obstacle.id"
              v-if="obstacle.type === '1'"
              class="p-default p-smooth p-bigger"
              color="warning" value="obstacles"
              v-model="service_people"
            >
              {{ obstacle.sub_type }}
            </p-check>
          </td>
        </tr>

        <tr>
          <th>第二大類</th>
          <td colspan="6">
            <p-check
              v-for="obstacle in obstacles"
              :key="obstacle.id"
              v-if="obstacle.type === '2'"
              class="p-default p-smooth p-bigger"
              color="warning" value="obstacles"
              v-model="service_people"
            >
              {{ obstacle.sub_type }}
            </p-check>
          </td>
        </tr>
        <tr>
          <th>第三大類</th>
          <td colspan="6">
            <p-check
              v-for="obstacle in obstacles"
              :key="obstacle.id"
              v-if="obstacle.type === '3'"
              class="p-default p-smooth p-bigger"
              color="warning" value="obstacles"
              v-model="service_people"
            >
              {{ obstacle.sub_type }}
            </p-check>
          </td>
        </tr>
        <tr>
          <th>第四大類</th>
          <td colspan="6">
            <p-check
              v-for="obstacle in obstacles"
              :key="obstacle.id"
              v-if="obstacle.type === '4'"
              class="p-default p-smooth p-bigger"
              color="warning" value="obstacles"
              v-model="service_people"
            >
              {{ obstacle.sub_type }}
            </p-check>
          </td>
        </tr>
        <tr>
          <th>第五大類</th>
          <td colspan="6">
            <p-check
              v-for="obstacle in obstacles"
              :key="obstacle.id"
              v-if="obstacle.type === '5'"
              class="p-default p-smooth p-bigger"
              color="warning" value="obstacles"
              v-model="service_people"
            >
              {{ obstacle.sub_type }}
            </p-check>
          </td>
        </tr>
        <tr>
          <th>第六大類</th>
          <td colspan="6">
            <p-check
              v-for="obstacle in obstacles"
              :key="obstacle.id"
              v-if="obstacle.type === '6'"
              class="p-default p-smooth p-bigger"
              color="warning" value="obstacles"
              v-model="service_people"
            >
              {{ obstacle.sub_type }}
            </p-check>
          </td>
        </tr>
        <tr>
          <th>第七大類</th>
          <td colspan="6">
            <p-check
              v-for="obstacle in obstacles"
              :key="obstacle.id"
              v-if="obstacle.type === '7'"
              class="p-default p-smooth p-bigger"
              color="warning" value="obstacles"
              v-model="service_people"
            >
              {{ obstacle.sub_type }}
            </p-check>
          </td>
        </tr>
        <tr>
          <th>第八大類</th>
          <td colspan="6">
            <p-check
              v-for="obstacle in obstacles"
              :key="obstacle.id"
              v-if="obstacle.type === '8'"
              class="p-default p-smooth p-bigger"
              color="warning" value="obstacles"
              v-model="service_people"
            >
              {{ obstacle.sub_type }}
            </p-check>
          </td>
        </tr>
        <tr>
          <td colspan="6">
            <p-check
              v-for="obstacle in obstacles"
              :key="obstacle.id"
              v-if="obstacle.type === '0'"
              class="p-default p-smooth p-bigger"
              color="warning" value="obstacles"
              v-model="service_people"
            >
              {{ obstacle.sub_type }}
            </p-check>
            <!-- <span>其他經中央衛生主管機關認定之障礙者(</span>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'先天代謝異常'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'染色體異常'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'先天性缺陷'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
            <span>)</span> -->
          </td>
        </tr>
        <tr>
          <th>障礙等級</th>
          <td colspan="6">
            <p-radio class="p-default p-smooth p-bigger" color="warning" value="low" v-model="obstacle_level">輕度</p-radio>
            <p-radio class="p-default p-smooth p-bigger" color="warning" value="medium" v-model="obstacle_level">中度</p-radio>
            <p-radio class="p-default p-smooth p-bigger" color="warning" value="severe" v-model="obstacle_level">重度</p-radio>
            <p-radio class="p-default p-smooth p-bigger" color="warning" value="vary_severe" v-model="obstacle_level">極重度</p-radio>
          </td>
        </tr>
        <tr>
          <th>慣用語言</th>
          <td colspan="6">
            <p-check
              v-for="custom_language in custom_languages"
              :key="custom_language.id"
              class="p-default p-smooth p-bigger"
              color="warning"
              :value="custom_language.custom_id"
              v-model="custom_languages_check"
            >
              {{ custom_language.title }}
            </p-check>
              {{ custom_languages_check }}
          </td>
        </tr>
        <tr>
          <th>婚姻狀況</th>
          <td colspan="6">
            <p-radio class="p-default p-smooth p-bigger" color="warning" value="unmarried" v-model="marriage">未婚</p-radio>
            <p-radio class="p-default p-smooth p-bigger" color="warning" value="married" v-model="marriage">已婚</p-radio>
            <p-radio class="p-default p-smooth p-bigger" color="warning" value="other" v-model="marriage">其他</p-radio>
          </td>
        </tr>
        <tr>
          <th>戶籍地址</th>
          <td colspan="6"></td>
        </tr>
        <tr>
          <th>通訊地址</th>
          <td colspan="6"></td>
        </tr>
        <tr>
          <th rowspan="3">家長監護人</th>
          <th>姓名</th>
          <td></td>
          <th>關係</th>
          <td></td>
          <th>電話</th>
          <td></td>
        </tr>
        <tr>
          <td colspan="6">通訊地址：</td>
        </tr>
        <tr>
          <td colspan="6">電子信箱：</td>
        </tr>
        <tr>
          <th>身份</th>
          <td colspan="6">
            <ul>
              <li>
                <span>福利：</span>
                <p-radio class="p-default p-smooth p-bigger" color="warning" value="general" v-model="welfare">一般戶</p-radio>
                <p-radio class="p-default p-smooth p-bigger" color="warning" value="low_middle" v-model="welfare">中低收入戶</p-radio>
                <p-radio class="p-default p-smooth p-bigger" color="warning" value="low" v-model="welfare">低收入戶第 款</p-radio>
              </li>
              <li>
                <span>保險：</span>
                <p-check
                  v-for="insurance in insurances"
                  :key="insurance.id"
                  class="p-default p-smooth p-bigger"
                  color="warning"
                  :value="insurance.insurance_id"
                  v-model="service_people"
                >
                  {{ insurance.type }}
                </p-check>
              </li>
              <li>
                <span>有無重大傷病卡：</span>
                <p-radio class="p-default p-smooth p-bigger" color="warning" value="no" v-model="sick_card">無</p-radio>
                <p-radio class="p-default p-smooth p-bigger" color="warning" value="yes" v-model="sick_card">有</p-radio>
              </li>
              <li>
                <span>監護宣告：</span>
                <p-radio class="p-default p-smooth p-bigger" color="warning" value="no" v-model="guardian_declaration">無</p-radio>
                <p-radio class="p-default p-smooth p-bigger" color="warning" value="yes" v-model="guardian_declaration">有</p-radio>
              </li>
            </ul>
          </td>
        </tr>
        <tr>
          <th>個案來源</th>
          <!-- <td colspan="6">
            <ul>
              <li>
                <div class="d-inline-block">
                  <vuestic-checkbox :label="'主動發掘'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </div>
                <div class="d-inline-block">
                  <vuestic-checkbox :label="'衛政'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </div>
                <div class="d-inline-block">
                  <vuestic-checkbox :label="'教育'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </div>
                <div class="d-inline-block">
                  <vuestic-checkbox :label="'社政'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </div>
                <div class="d-inline-block">
                  <vuestic-checkbox :label="'勞政'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </div>
                <div class="d-inline-block">
                  <vuestic-checkbox :label="'其他____'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </div>
              </li>
              <li>
                <span>自行提出申請(訊息來源：</span>
                <div class="d-inline-block">
                  <vuestic-checkbox :label="'中心文宣'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </div>
                <div class="d-inline-block">
                  <vuestic-checkbox :label="'社政文宣'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </div>
                <div class="d-inline-block">
                  <vuestic-checkbox :label="'媒體'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </div>
                <div class="d-inline-block">
                  <vuestic-checkbox :label="'親友'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </div>
                <div class="d-inline-block">
                  <vuestic-checkbox :label="'其他____'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </div>
                <span>)</span>
              </li>
            </ul>
          </td> -->
        </tr>
      </table>
      <br />
      <!-- <h5>二、家庭狀況</h5>
      <table border="1" class="table text-center">
        <tr>
          <th>住所型態</th>
          <td colspan="6">
            <div class="d-inline-block">
              <vuestic-checkbox :label="'雅房'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
            </div>
            <div class="d-inline-block">
              <vuestic-checkbox :label="'套房'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
            </div>
            <div class="d-inline-block">
              <vuestic-checkbox :label="'公寓'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
            </div>
            <div class="d-inline-block">
              <vuestic-checkbox :label="'平房'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
            </div>
            <div class="d-inline-block">
              <vuestic-checkbox :label="'透天獨棟'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
            </div>
            <div class="d-inline-block">
              <vuestic-checkbox :label="'其他'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
            </div>
          </td>
        </tr>
        <tr>
          <th>住所類型</th>
          <td colspan="6"></td>
        </tr>
        <tr>
          <th>經濟狀況</th>
          <td colspan="6"></td>
        </tr>
        <tr>
          <th rowspan="3">家庭成員</th>
          <th>稱謂</th>
          <th>姓名</th>
          <th>年齡</th>
          <th>服務單位/職稱(學校)</th>
          <th>是否障礙</th>
          <th>存/歿</th>
        </tr>
        <tr>
          <td>1</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td colspan="6">
            <span>主要照顧者：____ 主要決策者：＿＿＿</span>
          </td>
        </tr>
        <tr>
          <th>家系圖暨生態圖</th>
          <td colspan="6"></td>
        </tr>
      </table> -->
    </vuestic-widget>
  </div>
</template>
<script>
import Modal from '../vuestic-theme/vuestic-components/vuestic-modal/VuesticModal'
import VuesticWidget from '../vuestic-theme/vuestic-components/vuestic-widget/VuesticWidget'

export default {
  name: 'modals',
  components: {
    Modal, VuesticWidget
  },
  data() {
    return {
      members: [],
      obstacles: [], // 障礙類別
      custom_languages: [], // 慣用語言
      insurances: [], // 保險類型

      marriage: [], // 婚姻狀況
      welfare: [], // 福利

      custom_languages_check: [],

      sick_card: [], // 有無重大傷病卡
      guardian_declaration: [], // 監護宣告

      obstacle_level: [],
      titleWarning: false,
      bodyWarning: false,
      isSave: false,
    }
  },
  methods: {
    showModal () {
      this.$refs.modal.open(); // $refs property name same as in ref="modal"
    },
    showEditModal () {
      this.$refs.editModal.open()
    },
    init() {
      let self = this;
      // 取得個案基本資料
      // axios.get('/api/Member')
      //      .then(response => {
      //         self.members  = response.data;
      //      })
      //      .catch(error => {
      //         console.log(error.response)
      //      });

      // 取得障礙類別
      axios.get('/api/person/PersonObstacleType')
           .then(response => {
              self.obstacles  = response.data;
              console.log(self.obstacles);
           })
           .catch(error => {
              console.log(error.response)
           });
      // 取得慣用語言
      axios.get('/api/person/PersonCustomLanguage')
           .then(response => {
              self.custom_languages = response.data;
              console.log(self.obstacles);
           })
           .catch(error => {
              console.log(error.response)
           });
      // 取得保險類型
      axios.get('/api/person/PersonInsurance')
           .then(response => {
              self.insurances = response.data;
              console.log(self.obstacles);
           })
           .catch(error => {
              console.log(error.response)
           });
    },
    publish() {
      this.titleWarning = (this.member.name.trim().length == 0);
      this.bodyWarning = (this.member.phone.trim().length == 0);
      if (this.titleWarning || this.bodyWarning) return;
      // 
      let self = this;
      console.log(this.member);
      axios.post('/api/member', this.member)
           .then(response => {
              if (response.data['ok']) {
                  self.init();
                  self.titleWarning = false;
                  self.bodyWarning = false;
                  self.member = {id:null, name: '', phone:''};
              }
           })
           .catch(error => {
              console.log(error.response)
           });
    },
    modify(member) {
      location.href = "#form";
      this.member.id = member.id;
      this.member.name = member.name;
      this.member.phone = member.phone;
      this.isSave = true;
      console.log(this.member);
    },
    save() {
      let self = this;
      console.log(this.member.id);
      axios.put('/api/member/' + this.member.id, this.member)
           .then(response => {
              if (response.data['ok']) {
                  self.init();
                  self.isSave = false;
                  self.member = {id:null, name: '', phone:''};
              }
           })
           .catch(error => {
              console.log(error.response)
           });
    },
    cancel() {
      this.member = {id: null, name: '', phone: ''};
      this.isSave = false;
    },
    remove(id) {
      let self = this;
      axios.delete('/api/member/' + id)
           .then(response => {
              if (response.data['ok']) {
                  console.log(id);
                  self.init();
                  self.isSave = false;
                  self.member = {id: null, name: '', phone: ''};
              }
           })
           .catch(error => {
              console.log(error.response)
           });
    }
  },
  mounted() {
    this.init();
  }
}
</script>