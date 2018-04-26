<template lang="pug">
.content
  vuestic-widget.modals-list.larger-padding
    button.btn.btn-sm.btn-danger(@click='showModal()')
      | 新增
    modal(:show.sync='show', v-bind:large='true', v-bind:force='true', ref='modal', :cancelText="'取消'", :okText="'新增'")
      div(slot='title') 新增人員
      table.table.member-modal(border="1")
        tr
          th 組織\單位名稱
          td(colspan="3")
        tr
          th 聯絡人姓名
          td 
          th 電話
          td 
        tr
          th Email
          td(colspan="3")
        tr(colspan="4")
          th 服務地區類別
          td(colspan="3")
        tr
          th 服務人數
          td 
          th 全職人員數量
          td 
        tr
          th 服務對方類型
          td(colspan="3")
        tr
          th 服務對象年齡層百分比
          td(colspan="3")
        tr
          th 年度預算
          td(colspan="3")
        tr
          th 組織服務內容
          td(colspan="3")
    table.table.member-modal.text-center(border="1")
      tr
        th 組織\單位名稱
        td(colspan="3")
      tr
        th 聯絡人姓名
        td 
        th 電話
        td 
      tr
        th Email
        td(colspan="3")
      tr(colspan="4")
        th 服務地區類別
        td(colspan="3")
      tr
        th 服務人數
        td 
        th 全職人員數量
        td 
      tr
        th 服務對方類型
        td(colspan="3")
      tr
        th 服務對象年齡層百分比
        td(colspan="3")
      tr
        th 年度預算
        td(colspan="3")
      tr
        th 組織服務內容
        td(colspan="3")
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
      member: {
        id: null,
        name: '',
        phone: ''
      },
      titleWarning: false,
      bodyWarning: false,
      isSave: false
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
@import "../../../sass/_variables.scss";
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
</style>