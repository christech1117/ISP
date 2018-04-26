<template>
  <nav class="navbar app-navbar navbar-toggleable-md">
    <div class="navbar-brand-container d-flex align-items-center justify-content-start">
      <router-link class="navbar-brand" to="/dashboard">
        <i class="i-vuestic"></i>
      </router-link>
    </div>

    <div class="row navbar-container">

      <div class="menu-icon-container d-flex align-items-center justify-content-center justify-content-lg-start col">
        <a class="menu-icon i-menu-expanded" href="#" @click.prevent="toggleSidebar(false)" v-if="sidebarOpened"></a>
        <a class="menu-icon i-menu-collapsed" href="#" @click.prevent="toggleSidebar(true)" v-else></a>
      </div>

      <div class="navbar-text offset-md-1 col-md-7 d-none d-lg-flex align-items-center justify-content-center">
        <!-- {{'navbar.messageUs' | translate}}&nbsp;<a href="mailto:hello@epicmax.co">hello@epicmax.co</a> -->
      </div>

      <div class="col nav-item dropdown navbar-dropdown d-flex align-items-center justify-content-center" v-dropdown>
        <a class="nav-link dropdown-toggle d-flex align-items-center justify-content" href="#"
           @click.prevent="closeMenu">
          <span class="i-nav-messages notify"></span>
        </a>
        <div class="dropdown-menu">
          <div class="dropdown-menu-content">
            <a class="dropdown-item" href="#">
              <!-- <span class="ellipsis">{{ $t('messages.new', {name: "Oleg M"})}}</span> -->
            </a>
            <a class="dropdown-item" href="#">
              <!-- <span class="ellipsis">{{ $t('messages.new', {name: "Andrei H"})}}</span> -->
            </a>
            <div class="dropdown-item plain-link-item">
              <!-- <a class="plain-link" href="#">{{'messages.all' | translate}}</a> -->
            </div>
          </div>
        </div>
      </div>
      <div class="col nav-item dropdown navbar-dropdown d-flex align-items-center justify-content-center" v-dropdown>
        <a class="nav-link dropdown-toggle d-flex align-items-center justify-content" href="#"
           @click.prevent="closeMenu">
          <span class="i-nav-notification notify"></span>
        </a>
        <div class="dropdown-menu">
          <div class="dropdown-menu-content">
            <a class="dropdown-item" href="#">
              <!-- <span class="ellipsis">{{$t('notifications.sentMessage', {name: 'Vasily S'})}}</span> -->
            </a>
            <a class="dropdown-item" href="#">
              <!-- <span class="ellipsis">{{$t('notifications.uploadedZip', { name: "Oleg M", type: "typography component"})}}</span> -->
            </a>
            <a class="dropdown-item" href="#">
              <!-- <span class="ellipsis">{{$t('notifications.startedTopic',{name: "Andrei H"}) }}</span> -->
            </a>
            <div class="dropdown-item plain-link-item">
              <a class="plain-link" href="#">{{'notifications.all' | translate}}</a>
            </div>
          </div>
        </div>
      </div>
      <language-selector :options="langs"></language-selector>
      <div class="col nav-item dropdown navbar-dropdown d-flex align-items-center justify-content-center" v-dropdown>
        <a class="nav-link dropdown-toggle d-flex align-items-center justify-content" href="#"
           @click.prevent="closeMenu">
          <span class="avatar-container">
            <img src="http://i.imgur.com/nfa5itq.png"/>
          </span>
        </a>
        <div class="dropdown-menu last">
          <div class="dropdown-menu-content">
            <div class="dropdown-item plain-link-item">
              <a class="plain-link" href="#">{{'user.profile' | translate}}</a>
            </div>
            <div class="dropdown-item plain-link-item">
              <a class="plain-link" href="#">{{'user.logout' | translate}}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
  // import {mapGetters, mapActions} from 'vuex'
  // import LanguageSelector from './LanguageSelector'
  export default {
    name: 'navbar',
    components: {
      // LanguageSelector
    },
    data () {
      return {
        langs: [
          {
            code: 'gb',
            name: 'english'
          },
          {
            code: 'es',
            name: 'spanish'
          }
        ]
      }
    },
    computed: {
      // ...mapGetters([
      //   'sidebarOpened',
      //   'toggleWithoutAnimation'
      // ])
    },
    methods: {
      // ...mapActions([
      //   'closeMenu',
      //   'toggleSidebar',
      //   'isToggleWithoutAnimation'
      // ])
    }
  }
</script>

<style lang="scss" scope>
  @import "../../../scss/app.scss";
</style>