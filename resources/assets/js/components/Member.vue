<template lang="pug">
.content
    vuestic-widget.modals-list.larger-padding()
        button.btn.btn-sm.btn-danger(@click='showModal()')
            | 新增
        modal(:show.sync='show', v-bind:large='true', v-bind:force='true', ref='modal', :cancelclass="'custom-class'", :cancelText="'取消'", :okText="'儲存'")
            div(slot='title') 新增人員
            table.table(border="1")
                tr
                    td 姓名
                    td 
                    td 照片
                    td 
                tr
                    td 就職日期
                    td 
                    td 工作狀態
                    td 
                tr
                    td 電話
                    td
                    td E-mail
                    td 
                tr
                    td 聯絡住址
                    td(colspan="3")
                tr
                    td 部門或單位
                    td 
                    td 職稱
                    td 
                tr
                    td 方案計畫名稱
                    td(colspan="3")
                tr
                    td 所屬團隊
                    td(colspan="3")
                tr
                    td(colspan="4") 權限
                tr
                    td 角色
                    td(colspan="3")
                tr
                    td 審核
                    td 
                    td 個人收入
                    td 
        table.table.table-hover
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
            tbody(v-for="member in members" :key="member.id")
                tr(@click='modify(member)')
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
        form#form
            .form-group(:class="{ 'has-warning': titleWarning }")
            label.control-label
            | 姓名
            span(v-if='titleWarning') 不能空白
            input.form-control(v-model='member.name')
            .form-group(:class="{ 'has-warning': bodyWarning }")
            label.control-label
            | 手機
            span(v-if='bodyWarning') 不能空白
            textarea.form-control(v-model='member.phone')
            .form-group
            div(v-if='isSave')
                button.btn.btn-xs.btn-success(@click.prevent='save') 儲存
                button.btn.btn-xs.btn-secondary(@click.prevent='cancel') 取消
            button.btn.btn-sm.btn-warning(v-else='', @click.prevent='publish') 發佈
</template>
<script>
import Modal from './vuestic-theme/vuestic-components/vuestic-modal/VuesticModal'
import VuesticWidget from './vuestic-theme/vuestic-components/vuestic-widget/VuesticWidget'

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
            this.$refs.modal.open() // $refs property name same as in ref="modal"
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
            axios.post('/api/members', this.member)
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
            axios.put('/api/members/' + this.member.id, this.member)
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
            axios.delete('/api/members/' + id)
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
<style lang="sass" scoped>
    .content
        padding: 150px 50px 100px 300px
</style>