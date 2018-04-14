<template>
    <div class="content">
        <div v-for="user in users" :key="user.id">
            <h1>{{ user.name }}</h1>
            <p>{{ user.avatar }}</p>
            <p>{{ user.work_start_date }}</p>
            <p>{{ user.work_status }}</p>
            <p>{{ user.phone }}</p>
            <p>{{ user.email }}</p>
            <button class="btn btn-xs btn-primary" @click="modify(user)">修改</button>
            <button class="btn btn-xs btn-danger" @click="remove(user.id)">刪除</button>
            <hr>
        </div>
        <form id="form">
            <div class="form-group" :class="{ 'has-warning': titleWarning }">
                <label class="control-label">姓名
                    <span v-if="titleWarning">不能空白</span>
                </label>
                <input class="form-control" v-model="user.name">
            </div>
            <div class="form-group" :class="{ 'has-warning': bodyWarning }">
                <label class="control-label">手機
                    <span v-if="bodyWarning">不能空白</span>
                </label>
                <textarea class="form-control" v-model="user.phone"></textarea>
            </div>
            <div class="form-group">
                <div v-if="isSave">
                    <button @click.prevent="save">儲存</button>
                    <button @click.prevent="cancel">取消</button>
                </div>
                <button v-else @click.prevent="publish">發佈</button>
            </div>
        </form>
    </div>
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
<style scoped>
    .content {
        padding: 20px;
    }
</style>