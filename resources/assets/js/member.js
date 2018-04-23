require('./bootstrap.js');
import SideBar from './components/layouts/SideBar';
import Member from './components/Member';

new Vue({
    el: '#app',
    components: { SideBar, Member }
})