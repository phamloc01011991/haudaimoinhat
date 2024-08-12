<script setup lang="ts">
import { notify } from "@kyvg/vue3-notification";
import { onMounted } from "vue";
import { languagePack } from "@/languages";
import { formatUsdt, formatVnd } from "@/utils2/money";
import request from "@/utils2/request";
import { useUserListStore } from "@/views/apps/user/useUserListStore";
import { avatarText } from "@core/utils/formatters";
import { hexToRgb } from "@layouts/utils";
import { useTheme } from "vuetify";
import VueApexCharts from "vue3-apexcharts";

// 👉 Store
const vuetifyTheme = useTheme();
const userListStore = useUserListStore();
const searchQuery = ref("");
const rowPerPage = ref(10); // page size
const currentPage = ref(1);
const totalUsers = ref(14);
const totalPage = ref(1);

const users = ref<any>([]);
const nameUser = ref("");
const idUser = ref("");
const loadingTable = ref(false);
const loadingEditUser = ref<any>(0);
const cnyAmount = ref();
const limitNow = ref();
const series = ref([]);

// 👉 Test
watch(currentPage, (newVal, oldVal) => {
  limitNow.value = newVal;
  fetchUsers(newVal);
});

// 👉 Fetching users
const fetchUsers = async (page = 1, type = "id", searchValue = "") => {
  users.value = "";
  try {
    loadingTable.value = true;

    const res = await request.get("member", {
      params: {
        page,
        limit: rowPerPage.value,
        [type]: searchValue,
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

// 👉 watching current page
watchEffect(() => {
  if (currentPage.value > totalPage.value) currentPage.value = totalPage.value;
});

// 👉 search filters
const realSearch = ref();
const selectedOption = ref({ state: "ID", abbr: "id" });

watch(selectedOption, (newVal, oldVal) => {
  realSearch.value = newVal;
});

const chooseSearch = [
  { state: "ID", abbr: "id" },
  { state: "Name", abbr: "name" },
  { state: "Group", abbr: "group" },
];

window.addEventListener("keyup", (event) => {
  if (event.keyCode === 13) SearchUser();
});
async function SearchUser() {
  try {
    // if (realSearch.value == "name") {
    //   idUser.value = "";
    //   nameUser.value = searchQuery.value;
    //   fetchUsers();
    // } else {
    //   nameUser.value = "";
    //   idUser.value = searchQuery.value;

    // }
    fetchUsers(1, realSearch.value, searchQuery.value);
  } catch (error) {}
}

// 👉 watching current page
watchEffect(() => {
  if (currentPage.value > totalPage.value) currentPage.value = totalPage.value;
});

// 👉 Convert To Currency

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

// form dialog
const userIdSelect = ref();
const isDialogVisible = ref(false);
const isDialogCreateVisible = ref(false);
const username = ref("");
const balance = ref("");
const password = ref("");
const securityCode = ref();
const transferCode = ref("");
const rank = ref("");
async function runLoadEdit(userId: number) {
  userIdSelect.value = userId;
  loadingEditUser.value = userId;

  const res = await request.get("member/detail", {
    params: {
      id: userId,
    },
  });

  loadingEditUser.value = 0;

  const { data } = res.data;
  series.value = [
    { name: "Chuột", data: data.mouse },
    { name: "Bàn Phím", data: data.keyboard },
  ];
  isDialogVisible.value = true;
}

// --------end
// Khai báo biến
const page = ref(1);
const limitPage = ref(10);

onMounted(() => {
  fetchUsers();
});
function getLast7Days() {
  const result = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const day = date.getDate();
    const month = date.getMonth() + 1; // Tháng trong JavaScript bắt đầu từ 0

    result.push(`${day}/${month}`);
  }

  console.log("🚀 ~ getLast7Days ~ result:", result);
  return result.reverse(); // Đảo ngược mảng để ngày hiện tại ở cuối
}

const chartOptions = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors;
  const variableTheme = vuetifyTheme.current.value.variables;

  const disabledTextColor = `rgba(${hexToRgb(
    String(currentTheme["on-surface"])
  )},${variableTheme["disabled-opacity"]})`;
  const borderColor = `rgba(${hexToRgb(
    String(variableTheme["border-color"])
  )},${variableTheme["border-opacity"]})`;

  return {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
      dropShadow: {
        top: 14,
        blur: 4,
        left: 0,
        enabled: true,
        opacity: 0.04,
        enabledOnSeries: [1],
        color: "#000",
      },
    },
    grid: {
      show: false,
      padding: {
        left: -7,
        top: -37,
        right: 34,
        bottom: 10,
      },
    },
    legend: { show: false },
    colors: [borderColor, `rgba(${hexToRgb(String(currentTheme.primary))}, 1)`],
    stroke: {
      width: [3, 5],
      curve: "smooth",
      lineCap: "round",
      dashArray: [8, 0],
    },
    xaxis: {
      axisTicks: { show: false },
      axisBorder: { show: false },
      categories: [...getLast7Days()],
      labels: {
        style: {
          fontSize: "1rem",
          colors: disabledTextColor,
          fontFamily: "Public Sans",
        },
      },
    },
    yaxis: {
      labels: { show: true },
    },
  };
});

const dataName = ref("");
const dataGroup = ref("");
const idMember = ref();
const handleOpenMember = async (valId: any) => {
  isDialogCreateVisible.value = true;
  if (valId) {
    await request
      .get("/member-detail/" + valId)
      .then((res) => {
        //   checkDataFID.value = true;
        const { data } = res.data;
        idMember.value = valId;
        dataName.value = data.name;
        dataGroup.value = data.group;

        // if (dataForNoti.value[0].status == null || 1) checkboxString.value = "On";

        // if (dataForNoti.value[0].status == 2) checkboxString.value = "Off";
      })
      .catch((err) => {
        console.log("🚀 ~ handleOpenPost ~ err:", err);
      });
  } else {
    idMember.value = null;
    dataName.value = "";
    dataGroup.value = "";
  }
};
const createMember = async () => {
  if (idMember.value) {
    await request
      .put("member/" + idMember.value, {
        name: dataName.value,
        group: dataGroup.value,
      })
      .then((res) => {
        isDialogCreateVisible.value = false;
        dataName.value = "";
        dataGroup.value = "";
        fetchUsers();
      })
      .catch((err) => {
        notify({
          title: "Thất bại",
          text: "Tên trùng lặp",
          type: "error",
        });
      });
  } else {
    await request
      .post("member", {
        name: dataName.value,
        group: dataGroup.value,
      })
      .then((res) => {
        isDialogCreateVisible.value = false;
        dataName.value = "";
        dataGroup.value = "";
        fetchUsers();
      })
      .catch((err) => {
        notify({
          title: "Thất bại",
          text: "Tên trùng lặp",
          type: "error",
        });
      });
  }
};
const deleteMember = async (id: number) => {
  await request
    .delete("member/" + idMember.value)
    .then((res) => {
      isDialogCreateVisible.value = false;
      idMember.value = null;
      dataName.value = "";
      dataGroup.value = "";

      fetchUsers();
    })
    .catch((err) => {
      console.log("🚀 ~ handleOpenPost ~ err:", err);
    });
};
// -----
</script>

<template>
  <div>
    <section>
      <VRow>
        <VCol cols="12">
          <VCard :title="languagePack.USER_MANAGE_TITLE">
            <VCardText>
              <VRow>
                <!-- 👉 Search for.... -->

                <VCol cols="12" sm="4">
                  <div style="height: 100%">
                    <VSelect
                      v-model="selectedOption"
                      :label="languagePack.USER_MANAGE_ORDER_BY"
                      :items="chooseSearch"
                      item-title="state"
                      item-value="abbr"
                    />
                  </div>
                </VCol>
                <!-- 👉 Search form -->
                <VCol cols="12" sm="4">
                  <div
                    class="app-user-search-filter d-flex align-center"
                    style="height: 100%"
                  >
                    <!-- 👉 Search  -->
                    <VTextField
                      v-model="searchQuery"
                      :placeholder="
                        languagePack.USER_MANAGE_SEARCHKEY_PLACEHOLDER
                      "
                      density="compact"
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
            </VCardText>

            <VDivider />
            <VCardText class="d-flex flex-wrap gap-4">
              <!-- 👉 Export button -->
              <VBtn @click="handleOpenMember(null)" variant="tonal">
                {{ languagePack.CREATE }}
              </VBtn>

              <VSpacer />

              <!-- <div class="app-user-search-filter d-flex align-center"> -->
              <!--
              👉 Search
              <VTextField
              v-model="searchQuery"
              placeholder="Search User"
              density="compact"
              class="me-3"
              />
            -->

              <!-- 👉 Add user button -->
              <!-- </div> -->
            </VCardText>
            <VDivider />
            <VProgressLinear
              v-if="loadingTable"
              height="10"
              indeterminate
              color="primary"
            />
            <VTable class="text-no-wrap">
              <!-- 👉 table head -->
              <thead>
                <tr>
                  <th scope="col">
                    {{ languagePack.USER_MANAGE_ID_USER }}
                  </th>
                  <th scope="col">
                    {{ languagePack.USER_MANAGE_GROUP }}
                  </th>
                  <th scope="col">
                    {{ languagePack.USER_MANAGE_username }}
                  </th>
                  <th scope="col">
                    {{ languagePack.KEYBOARD }}
                  </th>
                  <th scope="col">
                    {{ languagePack.MOUSE }}
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
                    <span class="text-capitalize text-base"
                      >{{ user.id }}
                    </span>
                  </td>
                  <!-- 👉 User -->

                  <td>
                    <span class="text-capitalize text-base">{{
                      user.group
                    }}</span>
                  </td>

                  <td>
                    <span class="text-base">{{ user.name }}</span>
                  </td>

                  <td>
                    <span class="text-capitalize text-base">{{
                      user.total_keyboard
                    }}</span>
                  </td>

                  <td>
                    <span class="text-capitalize text-base">{{
                      user.total_mouse
                    }}</span>
                  </td>

                  <!-- 👉 Actions -->
                  <td>
                    <VBtn
                      size="small"
                      color="warning"
                      :loading="user.id === loadingEditUser ? true : false"
                      @click="runLoadEdit(user.id)"
                    >
                      {{ languagePack.STATISTICAL }} </VBtn
                    >&ensp;
                    <VBtn
                      size="small"
                      color="primary"
                      @click="handleOpenMember(user.id)"
                    >
                      {{ languagePack.USER_MANAGE_ACTIONS_EDIT }} </VBtn
                    >&ensp;
                    <!--<VBtn
                      size="small"
                      color="success"
                      @click="openNotification(user.id)"
                    >
                      <VIcon icon="bxs-bell-plus" />
                    </VBtn> -->
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
      <!-- 👉 Add New User -->
    </section>
    <VDialog v-model="isDialogVisible" max-width="600">
      <!-- Dialog Activator -->
      <!-- Dialog Content -->
      <VCard :title="languagePack.USER_MANAGE_USER_PROFILE">
        <DialogCloseBtn
          variant="text"
          size="small"
          @click="isDialogVisible = false"
        />

        <VueApexCharts
          type="line"
          :height="217"
          :options="chartOptions"
          :series="series"
        />

        <VCardText class="d-flex justify-end gap-2">
          <VBtn
            color="secondary"
            variant="tonal"
            @click="isDialogVisible = false"
          >
            Close
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- 👉 Add New User -->
    <VDialog v-model="isDialogCreateVisible" max-width="600">
      <!-- Dialog Activator -->

      <!-- <VBtn v-bind="props"> Open Dialog </VBtn> -->

      <!-- Dialog Content -->
      <VCard :title="languagePack.USER_MANAGE_username">
        <DialogCloseBtn
          variant="text"
          size="small"
          @click="isDialogCreateVisible = false"
        />

        <VCardText>
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="dataName"
                :label="languagePack.USER_MANAGE_username"
              />
            </VCol>
            <VCol cols="12">
              <VSelect
                v-model="dataGroup"
                :label="languagePack.USER_MANAGE_GROUP"
                :items="['A', 'B', 'C', 'D', 'E', 'G', 'H', 'I', 'K', 'L']"
              />
            </VCol>
          </VRow>
        </VCardText>

        <VCardText class="d-flex justify-end gap-2">
          <VBtn variant="tonal" v-if="idMember" @click="deleteMember">
            Delete
          </VBtn>
          <VBtn @click="createMember">
            {{ languagePack.NOTIFY_ACTIONS_EDIT_BTN_SAVE }}
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>

<style lang="scss" scoped>
#app
  > div.v-locale-provider.v-locale--is-ltr
  > div
  > div
  > div
  > div.layout-content-wrapper
  > main
  > div
  > section
  > div
  > div.v-col.v-col-12
  > div
  > div:nth-child(3)
  > div
  > div:nth-child(1)
  > div
  > div
  > div {
  height: 40px;
}
.app-user-search-filter {
  inline-size: 385px;
}
.v-input.v-input--horizontal.v-input--density-comfortable.v-input--readonly.v-textarea.v-text-field.v-textarea--no-resize {
  width: 150px !important;
}
.text-capitalize {
  text-transform: capitalize;
}

.user-list-name:not(:hover) {
  color: rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity));
}

