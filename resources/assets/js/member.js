require('./bootstrap.js');
import SideBar from './components/layouts/SideBar';
import NavBar from './components/layouts/NavBar';
import Member from './components/Member';

new Vue({
    el: '#app',
    components: { SideBar, NavBar, Member }
})