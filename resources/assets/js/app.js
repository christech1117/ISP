require('./bootstrap');
import SideBar from './components/layouts/SideBar';

FontAwesomeConfig = { searchPseudoElements: true };
const app = new Vue({
    el: '#app',
    components: { SideBar }
});
