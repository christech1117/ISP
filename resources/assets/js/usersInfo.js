require('./bootstrap.js');
import SideBar from './components/layouts/SideBar';
import UsersInfo from './components/UsersInfo';

new Vue({
    el: '#app',
    components: { SideBar, UsersInfo }
})