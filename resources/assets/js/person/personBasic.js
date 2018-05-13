import NavBar from '../components/layouts/NavBar';
import SideBar from '../components/layouts/SideBar';
import PersonBasic from '../components/person/PersonBasic';
import PrettyCheckbox from 'pretty-checkbox-vue';

Vue.use(PrettyCheckbox);

new Vue({
    el: '#app',
    components: { NavBar, SideBar, PersonBasic, PrettyCheckbox }
})