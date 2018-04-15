<template lang="pug">
#side-bar
  .brand Brand Logo
  .menu-list
    ul#menu-content.menu-content.collapse.out.fa-ul
      li.active
        a(href='#')
          i.fas.fa-globe.fa-lg
          |  總覽
      li.collapsed(data-toggle='collapse', data-target='#products')
        a(href='#')
          .row
            .col
              i.fas.fa-sitemap.fa-lg
              |  組織層級
            .col.text-right
              i.fas.fa-angle-down.fa-lg
      ul#products.sub-menu.collapse
        li.active
          a(href='#')
          |  組織基本資料
        li
          a(href='#')
          | 人員管理
        li
          a(href='#')
          | 部門\單位管理
        li
          a(href='#')
          | 方案管理
        li
          a(href='#')
          | 檔案管理
        li
          a(href='#')
          | 組織效益效率量表(OEES)
        li
          a(href='#')
          | 發展及改善計畫
        li
          a(href='#')
          | 統計分析
      li.collapsed(data-toggle='collapse', data-target='#service')
        a(href='#')
          .row
            .col
              i.fa.fa-users.fa-lg
              |  團隊層級 
            .col.text-right
              i.fas.fa-angle-down.fa-lg
      ul#service.sub-menu.collapse
        li
          a(href='#')
            | 團隊管理
        li
          a(href='#')
            | 個人與團隊特質量表(CFI)
        li
          a(href='#')
            | 發展計畫
        li
          a(href='#')
            | 統計分析
      li.collapsed(data-toggle='collapse', data-target='#new')
        a(href='#')
          .row
            .col
              i.fas.fa-user.fa-lg
              |  個人層級 
            .col.text-right
              i.fas.fa-angle-down.fa-lg
      ul#new.sub-menu.collapse
        li
          a(href='#')
            | 個案管理
        li
          a(href='#')
            | 基本資料
        li
          a(href='#')
            | 支持強度量表
        li
          a(href='#')
            | 我的支持計畫
        li
          a(href='#')
            | 個別化支持計畫
        li
          a(href='#')
            | ISP會議記錄
        li
          a(href='#')
            | 個人成果量表(POS)
        li
          a(href='#')
            | 社區生活技能評量表
        li
          a(href='#')
            | 統計分析
      li.collapsed(data-toggle='collapse', data-target='#work')
        a(href='#')
          .row
            .col
              i.fas.fa-briefcase.fa-lg
              |  工作管理 
            .col.text-right
              i.fas.fa-angle-down.fa-lg
      ul#work.sub-menu.collapse
        li
          a(href='#')
            | 組織層級
        li
          a(href='#')
            | 團隊層級
        li
          a(href='#')
            | 個人層級
      li
        a(href='#')
          i.fas.fa-question-circle.fa-lg
          |  HELP

</template>
<script>
export default {

}
</script>

<style lang="sass" scoped>
#side-bar
  *, body
    font-size: 14px
    margin: 0px
    padding: 0px

  font-size: 5rem
  font-weight: 200
  background-color: #2e353d
  position: fixed
  top: 0px
  width: 250px
  height: 100%
  color: #e1ffff
  .brand 
    background-color: #23282e
    line-height: 50px
    display: block
    text-align: center
    font-size: 14px
  .toggle-btn
    display: none

  ul, li
    list-style: none
    line-height: 25px
    cursor: pointer
    .active
      border-left: 3px solid #d19b3d
      background-color: #4f5b69    
    .sub-menu
      li
        background-color: #181c20
        border: none
        line-height: 20px
        border-bottom: 1px solid #23282e
        &:hover
          background-color: #020203
        &:before
          font-family: "Font Awesome\ 5 Free"
          content: "\f105"
          font-weight: 900
          padding: 0 10px
          vertical-align: middle
        .active
          color: #d19b3d
          a
          color: #d19b3d  
  li
    padding: 10px
    border-left: 3px solid #2e353d
    border-bottom: 1px solid #23282e
    &:hover
      border-left: 3px solid #d19b3d
      background-color: #4f5b69
      -webkit-transition: all 1s ease
      -moz-transition: all 1s ease
      -o-transition: all 1s ease
      -ms-transition: all 1s ease
      transition: all 1s ease
    a
      text-decoration: none
      color: #e1ffff
      i
        padding-left: 10px
        width: 20px
        padding-right: 20px

  @media (max-width: 767px) 
    position: relative
    width: 100%
    margin-bottom: 10px
    
    .toggle-btn 
      display: block
      cursor: pointer
      position: absolute
      right: 10px
      top: 10px
      z-index: 10 !important
      padding: 3px
      background-color: #ffffff
      color: #000
      width: 40px
      text-align: center
    
    .brand
      text-align: left !important
      font-size: 22px
      padding-left: 20px
      line-height: 50px !important
    
  
  @media (min-width: 767px) 
    .menu-list .menu-content 
      display: block
</style>