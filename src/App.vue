<script setup lang="ts">
import { useTheme } from "vuetify";
import ScrollToTop from "@core/components/ScrollToTop.vue";
import { useThemeConfig } from "@core/composable/useThemeConfig";
import { hexToRgb } from "@layouts/utils";

const {
  syncInitialLoaderTheme,
  syncVuetifyThemeWithTheme: syncConfigThemeWithVuetifyTheme,
  isAppRtl,
  handleSkinChanges,
} = useThemeConfig();

const { global } = useTheme(); // ℹ️ Sync current theme with initial loader theme

syncInitialLoaderTheme();
syncConfigThemeWithVuetifyTheme();
handleSkinChanges();
</script>

<template>
  <VLocaleProvider :rtl="isAppRtl">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp
      :style="`--v-global-theme-primary: ${hexToRgb(
        global.current.value.colors.primary
      )}`"
    >
      <RouterView />
      <ScrollToTop />
      <!-- <notifications position="top right" /> -->
    </VApp>
  </VLocaleProvider>
</template>

<style lang="scss">
@keyframes textShine {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}

#app > div > div > div > div > aside > aside > div.nav-header > a > h1 {
  font-size: 26px;
  font-weight: bold;

  margin: 5px;
  background: linear-gradient(
    to right,
    #7a00ff 0%,
    #006b19 30%,
    #ff7300 30%,
    #fffb00 40%,
    #48ff00 50%,
    #00ffd5 60%,
    #f41717 80%,
    #ff00c8 90%,
    #ff0000 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-fill-color: transparent;
  background-size: 500% auto;
  animation: textShine 5s ease-in-out infinite alternate;
}
.image-user > img {
  width: 50px !important;
  height: 50px !important;
  object-fit: cover !important;
}
.v-avatar {
  width: 50px !important;
  height: 50px !important;
}
</style>
