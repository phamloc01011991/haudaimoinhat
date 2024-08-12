/* eslint-disable import/order */
import "@/@fake-db/db";
import "@/@iconify/icons-bundle";
import App from "@/App.vue";
import ability from "@/plugins/casl/ability";
import i18n from "@/plugins/i18n";
import layoutsPlugin from "@/plugins/layouts";
import vuetify from "@/plugins/vuetify";
import { loadFonts } from "@/plugins/webfontloader";
import router from "@/router";
import store from "@/store";
import { abilitiesPlugin } from "@casl/vue";
import "@core/scss/template/index.scss";
import Notifications from "@kyvg/vue3-notification";
import "@styles/styles.scss";
import Antd from "ant-design-vue";
import { createPinia } from "pinia";
import { createApp } from "vue";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";

// import "@vueup/vue-quill/dist/vue-quill.bubble.css";
loadFonts();

const globalOptions = {
  theme: "snow",
  formats: ["image"],
};
QuillEditor.props.globalOptions.default = () => globalOptions;
// Create vue app
const app = createApp(App)
  .use(vuetify)
  .use(createPinia())
  .use(router)
  .use(Notifications)
  .use(Antd)
  .use(store)
  .use(layoutsPlugin)
  .use(i18n)
  .use(abilitiesPlugin, ability, {
    useGlobalProperties: true,
  })
  .component("QuillEditor", QuillEditor);

// Mount vue app
app.mount("#app");
