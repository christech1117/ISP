<template>
  <div id="member" class="content">
    <vuestic-widget class="modals-list larger-padding" :headerText="'人員管理'">
      <div class="top-tool">
        <button class="btn btn-warning btn-with-icon rounded-icon" @click="showModal()">
          <div class="btn-with-icon-content">
            <i class="fas fa-plus"></i>
          </div>
        </button>
      </div>
      <modal :show.sync="show" v-bind:large="true" v-bind:force="true" ref="modal" :cancelText="'取消'" :okText="'新增'">
        <div slot="title">新增人員</div>
        <table border="1" class="table">
          <tr>
            <th>姓名</th>
            <td> </td>
            <th>照片</th>
            <td> </td>
          </tr>
          <tr>
            <th>就職日期</th>
            <td> </td>
            <th>工作狀態</th>
            <td>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'在職' | translate" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'離職' | translate" :id="'checkbox2'" v-model="checkboxTwoModel"></vuestic-checkbox>
              </div>
            </td>
          </tr>
          <tr>
            <th>電話</th>
            <td></td>
            <th>E-mail</th>
            <td> </td>
          </tr>
          <tr>
            <th>聯絡住址</th>
            <td colspan="3"></td>
          </tr>
          <tr>
            <th>部門或單位</th>
            <td> </td>
            <th>職稱</th>
            <td> </td>
          </tr>
          <tr>
            <th>方案計畫名稱</th>
            <td colspan="3"></td>
          </tr>
          <tr>
            <th>所屬團隊</th>
            <td colspan="3"></td>
          </tr>
          <tr>
            <th colspan="4">權限</th>
          </tr>
          <tr>
            <th>角色</th>
            <td colspan="3">
              <div class="d-inline-block">
                <!-- <vuestic-checkbox :label="'組織管理員' | translate" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox> -->
                  <div class="radio abc-radio abc-radio-primary">
                    <input type="radio" name="radio1" id="radio1" value="option1" checked>
                    <label for="radio1">
                          <span class="abc-label-text">Radio</span>
                    </label>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <th>審核</th>
            <td> </td>
            <th>個人收入</th>
            <td> </td>
          </tr>
        </table>
      </modal>
      <modal :show.sync="show" v-bind:large="true" v-bind:force="true" ref="editModal" :cancelclass="'custom-class'" :cancelText="'取消'" :okText="'儲存'">
        <div slot="title">編輯人員</div>
        <table border="1" class="table">
          <tr>
            <th>姓名</th>
            <td> </td>
            <th>照片</th>
            <td> </td>
          </tr>
          <tr>
            <th>就職日期</th>
            <td> </td>
            <th>工作狀態</th>
            <td> </td>
          </tr>
          <tr>
            <th>電話</th>
            <td></td>
            <th>E-mail</th>
            <td> </td>
          </tr>
          <tr>
            <th>聯絡住址</th>
            <td colspan="3"></td>
          </tr>
          <tr>
            <th>部門或單位</th>
            <td> </td>
            <th>職稱</th>
            <td> </td>
          </tr>
          <tr>
            <th>方案計畫名稱</th>
            <td colspan="3"></td>
          </tr>
          <tr>
            <th>所屬團隊</th>
            <td colspan="3"></td>
          </tr>
          <tr>
            <th colspan="4">權限</th>
          </tr>
          <tr>
            <th>角色</th>
            <td colspan="3"></td>
          </tr>
          <tr>
            <th>審核</th>
            <td> </td>
            <th>個人收入</th>
            <td> </td>
          </tr>
        </table>
      </modal>
      <table class="table table-striped table-hover first-td-padding text-center">
        <thead>
          <tr>
            <th scope="col">姓名</th>
            <th scope="col">照片</th>
            <th scope="col">部門</th>
            <th scope="col">職稱</th>
            <th scope="col">計畫</th>
            <th scope="col">團隊</th>
            <th scope="col">工作狀態</th>
            <th scope="col">就職日期</th>
            <th scope="col"> </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in members" :key="member.id" @click="showEditModal()">
            <td>{{ member.name }}</td>
            <td>{{ member.avatar }}</td>
            <td>{{ member.depart_id }}</td>
            <td>{{ member.work_title }}</td>
            <td>{{ member.plan_id }}</td>
            <td>{{ member.team_id }}</td>
            <td>{{ member.work_status }}</td>
            <td>{{ member.work_start_date }}</td>
            <td>
              <i class="fas fa-times" @click="remove(member.member_id)"></i>
            </td>
          </tr>
        </tbody>
      </table>
<!-- <form id="form">
<div :class="{ 'has-warning': titleWarning }" class="form-group"></div>
<label class="control-label"></label>姓名<span v-if="titleWarning">不能空白</span>
<input v-model="member.name" class="form-control"/>
<div :class="{ 'has-warning': bodyWarning }" class="form-group"></div>
<label class="control-label"></label>手機<span v-if="bodyWarning">不能空白</span>
<textarea v-model="member.phone" class="form-control"></textarea>
<div class="form-group"></div>
<div v-if="isSave">
<button @click.prevent="save" class="btn btn-sm btn-success">儲存</button>
<button @click.prevent="cancel" class="btn btn-sm btn-secondary">取消</button>
</div>
<button v-else="" @click.prevent="publish" class="btn btn-sm btn-warning">發佈</button>
</form> -->
    </vuestic-widget>
  </div>
</template>
<script>
import Modal from './vuestic-theme/vuestic-components/vuestic-modal/VuesticModal'
import VuesticWidget from './vuestic-theme/vuestic-components/vuestic-widget/VuesticWidget'
import VuesticCheckbox from './vuestic-theme/vuestic-components/vuestic-checkbox/VuesticCheckbox'

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
      checkboxTwoModel: true,
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
    remove(member_id) {
      let self = this;
      axios.delete('/api/member/' + member_id)
           .then(response => {
              if (response.data['ok']) {
                  console.log(member_id);
                  self.init();
                  self.isSave = false;
                  self.member = {member_id: null, name: '', phone: ''};
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