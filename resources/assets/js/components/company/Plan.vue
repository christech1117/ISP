<template>
  <div class="content">
    <vuestic-widget class="modals-list larger-padding" :headerText="'方案管理'">
      <div class="top-tool">
        <button class="btn btn-warning btn-with-icon rounded-icon" @click="showModal()">
          <div class="btn-with-icon-content">
            <i class="fas fa-plus"></i>
          </div>
        </button>
      </div>
      <modal :show.sync="show" v-bind:large="true" v-bind:force="true" ref="modal" :cancelText="'取消'" :okText="'新增'">
        <div slot="title">新增方案</div>
        <table border="1" class="table member-modal">
          <tr>
            <th>方案計畫名稱</th>
            <td colspan="3"></td>
          </tr>
          <tr>
            <th>服務據點名稱</th>
            <td colspan="3"></td>
          </tr>
          <tr>
            <th>計畫承辦人</th>
            <td colspan="3"></td>
          </tr>
          <tr>
            <th>電話</th>
            <td colspan="3"></td>
          </tr>
          <tr>
            <th>Email</th>
            <td colspan="3"></td>
          </tr>
          <tr>
            <th>服務開辦日期</th>
            <td></td>
            <th>服務結束日期</th>
            <td></td>
          </tr>
          <tr>
            <th>服務時間</th>
            <td colspan="3"></td>
          </tr>
          <tr>
            <th>服務人數(最多)</th>
            <td colspan="3"></td>
          </tr>
          <tr>
            <th>收費(每月)</th>
            <td colspan="3"></td>
          </tr>
          <tr>
            <th>說明</th>
            <td colspan="3"></td>
          </tr>
        </table>
      </modal>
      <div class="sets-list row">
        <div class="col-md-12">
          <div class="row">
            <div class="small-set col-lg-3">
              <div class="set-content">
                <tree-view-basic-preview/>
              </div>
            </div>
            <div class="small-set col-lg-3">
              <div class="set-content">
                <tree-view-basic-preview/>
              </div>
            </div>
            <div class="small-set col-lg-3">
              <div class="set-content">
                <tree-view-basic-preview/>
              </div>
            </div>
            <div class="small-set col-lg-3">
              <div class="set-content">
                <tree-view-basic-preview/>
              </div>
            </div>
            <div class="small-set col-lg-3">
              <div class="set-content">
                <tree-view-basic-preview/>
              </div>
            </div>
            <div class="small-set col-lg-3">
              <div class="set-content">
                <tree-view-basic-preview/>
              </div>
            </div>
            <div class="small-set col-lg-3">
              <div class="set-content">
                <tree-view-basic-preview/>
              </div>
            </div>
            <div class="small-set col-lg-3">
              <div class="set-content">
                <tree-view-basic-preview/>
              </div>
            </div>
            <div class="small-set col-lg-3">
              <div class="set-content">
                <tree-view-basic-preview/>
              </div>
            </div>
            <div class="small-set col-lg-3">
              <div class="set-content">
                <tree-view-basic-preview/>
              </div>
            </div>
            <div class="small-set col-lg-3">
              <div class="set-content">
                <tree-view-basic-preview/>
              </div>
            </div>
          </div>
        </div>
      </div>
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