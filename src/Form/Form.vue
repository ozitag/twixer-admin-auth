<template>
  <div class="inner">
    <div :class="{form: true, dark: isDark}">
      <GoogleButton @start="resetError" @error="onError" @success="onSuccess"/>
    </div>
    <span :class="{error, visible:error!==null}">{{ error }}</span>
  </div>
</template>

<script lang="ts">
import GoogleButton from './components/GoogleButton.vue';
import {ref} from "vue";
import {useConfig} from "@/config";

export default {
  name: 'Form',
  components: {GoogleButton},
  props: {
    msg: String
  },
  setup() {
    const {basePath, theme} = useConfig();

    const error = ref<string | null>(null);

    const onError = (errorMessage: string) => {
      error.value = errorMessage;
    }

    const resetError = () => error.value = null;

    const onSuccess = (data: any) => {
      localStorage.setItem("admin_access_token", data.accessToken);

      setTimeout(() => {
        let redirectUrl = basePath.startsWith('https://') || basePath.startsWith('http://') ? basePath : window.location.origin + basePath;
        if (redirectUrl.endsWith('/')) {
          redirectUrl = redirectUrl.slice(0, redirectUrl.length - 1);
        }

        window.location.href = redirectUrl.length > 0 ? redirectUrl.slice(0, redirectUrl.lastIndexOf('/')) : '/admin';
      }, 100);
    }

    return {
      error,
      resetError,
      onSuccess,
      onError,
      isDark: theme === 'dark'
    }
  }
}
</script>

<style scoped lang="scss">
.form {
  width: 100%;
  padding: 15px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 10px;

  &.dark{
    background-color: #333;
  }
}

.inner {
  position: relative;
  display: flex;
}

.error {
  background: #a82d2d;
  text-align: center;
  display: block;
  margin-top: 15px;
  border-radius: 4px;
  color: #fff;
  padding: 6px 10px;
  font-size: 14px;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  opacity: 0;
  transition: 1s opacity ease;

  &.visible {
    opacity: 1;
  }
}
</style>