<template lang="pug">
.content
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
    tbody(v-for="user in users" :key="user.id")
      tr(@click='modify(user)')
        td {{ user.name }}
        td {{ user.avatar }}
        td {{ user.departid }}
        td {{ user.work_title }}
        td {{ user.planid }}
        td {{ user.teamid }}
        td {{ user.work_status }}
        td {{ user.work_start_date }}
        td
          span(@click='remove(user.id)')
            i.fas.fa-times
          //-   i.fas.fa-edit.fa-lg
          //-   i.fas.fa-trash.fa-lg
          //-   button.btn.btn-xs.btn-primary(@click='modify(user)') 修改
        //-   button.btn.btn-xs.btn-danger(@click='remove(user.id)') 刪除
  form#form
    .form-group(:class="{ 'has-warning': titleWarning }")
    label.control-label
    | 姓名
    span(v-if='titleWarning') 不能空白
    input.form-control(v-model='user.name')
    .form-group(:class="{ 'has-warning': bodyWarning }")
    label.control-label
    | 手機
    span(v-if='bodyWarning') 不能空白
    textarea.form-control(v-model='user.phone')
    .form-group
    div(v-if='isSave')
        button.btn.btn-xs.btn-success(@click.prevent='save') 儲存
        button.btn.btn-xs.btn-secondary(@click.prevent='cancel') 取消
    button.btn.btn-xs.btn-success(v-else='', @click.prevent='publish') 發佈
</template>
<script>
export default {
    data() {
        return {
            users: [],
            user: {
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
        init() {
            let self = this;
            axios.get('/api/users')
                .then(response => {
                    self.users  = response.data;
                })
                .catch(error => {
                    console.log(error.response)
                });
        },
        publish() {
            this.titleWarning = (this.user.name.trim().length == 0);
            this.bodyWarning = (this.user.phone.trim().length == 0);
            if (this.titleWarning || this.bodyWarning) return;
            // 
            let self = this;
            console.log(this.user);
            axios.post('/api/users', this.user)
                .then(response => {
                    if (response.data['ok']) {
                        self.init();
                        self.titleWarning = false;
                        self.bodyWarning = false;
                        self.user = {id:null, name: '', phone:''};
                    }
                })
                .catch(error => {
                    console.log(error.response)
                });
        },
        modify(user) {
            location.href = "#form";
            this.user.id = user.id;
            this.user.name = user.name;
            this.user.phone = user.phone;
            this.isSave = true;
            console.log(this.user);
        },
        save() {
            let self = this;
            axios.put('/api/users/' + this.user.id, this.user)
                .then(response => {
                    if (response.data['ok']) {
                        self.init();
                        self.isSave = false;
                        self.user = {id:null, name: '', phone:''};
                    }
                })
                .catch(error => {
                    console.log(error.response)
                });
        },
      
        cancel() {
            this.user = {id: null, name: '', phone: ''};
            this.isSave = false;
        },
        remove(id) {
            let self = this;
            axios.delete('/api/users/' + id)
                .then(response => {
                    if (response.data['ok']) {
                        console.log(id);
                        self.init();
                        self.isSave = false;
                        self.user = {id: null, name: '', phone: ''};
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
        padding: 100px 50px 100px 300px
</style>