import {createApp} from 'vue'
import App from './App.vue'
import {useConfig} from "@/config";

const accessToken = localStorage.getItem('admin_access_token')

if (accessToken) {
    const {basePath} = useConfig();
    window.location.href = basePath.startsWith('https://') || basePath.startsWith('http://') ? basePath : window.location.origin + basePath;
}

createApp(App).mount('#app')
