<template>
  <div id="department" class="content">
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
        <form class="form-inline">
          <label class="my-1 mr-2" for="inlineFormCustomSelectPref">選擇服務單位資料類型</label>
          <select class="custom-select my-1 mr-sm-2" id="inlineFormCustomSelectPref" v-model="selected">
            <option value="day" selected>日間</option>
            <option value="live">居住</option>
            <option value="job">就業</option>
          </select>
        </form>
        <table border="1" class="table day" v-if="selected === 'day'">
          <tr>
            <th>服務類型</th>
            <td>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'日間照顧' | translate" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'日間活動(含休閒、工作)' | translate" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'社區日間作業設施' | translate" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'小組工作安置' | translate" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'其他' | translate" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
            </td>
          </tr>
          <tr>
            <th>單位名稱</th>
            <td></td>
          </tr>
          <tr>
            <th>方案</th>
            <td></td>
          </tr>
          <tr>
            <th>主責人</th>
            <td></td>
          </tr>
          <tr>
            <th>地址</th>
            <td></td>
          </tr>
          <tr>
            <th>電話</th>
            <td></td>
          </tr>
        </table>
        <table border="1" class="table live" v-else-if="selected === 'live'">
          <tr>
            <th>服務類型</th>
            <td colspan="7">
              <div class="d-inline-block">
                <vuestic-checkbox :label="'大型機構(>200人)' | translate" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'小型機構(30人~200人)' | translate" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'夜間型住宿機構（<29人）' | translate" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'社區居住(<6人)' | translate" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'與家人同住' | translate" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'自己在外面居住' | translate" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'其他' | translate" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
            </td>
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
            <td colspan="4">
              <div class="d-inline-block">
                <vuestic-checkbox :label="'透天' | translate" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'公寓' | translate" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'大廈' | translate" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'其他' | translate" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
            </td>
            <th>電梯</th>
            <td colspan="3">
              <div class="d-inline-block">
                <vuestic-checkbox :label="'有' | translate" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'無' | translate" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
            </td>
          </tr>
          <tr>
            <th>房舍性質</th>
            <td colspan="4">
              <div class="d-inline-block">
                <vuestic-checkbox :label="'自有' | translate" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'租用' | translate" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'公部門提供' | translate" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'財團法人' | translate" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'社團法人' | translate" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
              <div class="d-inline-block">
                <vuestic-checkbox :label="'其他' | translate" :id="'checkbox1'" v-model="checkboxOneModel"></vuestic-checkbox>
              </div>
            </td>
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
        <table border="1" class="table job" v-else-if="selected === 'job'">
          <tr>
            <th>服務類型</th>
            <td></td>
          </tr>
          <tr>
            <th>單位名稱</th>
            <td></td>
          </tr>
          <tr>
            <th>方案</th>
            <td></td>
          </tr>
          <tr>
            <th>主責人</th>
            <td></td>
          </tr>
          <tr>
            <th>地址</th>
            <td></td>
          </tr>
          <tr>
            <th>電話</th>
            <td></td>
          </tr>
          <tr>
            <th>工作時間</th>
            <td></td>
          </tr>
          <tr>
            <th>工作時數</th>
            <td></td>
          </tr>
          <tr>
            <th>工資</th>
            <td></td>
          </tr>
          <tr>
            <th>工作內容</th>
            <td></td>
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
      selected: 'day',
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