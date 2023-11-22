<template>
  <div :class="{wrapper: true, _light: !isDark}">
    <i :class="{loading: true, _light: !isDark, _visible: initLoading}"></i>
    <div class="button" id="yandex"></div>
  </div>
</template>

<script lang="ts">

import {onMounted, ref} from "vue";
import {useConfig} from "@/config";

const injectYandexScript = () => {
  return new Promise((resolve, reject) => {
    const googleScript = document.createElement('script');
    googleScript.setAttribute('src', 'https://yastatic.net/s3/passport-sdk/autofill/v1/sdk-suggest-with-polyfills-latest.js');
    document.head.appendChild(googleScript);
    googleScript.onload = resolve;
  });
}

const renderButton = async (clientId: string, theme: 'light' | 'dark', language: 'en' | 'ru'): Promise<void> => {
  const viewParams = {
    view: 'button',
    parentId: 'yandex',
    buttonView: 'main',
    buttonTheme: theme === 'light' ? 'dark' : 'light',
    buttonSize: 's',
    buttonBorderRadius: 4,
    buttonIcon: language === 'ru' ? 'ya' : 'yaEng'
  };

  return new Promise((resolve) => {
    //@ts-ignore
    window.YaAuthSuggest.init({
      client_id: clientId,
      response_type: 'token',
      redirect_uri: window.location.origin + window.location.pathname
    }, window.location.origin, viewParams).then((result: any) => {
      resolve();
      return result.handler()
    }).then(function(data: any) {
      console.log('Сообщение с токеном: ', data);
    }).catch(function(error: any) {
      console.log('Что-то пошло не так: ', error);
    });
  });
}

export default {
  name: 'YandexButton',
  setup() {
    const loading = ref<boolean>(false);
    const initLoading = ref<boolean>(true);

    const {language, authYandex, theme} = useConfig();

    onMounted(async () => {
      if (authYandex && authYandex.enabled && authYandex.clientId) {
        await injectYandexScript();
        await renderButton(authYandex.clientId, theme,language);
        initLoading.value = false;
      }
    });

    return {
      loading,
      initLoading,
      isDark: theme === 'dark'
    };
  }
}
</script>

<style scoped lang="scss">
.wrapper {
  position: relative;
  border-radius: 4px;
  overflow: hidden;

  .loading {
    position: absolute;
    inset: 0;
    background: rgba(22, 22, 22, .5);
    z-index: 2;
    opacity: 0;
    transition: 0.3s all ease;
    visibility: hidden;

    &._visible {
      opacity: 1;
      visibility: visible;
    }

    &._light{
      background: rgba(255, 255, 255, .5);
    }
  }

  &._light{
    border: 1px solid #dadce0;
  }
}

.button {
  height: 40px;
}
</style>
