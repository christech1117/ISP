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
            <p-check class="p-default p-smooth p-bigger" color="warning" value="obstacles" v-model="service_people">智能障礙者</p-check>
            <p-check class="p-default p-smooth p-bigger" color="warning" value="old" v-model="service_people">植物人</p-check>
            <p-check class="p-default p-smooth p-bigger" color="warning" value="spirit" v-model="service_people">失智症</p-check>
            <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">自閉症</p-check>
            <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">慢性精神病</p-check>
            <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">頑性癲癇症</p-check>
            <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">其他</p-check>
          </td>
        </tr>
        <tr>
          <th>第二大類</th>
          <td colspan="6">
            <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">視覺障礙</p-check>
            <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">聽覺障礙</p-check>
            <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">平衡機能障礙</p-check>
            <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">其他</p-check>
          </td>
        </tr>
        <tr>
          <th>第三大類</th>
          <td colspan="6">
            <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">聲音或語言機能障礙</p-check>
            <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">其他</p-check>
          </td>
        </tr>
        <tr>
          <th>第四大類</th>
          <td colspan="6">
            <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">重要器官失去功能-心臟</p-check>
            <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">重要器官失去功能-造血機能</p-check>
            <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">重要器官失去功能-呼吸器官</p-check>
            <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">其他</p-check>
          </td>
        </tr>
        <tr>
          <th>第五大類</th>
          <td colspan="6">
            <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">重要器官失去功能-吞嚥機能</p-check>
            <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">重要器官失去功能-胃</p-check>
            <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">重要器官失去功能-肝臟</p-check>
            <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">其他</p-check>
          </td>
        </tr>
        <tr>
          <th>第六大類</th>
          <td colspan="6">
            <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">重要器官失去功能-腎臟</p-check>
            <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">重要器官失去功能-膀胱</p-check>
            <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">其他</p-check>
          </td>
        </tr>
        <tr>
          <th>第七大類</th>
          <td colspan="6">
            <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">肢體障礙</p-check>
            <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">其他</p-check>            
          </td>
        </tr>
        <tr>
          <th>第八大類</th>
          <td colspan="6">
            <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">顏面損傷</p-check>
            <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">其他</p-check>    
          </td>
        </tr>
        <tr>
          <td colspan="6">
            <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">多重障礙者</p-check>
            <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">罕見疾病</p-check>
            <vuestic-checkbox :label="'多重障礙者'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
            <vuestic-checkbox :label="'罕見疾病'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
            <span>其他經中央衛生主管機關認定之障礙者(</span>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'先天代謝異常'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'染色體異常'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'先天性缺陷'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
            <span>)</span>
          </td>
        </tr>
        <tr>
          <th>障礙等級</th>
          <td colspan="6">
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio1" value="option1">
              <label class="form-check-label" for="inlineRadio1">輕度</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio2" value="option2">
              <label class="form-check-label" for="inlineRadio2">中度</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio2" value="option2">
              <label class="form-check-label" for="inlineRadio2">重度</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio2" value="option2">
              <label class="form-check-label" for="inlineRadio2">極重度</label>
            </div>
          </td>
        </tr>
        <tr>
          <th>慣用語言</th>
          <td colspan="6">
            <div class="d-inline-block">
              <vuestic-checkbox :label="'國語'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
            </div>
            <div class="d-inline-block">
              <vuestic-checkbox :label="'臺語'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
            </div>
            <div class="d-inline-block">
              <vuestic-checkbox :label="'客家話'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
            </div>
            <div class="d-inline-block">
              <vuestic-checkbox :label="'原住民語'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
            </div>
            <div class="d-inline-block">
              <vuestic-checkbox :label="'手語'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
            </div>
            <div class="d-inline-block">
              <vuestic-checkbox :label="'其他'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
            </div>
          </td>
        </tr>
        <tr>
          <th>婚姻狀況</th>
          <td colspan="6">
            <div class="d-inline-block">
              <vuestic-checkbox :label="'未婚'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
            </div>
            <div class="d-inline-block">
              <vuestic-checkbox :label="'已婚'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
            </div>
            <div class="d-inline-block">
              <vuestic-checkbox :label="'其他'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
            </div>
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
                <div class="d-inline-block">
                  <vuestic-checkbox :label="'一般戶'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </div>
                <div class="d-inline-block">
                  <vuestic-checkbox :label="'中低收入戶'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </div>
                <div class="d-inline-block">
                  <vuestic-checkbox :label="'低收入戶第 款'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </div>
              </li>
              <li>
                <span>保險：</span>
                <div class="d-inline-block">
                  <vuestic-checkbox :label="'勞保'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </div>
                <div class="d-inline-block">
                  <vuestic-checkbox :label="'公保'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </div>
                <div class="d-inline-block">
                  <vuestic-checkbox :label="'榮保'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </div>
                <div class="d-inline-block">
                  <vuestic-checkbox :label="'福保'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </div>
                <div class="d-inline-block">
                  <vuestic-checkbox :label="'農/漁保'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </div>
                <div class="d-inline-block">
                  <vuestic-checkbox :label="'國保'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </div>
                <div class="d-inline-block">
                  <vuestic-checkbox :label="'健保'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </div>
                <div class="d-inline-block">
                  <vuestic-checkbox :label="'其他'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </div>
              </li>
              <li>
                <span>有無重大傷病卡：</span>
                <div class="d-inline-block">
                  <vuestic-checkbox :label="'無'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </div>
                <div class="d-inline-block">
                  <vuestic-checkbox :label="'有'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </div>
              </li>
              <li>
                <span>監護宣告：</span>
                <div class="d-inline-block">
                  <vuestic-checkbox :label="'無'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </div>
                <div class="d-inline-block">
                  <vuestic-checkbox :label="'有'" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
                </div>
              </li>
            </ul>
          </td>
        </tr>
        <tr>
          <th>個案來源</th>
          <td colspan="6">
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
          </td>
        </tr>
      </table>
      <h5>二、家庭狀況</h5>
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
      </table>
    </vuestic-widget>
  </div>
</template>
<script>
import Modal from '../vuestic-theme/vuestic-components/vuestic-modal/VuesticModal'
import VuesticWidget from '../vuestic-theme/vuestic-components/vuestic-widget/VuesticWidget'
import VuesticCheckbox from '../vuestic-theme/vuestic-components/vuestic-checkbox/VuesticCheckbox'

export default {
  name: 'modals',
  components: {
    Modal, VuesticWidget, VuesticCheckbox
  },
  data() {
    return {
      members: [],
      obstacles: [],
      titleWarning: false,
      bodyWarning: false,
      isSave: false,
      checkboxOneModel: false,
      checkboxTwoModel: false,
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
      axios.get('/api/PersonObstacleType')
           .then(response => {
              self.obstacles  = response.data;
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