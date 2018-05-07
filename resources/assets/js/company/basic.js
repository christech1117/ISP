import NavBar from '../components/layouts/NavBar';
import SideBar from '../components/layouts/SideBar';
import Basic from '../components/company/Basic';
import PrettyCheckbox from 'pretty-checkbox-vue';

Vue.use(PrettyCheckbox);

new Vue({
    el: '#app',
    components: { NavBar, SideBar, Basic, PrettyCheckbox }
})