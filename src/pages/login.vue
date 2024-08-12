<script setup lang="ts">
import { notify } from "@kyvg/vue3-notification";
import { useRoute, useRouter } from "vue-router";
import store from "@/store";
import AuthProvider from "@/views/pages/authentication/AuthProvider.vue";
import authV1BottomShape from "@images/svg/bottom-illustration.svg?raw";
import authV1TopShape from "@images/svg/top-illustration.svg?raw";

import { useAppAbility } from "@/plugins/casl/useAppAbility";
import { VNodeRenderer } from "@layouts/components/VNodeRenderer";
import { themeConfig } from "@themeConfig";

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const ability = useAppAbility();
const checkLogin = !!computed(() => store.getters.usersss);

console.log(checkLogin);

// Vuex
const loggedIn = computed(() => store.getters.usersss);

console.log(loggedIn.value, "Login page");
if (loggedIn.value) {
  router.push("/");
} else {
}

const form = ref({
  username: "",
  password: "",
});

const onSubmit = () => {
  if (form.value.username == "" || form.value.password == "") {
    notify({
      title: "Thất bại",
      text: "Vui lòng nhập đầy đủ thông tin!",
      type: "error",
    });

    return;
  }

  const user = {
    username: form.value.username,
    password: form.value.password,
  };

  console.log("ahjhj");
  loading.value = true;
  store
    .dispatch("login", user)
    .then((res) => {
      loading.value = false;
      notify({
        title: "Thành công",
        text: "Đăng nhập thành công! 🎉",
        type: "success",
      });
      console.log("res", res);

      // localStorage.setItem('userAbilities', JSON.stringify(res.data.userAbilities));

      router.replace(route.query.to ? String(route.query.to) : "/");
      console.log(route.meta.action, route.query.to);
    })
    .catch((error) => {
      loading.value = false;
      notify({
        title: "Thất bại",
        text: "Tài khoản hoặc mật khẩu không chính xác!",
        type: "error",
      });
    });
};

const isPasswordVisible = ref(false);
</script>

<template>
  <div
    v-if="checkLogin"
    class="auth-wrapper d-flex align-center justify-center pa-4"
  >
    <div class="position-relative">
      <!-- 👉 Top shape -->
      <VNodeRenderer
        :nodes="h('div', { innerHTML: authV1TopShape })"
        class="text-primary auth-v1-top-shape d-none d-sm-block"
      />

      <!-- 👉 Bottom shape -->
      <VNodeRenderer
        :nodes="h('div', { innerHTML: authV1BottomShape })"
        class="auth-v1-bottom-shape d-none d-sm-block text-primary"
      />

      <VCard class="auth-card px-2" max-width="450">
        <VCardItem class="justify-center">
          <template #prepend>
            <div class="d-flex">
              <VNodeRenderer :nodes="themeConfig.app.logo" />
              <!-- <img style="width: 210px;" src="../../src/assets/images/logo_main.png" alt=""> -->
            </div>
          </template>

          <!--
            <VCardTitle class="auth-title">
            {{ themeConfig.app.title }}
            </VCardTitle>
          -->
        </VCardItem>

        <VCardText>
          <h6 class="text-h6 mb-1">
            Welcome to {{ themeConfig.app.title }} Admin! 👋🏻
          </h6>
          <p class="mb-0">
            Please sign-in to your account and start the adventure
          </p>
        </VCardText>
        <VCardText>
          <VForm @submit.prevent="onSubmit">
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <VTextField
                  v-model="form.username"
                  autofocus
                  label="User name"
                  type="text"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <VTextField
                  v-model="form.password"
                  label="Password"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'bx-hide' : 'bx-show'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <!-- remember me checkbox -->
                <div
                  class="d-flex align-center justify-space-between flex-wrap mt-2 mb-4"
                >
                  <VCheckbox label="Remember me" />

                  <RouterLink
                    class="text-primary text-sm ms-2"
                    :to="{ name: 'pages-authentication-forgot-password-v1' }"
                  >
                    Forgot Password?
                  </RouterLink>
                </div>

                <!-- login button -->
                <VBtn v-if="loading" block type="">
                  <VProgressCircular indeterminate color="success" />
                </VBtn>
                <VBtn v-else block type="submit"> Login </VBtn>
              </VCol>

              <!-- create account -->
              <VCol
                cols="12"
                class="text-center text-base d-flex justify-center flex-wrap"
              >
                <span>New on our platform?</span>
                <RouterLink
                  class="text-primary ms-2"
                  :to="{ name: 'pages-authentication-register-v1' }"
                >
                  Create an account
                </RouterLink>
              </VCol>

              <VCol cols="12" class="d-flex align-center">
                <VDivider />
                <span class="mx-4">or</span>
                <VDivider />
              </VCol>

              <!-- auth providers -->
              <VCol cols="12" class="text-center">
                <AuthProvider />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </div>
    <Notifications position="top right" />
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>

<route lang="yaml">
meta:
  layout: blank
  action: read
  subject: Auth
  redirectIfLoggedIn: true
</route>
