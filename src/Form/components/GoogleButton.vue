<template>
  <div class="wrapper">
    <i :class="{loading: true, _visible: loading, dark: isDark}"></i>
    <div class="google" ref="button"></div>
  </div>
</template>

<script lang="ts">
import axios from 'axios';

import {onMounted, ref} from "vue";
import {useConfig} from "@/config";

const initGoogle = (clientId: string, onToken: (token: string) => void) => {
  return window.google.accounts.id.initialize({
    client_id: clientId.endsWith('.apps.googleusercontent.com') ? clientId : clientId + '.apps.googleusercontent.com',
    callback: (e: any) => {
      const token = e.credential;
      onToken(token);
    },
    context: 'signin',
    prompt_parent_id: 'parent'
  });
}

const renderGoogleButton = (button: HTMLElement, locale: string, isDark: boolean = false) => {
  window.google.accounts.id.renderButton(button, {
    theme: isDark ? "filled_black" : "outline",
    text: "signin_with",
    width: 280,
    type: 'standard',
    size: 'large',
  });
}

const injectGoogleScript = () => {
  return new Promise((resolve, reject) => {
    const googleScript = document.createElement('script');
    googleScript.setAttribute('src', 'https://accounts.google.com/gsi/client');
    document.head.appendChild(googleScript);

    googleScript.onload = resolve;
  });
}

export default {
  name: 'GoogleButton',
  props: {
    msg: String
  },
  emits: ['start', 'error', 'success'],
  setup(_props, {emit}) {
    const loading = ref<boolean>(false);

    const {language, authGoogle, apiUrl, theme} = useConfig();
    const button = ref<HTMLElement>()

    onMounted(async () => {
      if (button.value && authGoogle.clientId) {
        await injectGoogleScript();

        initGoogle(authGoogle.clientId, async (token) => {
          emit('start');

          loading.value = true;

          try {
            const res = await axios.post(apiUrl + `/tager/auth/admin/google`, {idToken: token}, {});
            if(res.data.data?.accessToken) {
              emit('success', res.data.data);
            } else{
              loading.value = false;
              emit('error', 'Invalid response');
            }
          } catch (e:any) {
            loading.value = false;
            emit('error', e.response?.data?.message || 'Unknown error');
          }
        });

        renderGoogleButton(button.value, language, theme === 'dark');
      }
    });

    return {
      button,
      loading,
      isDark: theme === 'dark'
    };
  }
}
</script>

<style scoped lang="scss">
.wrapper {
  position: relative;

  .loading {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, .6);
    z-index: 2;
    opacity: 0;
    transition: 0.3s all ease;
    visibility: hidden;

    &.dark{
      background: rgba(22, 22, 22, .6);
    }

    &._visible {
      opacity: 1;
      visibility: visible;
    }
  }
}

.google {
  margin: 0 auto;
  width: 100%;
  height: 40px;
  display: flex;
  overflow: hidden;
  max-height: 44px;
}
</style>