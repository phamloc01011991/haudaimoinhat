<script setup lang="ts">
import { notify } from "@kyvg/vue3-notification";
import { ref } from "vue";
import { languagePack } from "@/languages";
import { formatUsdt } from "@/utils2/money";
import request from "@/utils2/request";
import { avatarText } from "@core/utils/formatters";

const id = ref();
const loading = ref(false);
const amount = ref();
const loadingTable = ref(true);
const isUnlock = ref(false);

const searchQuery = ref("");
const rowPerPage = ref(10); // page size
const currentPage = ref(1);
const totalUsers = ref(14);
const totalPage = ref(1);

const users = ref<any>([]);
const nameUser = ref("");
const idUser = ref("");
const cnyAmount = ref();
const limitNow = ref();

watch(currentPage, (newVal, oldVal) => {
  limitNow.value = newVal;
  fetchUsers(newVal);
});

// 👉 Test
const idUserSearch = ref();

// 👉 Fetching users
const fetchUsers = async (page = 1) => {
  users.value = "";
  try {
    loadingTable.value = true;

    const res = await request.get("admin/get_users_disble", {
      params: {
        page,
        limit: rowPerPage.value,
        id: idUserSearch.value,
      },
    });

    if (res.data.success) {
      loadingTable.value = false;
      users.value = res.data.data;
      totalUsers.value = res.data.count;
      totalPage.value = Math.ceil(totalUsers.value / rowPerPage.value);

      return users.value.length;
    }
  } catch (error) {
    loadingTable.value = false;
  }
};

// Fetch data
async function usdToCny() {
  const reponse = await fetch(
    "https://api.exchangerate-api.com/v4/latest/USDT"
  );
  const data = await reponse.json();
  const usdToCnyRate = data.rates.CNY;

  // Thực hiện chuyển đổi từ USDT sang VND
  // const usdtAmount = number; // Số tiền USDT cần chuyển đổi
  // cnyAmount.value = usdtAmount * usdToCnyRate;

  return (cnyAmount.value = usdToCnyRate);
}
usdToCny();
function formatCny(number: any) {
  const newNumber = parseFloat(number);

  return newNumber.toLocaleString("zh-CN", {
    style: "currency",
    currency: "CNY",
  });
}

// 👉 watching current page
watchEffect(() => {
  if (currentPage.value > totalPage.value) currentPage.value = totalPage.value;
});

// 👉 Computing pagination data
const paginationData = computed(() => {
  const firstIndex = users.value.length
    ? (currentPage.value - 1) * rowPerPage.value + 1
    : 0;

  const lastIndex =
    users.value.length + (currentPage.value - 1) * rowPerPage.value;

  return `${firstIndex}-${lastIndex} of ${totalUsers.value}`;
});

// SECTION Checkbox toggle
const selectedRows = ref<string[]>([]);
const selectAllUser = ref(false);

// 👉 watch if checkbox array is empty all select should be uncheck
watch(
  selectedRows,
  () => {
    if (!selectedRows.value.length) selectAllUser.value = false;
  },
  { deep: true }
);

// !SECTION checkbox toggle

// Search
const realSearch = ref();
const selectedOption = ref({ state: "ID", abbr: "id" });

watch(selectedOption, (newVal, oldVal) => {
  realSearch.value = newVal;
});

const chooseSearch = [{ state: "ID", abbr: "id" }];

window.addEventListener("keyup", (event) => {
  if (event.keyCode === 13) SearchUser();
});
async function SearchUser() {
  try {
    console.log("searchQuery.value", realSearch.value);

    if (realSearch.value == "id") {
      idUserSearch.value = searchQuery.value;
      fetchUsers();
    } else {
      idUserSearch.value = searchQuery.value;
      fetchUsers();
    }
  } catch (error) {}
}

const clickMe = async () => {
  loading.value = true;
  try {
    await request
      .post("admin/disable_user", {
        id: id.value,
      })
      .then((res) => {
        if (res.data.success == true) {
          loading.value = false;
          notify({
            title: "Thành công",
            text: "Cập nhật thành công!",
            type: "success",
          });
          id.value = "";
          fetchUsers();
        }
      });
  } catch (error: any) {
    loading.value = false;
    notify({
      title: "Thất bại",
      text: `${error.response.data.message}`,
      type: "error",
    });
  }
};

