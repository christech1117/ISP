<template>
  <aside class="sidebar">
    <div class="scrollbar-content">
      <ul class="sidebar-menu">
        <li v-for="item in sideBarMenus" :key="item.name">
          <a :href="item.path"
            class="sidebar-link"
            v-if="item.path">
            <i class="sidebar-menu-item-icon" :class="item.icon"></i>
            {{ item.title }}
          </a>
          <a href="#"
             @click.prevent="toggleMenuItem(item)"
             class="sidebar-link"
             v-else>
            <i class="sidebar-menu-item-icon" :class="item.icon"></i>
            {{ item.title }}
            <i class="expand-icon fa fa-angle-down"></i>
          </a>
          <expanding>
            <ul class="sidebar-submenu in" v-show="item.expanded">
              <li v-for="childItem in item.children" :key="childItem.name">
                <a :href="childItem.path"
                  class="sidebar-link sidebar-submenu-link">
                  <i class="sidebar-menu-item-icon"
                     :class="childItem.icon"
                     v-if="childItem.icon"
                  ></i>
                  {{ childItem.title }}
                </a>
              </li>
            </ul>
          </expanding>
        </li>
      </ul>
    </div>

  </aside>
</template>

<script>
// import { mapGetters, mapActions } from 'vuex'
import Expanding from 'vue-bulma-expanding/src/Expanding'

export default {
  data () {
    return {
      sideBarMenus: [
        {
          "icon": "fas fa-database fa-lg",
          "path": "/dashboard",
          "title": "總覽"
        },
        {
          "icon": "fas fa-address-book fa-lg",
          "path": "/member",
          "title": "人員管理"
        },
        {
          "icon": "fas fa-building fa-lg",
          "title": "組織管理",
          "expanded": false,
          "children": [
            {
              "path": "/company/basic",
              "title": "組織基本資料"
            },
            {
              "path": "/company/department",
              "title": "部門管理"
            },
            {
              "path": "/company/plan",
              "title": "方案管理"
            },
            {
              "path": "/company/files",
              "title": "檔案管理"
            }
          ]
        },
        {
          "icon": "fas fa-user fa-lg",
          "title": "個人層級",
          "expanded": false,
          "children": [
            {
              "path": "/person/personbasic",
              "title": "基本資料"
            },
            {
              "path": "/person/sis",
              "title": "支持強度強表(SIS)"
            },
            {
              "path": "/person/mysupportplan",
              "title": "我的支持計畫"
            },
            {
              "path": "/person/supportplan",
              "title": "個別化支持計畫"
            },
            {
              "path": "/person/mettingrecord",
              "title": "ISP會議記錄"
            },
            {
              "path": "/person/pos",
              "title": "個人成果量表(POS)"
            },
            {
              "path": "/person/communityskill",
              "title": "社區生活技能評量表"
            },
            {
              "path": "/person/statistic",
              "title": "統計分析" 
            }
          ]
        },
        {
          "icon": "fas fa-users fa-lg",
          "title": "團隊層級",
          "expanded": false,
          "children": [
            {
              "path": "/team/basic",
              "title": "團隊管理"
            },
            {
              "path": "/team/person_team",
              "title": "個人與團隊特質量表"
            },
            {
              "path": "/team/develop_plan",
              "title": "發展計畫"
            },
            {
              "path": "/team/cfi_statistic",
              "title": "CFI統計"
            }
          ]
        },
        {
          "icon": "fas fa-sitemap fa-lg",
          "title": "組織層級",
          "expanded": false,
          "children": [
            {
              "path": "/organization/oees",
              "title": "組織效益效率量表(OEES)"
            },
            {
              "path": "/organization/develop_plan",
              "title": "發展及改善計畫"
            },
            {
              "path": "/organization/statistic",
              "title": "統計分析"
            }
          ]
        },
        {
          "icon": "fas fa-briefcase",
          "title": "工作管理",
          "expanded": false,
          "children": [
            {
              "path": "/person/management",
              "title": "個人層級"
            },
            {
              "path": "/team/management",
              "title": "團隊層級"
            },
            {
              "path": "/organization/management",
              "title": "組織層級"
            }
          ]
        }
      ]
    }
  },
  components: {
    Expanding
  },
  methods: {
    toggleMenuItem (item) {
      if (item.children) {
        item.expanded = !item.expanded;
      }
    }
  }
}
</script>