.per-page-select {
  margin-block: auto;

  .v-field__input {
    align-items: center;
    padding: 2px;
    font-size: 14px;
  }

  .v-field__append-inner {
    align-items: center;
    padding: 0;
    margin-inline-start: -2.5rem;

    .v-icon {
      margin-inline-start: 0 !important;
    }
  }
}
#app
  > div.v-locale-provider.v-locale--is-ltr
  > div
  > div
  > div
  > div.layout-content-wrapper
  > main
  > div
  > section
  > div
  > div.v-col.v-col-12
  > div
  > div:nth-child(3)
  > div
  > div:nth-child(1)
  > div
  > div
  > div
  > div
  > div.v-field__field {
  height: 40px;
  position: relative;
  top: -5px;
}

#app
  > div.v-locale-provider.v-locale--is-ltr
  > div
  > div
  > div
  > div.layout-content-wrapper
  > main
  > div
  > section
  > div
  > div.v-col.v-col-12
  > div
  > div:nth-child(3)
  > div
  > div:nth-child(1)
  > div
  > div
  > div
  > div
  > div.v-field__append-inner {
  position: relative;
  bottom: 6px;
}
#app
  > div.v-locale-provider.v-locale--is-ltr
  > div
  > div
  > div
  > div.layout-content-wrapper
  > main
  > div
  > section
  > div
  > div.v-col.v-col-12
  > div
  > div:nth-child(3)
  > div
  > div:nth-child(1)
  > div
  > div
  > div
  > div
  > div.v-field__clearable {
  position: relative;
  bottom: 6px;
}
.txtmini {
  font-size: 13px;
}
.text-no-wrap {
  font-size: 13px;
}
.text-base {
  font-size: 13px;
}
.smail-bank {
  font-size: 11px;
}
</style>