const runLoadEdit = async (id: any) => {
  idUser.value = id;
  isUnlock.value = true;
};

const unLockUser = async () => {
  try {
    await request
      .post("admin/un_disable_user", {
        id: idUser.value,
      })
      .then((res) => {
        if ((res.data.message = "User un disabled successfully")) {
          notify({
            title: "Thành công",
            text: "Cập nhật thành công!",
            type: "success",
          });
          isUnlock.value = false;
          fetchUsers();
        }
      });
  } catch (error: any) {
    notify({
      title: "Thất bại",
      text: `${error.response.data.message}`,
      type: "error",
    });
  }
};

onMounted(() => {
  fetchUsers();
});

// -----
</script>

<template>
  <section>
    <VRow>
      <VCol cols="12">
        <VCard
          :title="languagePack.NAVIGATION_LOCK_ACC_USER"
          height="220px;"
          style="padding: 10px"
        >
          <VRow>
            <VCol cols="12" sm="6">
              <div
                class="app-user-search-filter d-flex align-center"
                style="height: 100%"
              >
                <VTextField
                  v-model="id"
                  clearable
                  clear-icon="bx-x-circle"
                  label="ID"
                  type="text"
                  density="compact"
                  class="me-3"
                >
                  <template #append-inner>
                    <VFadeTransition leave-absolute>
                      <VProgressCircular
                        v-if="loading"
                        size="24"
                        color="info"
                        indeterminate
                      />
                    </VFadeTransition>
                  </template>
                </VTextField>
                <!-- Append -->
                <VBtn @click="clickMe">
                  <VIcon icon="bx-lock-alt" />
                  <span v-if="$vuetify.display.mdAndUp" class="ms-3">{{
                    languagePack.LOCK_ACC_BUTTON
                  }}</span>
                </VBtn>
              </div>
            </VCol>

            <!--
              <VCol cols="12" sm="3" style="display: flex; align-items: flex-end">

              </VCol>
            -->
            <VCol cols="12" sm="3">
              <div style="height: 100%">
                <VSelect
                  v-model="selectedOption"
                  :label="languagePack.USER_MANAGE_ORDER_BY"
                  :items="chooseSearch"
                  item-title="state"
                  item-value="abbr"
                  style="height: 50px"
                />
              </div>
            </VCol>
            <VCol cols="12" sm="3">
              <div
                class="app-user-search-filter d-flex align-center"
                style="height: 100%"
              >
                <!-- 👉 Search  -->
                <VTextField
                  v-model="searchQuery"
                  :placeholder="languagePack.USER_MANAGE_SEARCHKEY_PLACEHOLDER"
                  class="me-3"
                />

                <!-- <VBtn> <VIcon start icon="bx-search" />Search </VBtn> -->
                <VBtn @click="SearchUser">
                  {{ languagePack.USER_MANAGE_SEARCH_BUTTON }}
                  <VIcon end icon="bx-search" />
                </VBtn>

                <!--
                  <VBtn @click="toggleAutoFetchData">{{ autoFetchData ? 'Tắt' : 'Bật' }}
                  <VIcon end icon="bx-search" />
                  </VBtn>
                -->
              </div>
            </VCol>
          </VRow>

          <VRow>
            <VProgressLinear
              v-if="loadingTable"
              height="10"
              indeterminate
              color="primary"
            />
          </VRow>
          <VTable class="text-no-wrap">
            <!-- 👉 table head -->
            <thead>
              <tr>
                <th scope="col">
                  {{ languagePack.USER_MANAGE_ID_USER }}
                </th>
                <!-- <th scope="col">
                  {{ languagePack.USER_MANAGE_USER_NAME }}
                </th> -->
                <th scope="col">
                  {{ languagePack.USER_MANAGE_BALANCE_CN }}(¥)
                </th>
                <th scope="col">
                  {{ languagePack.USER_MANAGE_BALANCE_USD }}(USD)
                </th>
                <th scope="col">
                  {{ languagePack.USER_MANAGE_ACTIONS }}
                </th>
              </tr>
            </thead>

            <!-- 👉 table body -->
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>
                  <span class="text-capitalize text-base">{{ user.id }} </span>
                </td>
                <!-- 👉 User -->
                <!-- <td>
                  <div class="d-flex align-center">
                    <VAvatar
                      variant="tonal"
                      color="primary"
                      class="me-3"
                      size="34"
                    >
                      <VImg
                        v-if="user.avatar"
                        :src="user.avatar"
                      />
                      <span
                        v-else
                        class="text-sm"
                      >{{
                        avatarText(user.fullName)
                      }}</span>
                    </VAvatar>

                    <div class="d-flex flex-column">
                      <h6 class="text-sm">
                        <p
                          :to="{
                            name: 'apps-user-view-id',
                            params: { id: user.id },
                          }"
                          class="font-weight-medium user-list-name"
                        >
                          {{ user.fullName }}
                        </p>
                      </h6>
                      <span class="text-xs text-medium-emphasis">{{
                        user.email
                      }}</span>
                    </div>
                  </div>
                </td> -->
                <!-- 👉 Role -->
                <td>
                  <span class="text-base text-high-emphasis">{{
                    formatCny(user.balance * cnyAmount)
                  }}</span>
                </td>
                <td>
                  <span class="text-capitalize text-base">{{
                    formatUsdt(user.balance)
                  }}</span>
                </td>

                <!-- 👉 Status -->
                <!-- 👉 Actions -->
                <td class="text-center">
                  <VBtn color="warning" @click="runLoadEdit(user.id)">
                    <VIcon icon="bx-lock-open-alt" style="margin-right: 5px" />
                    {{ languagePack.UNLOCK_BUTTON }} </VBtn
                  >&ensp;
                </td>
              </tr>
            </tbody>
          </VTable>

          <VDivider />

          <!-- SECTION Pagination -->
          <VCardText class="d-flex flex-wrap justify-end gap-4 pa-2">
            <div class="d-flex align-center" style="width: 171px">
              <span class="text-no-wrap text-sm me-3"
                >{{ languagePack.USER_MANAGE_ROWS_PER_PAGE }}:</span
              >
              <VSelect
                v-model="rowPerPage"
                density="compact"
                class="per-page-select"
                variant="plain"
                :items="[10, 20, 30, 50]"
              />
            </div>

            <div class="d-flex align-center">
              <h6 class="text-sm font-weight-regular">
                {{ paginationData }}
              </h6>
            </div>
            <VPagination
              v-model="currentPage"
              :total-visible="1"
              rounded="circle"
              :length="totalPage"
              @next="selectedRows = []"
              @prev="selectedRows = []"
            />
          </VCardText>
          <!-- !SECTION -->
        </VCard>
      </VCol>
    </VRow>

    <VDialog v-model="isUnlock" persistent class="v-dialog-sm">
      <!-- Dialog Activator -->

      <!-- Dialog Content -->
      <VCard title="UNLOCK USER">
        <DialogCloseBtn variant="text" size="small" @click="isUnlock = false" />

        <VCardText>
          {{ languagePack.UNLOCK_USER }}
        </VCardText>

        <VCardText class="d-flex justify-end gap-2">
          <VBtn color="secondary" variant="tonal" @click="isUnlock = false">
            Cancel
          </VBtn>
          <VBtn @click="unLockUser"> Unlock </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </section>
</template>

<style scoped>
#app
  > div
  > div
  > div
  > div.layout-wrapper.layout-nav-type-vertical.layout-navbar-sticky.layout-footer-static.layout-content-width-boxed
  > div.layout-content-wrapper
  > main
  > div
  > section
  > div
  > div
  > div
  > div:nth-child(3)
  > div:nth-child(1)
  > div
  > div
  > div
  > div.v-field__field
  > label {
  height: 14px;
}
</style>
