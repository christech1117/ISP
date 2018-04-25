<template lang="pug">
.content
  vuestic-widget.modals-list.larger-padding
    button.btn.btn-sm.btn-danger(@click='showModal()')
      | 新增
    modal(:show.sync='show', v-bind:large='true', v-bind:force='true', ref='modal', :cancelText="'取消'", :okText="'新增'")
      div(slot='title') 新增人員
      table.table.member-modal(border="1")
        tr
          th 姓名
          td 
          th 照片
          td 
        tr
          th 就職日期
          td 
          th 工作狀態
          td
            .row
              .col-md-4
                vuestic-checkbox(:label="'在職' | translate", :id="'checkbox1'", v-model='checkboxOneModel')
              .col-md-4
                vuestic-checkbox(:label="'離職' | translate", :id="'checkbox2'", v-model='checkboxTwoModel')
        tr
          th 電話
          td
          th E-mail
          td 
        tr
          th 聯絡住址
          td(colspan="3")
        tr
          th 部門或單位
          td 
          th 職稱
          td 
        tr
          th 方案計畫名稱
          td(colspan="3")
        tr
          th 所屬團隊
          td(colspan="3")
        tr
          th(colspan="4") 權限
        tr
          th 角色
          td(colspan="3")
        tr
          th 審核
          td 
          th 個人收入
          td 
    modal(:show.sync='show', v-bind:large='true', v-bind:force='true', ref='editModal', :cancelclass="'custom-class'", :cancelText="'取消'", :okText="'儲存'")
      div(slot='title') 編輯人員
      table.table.member-modal(border="1")
        tr
          th 姓名
          td 
          th 照片
          td 
        tr
          th 就職日期
          td 
          th 工作狀態
          td 
        tr
          th 電話
          td
          th E-mail
          td 
        tr
          th 聯絡住址
          td(colspan="3")
        tr
          th 部門或單位
          td 
          th 職稱
          td 
        tr
          th 方案計畫名稱
          td(colspan="3")
        tr
          th 所屬團隊
          td(colspan="3")
        tr
          th(colspan="4") 權限
        tr
          th 角色
          td(colspan="3")
        tr
          th 審核
          td 
          th 個人收入
          td 
    table.table.table-striped.table-hover.first-td-padding.text-center
      thead
        tr
          th(scope='col') 姓名
          th(scope='col') 照片
          th(scope='col') 部門
          th(scope='col') 職稱
          th(scope='col') 計畫
          th(scope='col') 團隊
          th(scope='col') 工作狀態
          th(scope='col') 就職日期
          th(scope='col') 
      tbody
        tr(v-for="member in members" :key="member.id" @click='showEditModal()')
          td {{ member.name }}
          td {{ member.avatar }}
          td {{ member.depart_id }}
          td {{ member.work_title }}
          td {{ member.plan_id }}
          td {{ member.team_id }}
          td {{ member.work_status }}
          td {{ member.work_start_date }}
          td
            span(@click='remove(member.id)')
            i.fas.fa-times
//-   i.fas.fa-edit.fa-lg
//-   i.fas.fa-trash.fa-lg
//-   button.btn.btn-xs.btn-primary(@click='modify(member)') 修改
//-   button.btn.btn-xs.btn-danger(@click='remove(member.id)') 刪除
//- form#form
//-     .form-group(:class="{ 'has-warning': titleWarning }")
//-     label.control-label
//-     | 姓名
//-     span(v-if='titleWarning') 不能空白
//-     input.form-control(v-model='member.name')
//-     .form-group(:class="{ 'has-warning': bodyWarning }")
//-     label.control-label
//-     | 手機
//-     span(v-if='bodyWarning') 不能空白
//-     textarea.form-control(v-model='member.phone')
//-     .form-group
//-     div(v-if='isSave')
//-         button.btn.btn-sm.btn-success(@click.prevent='save') 儲存
//-         button.btn.btn-sm.btn-secondary(@click.prevent='cancel') 取消
//-     button.btn.btn-sm.btn-warning(v-else='', @click.prevent='publish') 發佈
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
<style lang="scss" scoped>
@import "../../sass/_variables.scss";
@import "~bootstrap/scss/mixins/breakpoints";
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";

.content {
  padding: 150px 50px 100px 300px;
}
.table-striped > tbody > tr:nth-child(2n+1), .table-striped > tbody > tr:nth-child(2n+1) {
  background-color: $light-orange;
}
.table-striped > tbody > tr {
  &:hover {
    background-color: $theme-orange;
  }
}
.member-modal th {
  width: 140px;
  text-align: center;
}
.member-modal td {
  width: 300px;
}
</style>