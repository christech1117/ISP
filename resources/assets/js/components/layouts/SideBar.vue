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
              "path": "/person/basic",
              "title": "基本資料"
            },
            {
              "path": "/person/sis",
              "title": "支持強度強表(SIS)"
            },
            {
              "path": "/person/mysupport_plan",
              "title": "我的支持計畫"
            },
            {
              "path": "/person/support_plan",
              "title": "個別化支持計畫"
            },
            {
              "path": "/person/metting_record",
              "title": "ISP會議記錄"
            },
            {
              "path": "/person/pos",
              "title": "個人成果量表(POS)"
            },
            {
              "path": "/person/community_skill",
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

<style lang="scss">
@import "../../../sass/_variables.scss";
@import "~bootstrap/scss/mixins/breakpoints";
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";

.sidebar {
  @include media-breakpoint-down(md) {
    top: $sidebar-mobile-top;
    left: $sidebar-mobile-left;
    width: $sidebar-mobile-width;
    z-index: $sidebar-mobile-z-index;
  }
  height: $sidebar-viewport-height;
  .scrollbar-wrapper {
    box-shadow: $sidebar-box-shadow;
  }
  .scrollbar-content {
    background: $sidebar-bg;
  }
  position: absolute;
  width: $sidebar-width;
  top: $sidebar-top;
  left: $sidebar-left;
  transition: all 0.2s ease;
  opacity: 1;
  .sidebar-hidden_without-animation & {
    transition: none;
  }
  .sidebar-hidden & {
    @include media-breakpoint-down(md) {
      top: $sidebar-hidden-top-mobile;
      opacity: 0;
      z-index: $sidebar-mobile-z-index;
      height: $sidebar-hidden-height-mobile;
    }
    top: $sidebar-hidden-top;
    opacity: 0;
    z-index: $min-z-index;
  }
  .sidebar-link {
    position: relative;
    height: $sidebar-link-height;
    padding-left: $sidebar-link-pl;
    display: flex;
    flex-direction: row;
    align-items: center;
    cursor: pointer;
    text-decoration: none;
    &.router-link-active,
    &:hover {
      color: $white;
      background-color: $sidebar-link-active-bg;
      .sidebar-menu-item-icon,
      .expand-icon {
        color: $white;
      }
    }
    .expand-icon {
      position: absolute;
      right: $sidebar-arrow-right;
      top: calc(50% - #{$font-size-root}/2);
      font-weight: bold;
      transition: transform 0.3s ease;
    }
    &.expanded {
      .expand-icon {
        transform: rotate(180deg);
      }
    }
    .sidebar-menu-item-icon {
      font-size: $sidebar-menu-item-icon-size;
      color: $vue-green;
      margin-right: 14px;
      &.fa-dashboard {
        /* Temp fix */
        position: relative;
        top: -2px;
      }
    }
  }
  .sidebar-submenu-link {
    height: $sidebar-submenu-link-height;
  }
  .sidebar-menu,
  .sidebar-submenu {
    list-style: none;
    padding-left: 0;
    li {
      display: block;
      padding-left: 0;
    }
  }
  .sidebar-submenu {
    .sidebar-link {
      padding-left: $sidebar-submenu-link-pl;
      font-size: $font-size-smaller;
    }
  }
  .sidebar-menu {
    max-height: 100%;
    margin-bottom: 0;
  }
  .expand-icon {
    color: $vue-green;
  }
  a {
    color: $white;
    text-decoration: none;
  }
}
</style>