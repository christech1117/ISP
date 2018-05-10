<template>
  <div class="content">
    <vuestic-widget class="modals-list larger-padding" :headerText="'組織基本資料'">
      <div class="top-tool">
        <button class="btn btn-warning btn-with-icon rounded-icon" @click="showModal()">
          <div class="btn-with-icon-content">
            <i class="fas fa-pencil-alt"></i>
          </div>
        </button>
      </div>
      <modal :show.sync="show" v-bind:large="true" v-bind:force="true" ref="modal" :cancelText="'取消'" :okText="'新增'">
        <div slot="title">編輯組織基本資料</div>
        <table border="1" class="table" v-for="item in items" :key="item.id">
          <tr>
            <th>組織\單位名稱</th>
            <td colspan="3">
              <input v-model="item.company_name" class="form-control" />
            </td>
          </tr>
          <tr>
            <th>聯絡人姓名</th>
            <td>
              <input v-model="item.member_id" class="form-control" />
            </td>
            <th>電話</th>
            <td>
              <input v-model="item.tel" class="form-control" />
            </td>
          </tr>
          <tr>
            <th>Email</th>
            <td colspan="3">
              <input v-model="item.email" class="form-control" />
            </td>
          </tr>
          <tr colspan="4">
            <th>服務地區類別</th>
            <td colspan="3">
              <p-radio class="p-default p-smooth p-bigger" color="warning" value="city" v-model="service_area">都市</p-radio>
              <p-radio class="p-default p-smooth p-bigger" color="warning" value="suburbs" v-model="service_area">郊區</p-radio>
              <p-radio class="p-default p-smooth p-bigger" color="warning" value="complex" v-model="service_area">綜合</p-radio>
            </td>
          </tr>
          <tr>
            <th>服務人數</th>
            <td>
              <input type="number" v-model="item.user_count" class="form-control" />
            </td>
            <th>全職人員數量</th>
            <td>
              <input type="number" v-model="item.member_count" class="form-control" />
            </td>
          </tr>
          <tr>
            <th>服務對象類型</th>
            <td colspan="3">
              <p-check class="p-default p-smooth p-bigger" color="warning" value="obstacles" v-model="service_people">智能/發展障礙</p-check>
              <p-check class="p-default p-smooth p-bigger" color="warning" value="old" v-model="service_people">高齡</p-check>
              <p-check class="p-default p-smooth p-bigger" color="warning" value="spirit" v-model="service_people">精神/行為健康</p-check>
              <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">特殊教育</p-check>
              其他<input class="v-form-group" required/>
            </td>
          </tr>
          <tr>
            <th>服務對象年齡層百分比</th>
            <td colspan="3">
              <div class="v-form-group">
                <!-- <div class="v-input-group"> -->
                    兒童 0 ~ 12 歲：<input id="simple-input" required/>
                    <label class="control-label" for="simple-input"></label><i class="bar"></i>
                <!-- </div> -->
              </div>
              <p>青少年 13 ~ 18 歲：<input class="" required/></p>
              <p>高齡 65+ 歲：<input class="v-form-group" required/></p>
              <p>成人 19 ~ 65 歲：<input class="v-form-group" required/></p>
            </td>
          </tr>
          <tr>
            <th>年度預算</th>
            <td colspan="3">
              <input v-model="item.budget" class="form-control" />
            </td>
          </tr>
          <tr>
            <th>組織服務內容</th>
            <td colspan="3">
              <ol>
                <li>
                  <span>居住 ➔</span>
                  <!-- <p-check class="p-default p-smooth p-bigger" color="warning" value="a" v-model="service_content">居住 ➔</p-check> -->
                  <p-radio class="p-default p-smooth p-bigger" color="warning" value="large" v-model="live">大型機構(>200人)</p-radio>
                  <p-radio class="p-default p-smooth p-bigger" color="warning" value="small" v-model="live">小型機構(30人~200人)</p-radio>
                  <p-radio class="p-default p-smooth p-bigger" color="warning" value="night" v-model="live">夜間型住宿機構(&lt;29人)</p-radio>
                  <p-radio class="p-default p-smooth p-bigger" color="warning" value="community" v-model="live">社區居住(&lt;6人)</p-radio>
                  {{ service_content_live }}
                </li>
                <li>
                  <p-check class="p-default p-smooth p-bigger" color="warning" value="daytime" v-model="daytime">日間活動</p-check>
                </li>
                <li>
                  <span>就業 ➔</span>
                  <!-- <p-check class="p-default p-smooth p-bigger" color="warning" value="c" v-model="service_content">就業 ➔</p-check> -->
                  <p-radio class="p-default p-smooth p-bigger" color="warning" value="Sheltered" v-model="job">庇護性就業</p-radio>
                  <p-radio class="p-default p-smooth p-bigger" color="warning" value="Supportive" v-model="job">支持性就業</p-radio>
                  {{ service_content_job }}
                </li>
                <li>
                  <p-check class="p-default p-smooth p-bigger" color="warning" value="education" v-model="education">教育(學校)</p-check>
                </li>
                <li>
                  <span>其他</span>
                </li>
              </ol>
            </td>
          </tr>
        </table>
      </modal>
      <table border="1" class="table text-center" v-for="item in items" :key="item.id">
        <tr>
          <th>組織\單位名稱</th>
          <td colspan="3">{{ item.company_name }}</td>
        </tr>
        <tr>
          <th>聯絡人姓名</th>
          <td>{{ item.member_id }}</td>
          <th>電話</th>
          <td>{{ item.tel }}</td>
        </tr>
        <tr>
          <th>Email</th>
          <td colspan="3">{{ item.email }}</td>
        </tr>
        <tr colspan="4">
          <th>服務地區類別</th>
          <td colspan="3">
            <p-radio class="p-default p-smooth p-bigger" color="warning" value="city" v-model="service_area">都市</p-radio>
            <p-radio class="p-default p-smooth p-bigger" color="warning" value="suburbs" v-model="service_area">郊區</p-radio>
            <p-radio class="p-default p-smooth p-bigger" color="warning" value="complex" v-model="service_area">綜合</p-radio>
            {{ service_area }}
          </td>
        </tr>
        <tr>
          <th>服務人數</th>
          <td>{{ item.user_count }}</td>
          <th>全職人員數量</th>
          <td>{{ item.member_count }}</td>
        </tr>
        <tr>
          <th>服務對象類型</th>
          <td colspan="3">
            <p-check class="p-default p-smooth p-bigger" color="warning" value="obstacles" v-model="service_people">智能/發展障礙</p-check>
            <p-check class="p-default p-smooth p-bigger" color="warning" value="old" v-model="service_people">高齡</p-check>
            <p-check class="p-default p-smooth p-bigger" color="warning" value="spirit" v-model="service_people">精神/行為健康</p-check>
            <p-check class="p-default p-smooth p-bigger" color="warning" value="Special" v-model="service_people">特殊教育</p-check>
              其他<input class="v-form-group" required/>
              {{ service_people }}
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
          <td colspan="3">{{ item.budget }}</td>
        </tr>
        <tr>
          <th>組織服務內容</th>
          <td colspan="3">
            <ol>
              <li>
                <span>居住 ➔</span>
                <!-- <p-check class="p-default p-smooth p-bigger" color="warning" value="a" v-model="service_content">居住 ➔</p-check> -->
                <p-radio class="p-default p-smooth p-bigger" color="warning" value="large" v-model="live">大型機構(>200人)</p-radio>
                <p-radio class="p-default p-smooth p-bigger" color="warning" value="small" v-model="live">小型機構(30人~200人)</p-radio>
                <p-radio class="p-default p-smooth p-bigger" color="warning" value="night" v-model="live">夜間型住宿機構(&lt;29人)</p-radio>
                <p-radio class="p-default p-smooth p-bigger" color="warning" value="community" v-model="live">社區居住(&lt;6人)</p-radio>
                {{ service_content_live }}
              </li>
              <li>
                <p-check class="p-default p-smooth p-bigger" color="warning" value="daytime" v-model="daytime">日間活動</p-check>
              </li>
              <li>
                <span>就業 ➔</span>
                <!-- <p-check class="p-default p-smooth p-bigger" color="warning" value="c" v-model="service_content">就業 ➔</p-check> -->
                <p-radio class="p-default p-smooth p-bigger" color="warning" value="Sheltered" v-model="job">庇護性就業</p-radio>
                <p-radio class="p-default p-smooth p-bigger" color="warning" value="Supportive" v-model="job">支持性就業</p-radio>
                {{ service_content_job }}
              </li>
              <li>
                <p-check class="p-default p-smooth p-bigger" color="warning" value="education" v-model="education">教育(學校)</p-check>
              </li>
              <li>
                <span>其他</span>
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
      items: [],
      item: {
        id: null,
        name: '',
        phone: ''
      },
      titleWarning: false,
      bodyWarning: false,
      isSave: false,
      service_people: [],
      live: [], // 居住
      daytime: false, // 日間活動
      job: [], // 就業
      education: false, // 教育
      service_area: []
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
      const id = 1;
      axios.get('/api/company/basic')
           .then(response => {
              self.items  = response.data;
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