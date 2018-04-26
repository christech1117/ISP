<template>
  <div class="content">
    <vuestic-widget class="modals-list larger-padding" :headerText="'部門管理'">
      <div class="top-tool">
        <button class="btn btn-warning btn-with-icon rounded-icon" @click="showModal()">
          <div class="btn-with-icon-content">
            <i class="fas fa-plus"></i>
          </div>
        </button>
      </div>
      <modal :show.sync="show" v-bind:large="true" v-bind:force="true" ref="modal" :cancelText="'取消'" :okText="'新增'">
        <div slot="title">新增部門</div>
        <table border="1" class="table member-modal">
          <tr>
            <th>
              <p>服務類型</p>
              <p>(日間)</p>
            </th>
            <td colspan="7"></td>
          </tr>
          <tr>
            <th>單位名稱</th>
            <td colspan="7"></td>
          </tr>
          <tr>
            <th>方案</th>
            <td colspan="7"></td>
          </tr>
          <tr>
            <th>主責人</th>
            <td colspan="7"></td>
          </tr>
          <tr>
            <th>地址</th>
            <td colspan="7"></td>
          </tr>
          <tr>
            <th>電話</th>
            <td colspan="7"></td>
          </tr>
          <tr>
            <th>房舍類型</th>
            <td colspan="4"></td>
            <th>電梯</th>
            <td colspan="3"></td>
          </tr>
          <tr>
            <th>房舍性質</th>
            <td colspan="4"></td>
            <th>每月租金</th>
            <td colspan="3"></td>
          </tr>
          <tr>
            <th>樓層</th>
            <td colspan="4"></td>
            <th>樓層地板面積</th>
            <td colspan="3"></td>
          </tr>
          <tr>
            <th>客廳數</th>
            <td></td>
            <th>衛浴數</th>
            <td></td>
            <th>房間數</th>
            <td></td>
            <th>床位數</th>
            <td></td>
          </tr>
        </table>
      </modal>
      <table border="1" class="table member-modal text-center">
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
      member: {
        id: null,
        name: '',
        phone: ''
      },
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
      axios.get('/api/member')
           .then(response => {
              self.members  = response.data;
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