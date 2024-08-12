<script setup lang="ts">
import { onMounted } from "vue";
import type { UserProperties } from "@/@fake-db/types";
import { languagePack } from "@/languages";
import { formatUsdt } from "@/utils2/money";
import request from "@/utils2/request";
import { useUserListStore } from "@/views/apps/user/useUserListStore";

// 👉 Store
const userListStore = useUserListStore();
const searchQuery = ref("");
const selectedUser = ref();
const selectedPlan = ref();
const selectedStatus = ref();
const selectedItems = ref();
const rowPerPage = ref(10); // page size
const currentPage = ref(1);
const totalUsers = ref();
const totalPage = ref(1);

const users = ref<any>([]);
const nameUser = ref("");
const idUser = ref("");
const loadingTable = ref(false);
const loadingEditOrder = ref<any>(0);
const cnyAmount = ref();

watch(currentPage, (newVal, oldVal) => {
  fetchUsers(newVal);
});

// 👉 Test

// 👉 Fetching users
const fetchUsers = async (page = 1) => {
  // users.value = "";
  lstOrderLoad.value = "";
  try {
    loadingTable.value = true;

    const res = await request.get("admin/listing", {
      params: {
        page,
        limit: rowPerPage.value,
        nameUser: nameUser.value,
        userId: idUser.value,
      },
    });

    if (res.data.success) {
      lstOrderLoad.value = res.data.data;

      // users.value = res.data.data;
      totalUsers.value = res.data.count;
      totalPage.value = Math.ceil(totalUsers.value / rowPerPage.value);
      loadingTable.value = false;

      // return users.value.length;
    }
  } catch (error) {
    loadingTable.value = false;
  }
};

const dataStatisticsUser = ref<any>();
const dataStatisticsOrder = ref<any>();
const dataStatisticsAmount = ref<any>();
const checkDataThongKe = ref(false);
const percentageUser = ref();
const percentageOrder = ref();
const percentageMoney = ref();
const toFixedPercentageUser = ref();
async function fetchStatistics() {
  try {
    const res = await request.get("admin/statisticsOverview");
    console.log("🚀 ~ fetchStatistics ~ res:", res?.data);
    if (res.data.success == true) {
      if (res.data.Amount.amountPercentage == null)
        res.data.Amount.amountPercentage = 0;

      if (res.data.Order.percentage == null) res.data.Order.percentage = 0;

      dataStatisticsAmount.value = res.data.Amount;
      dataStatisticsUser.value = res.data.User;
      percentageUser.value = dataStatisticsUser.value.percentage;

      if (percentageUser.value)
        toFixedPercentageUser.value = percentageUser.value.toFixed(2);

      if (!percentageUser.value) toFixedPercentageUser.value = 0;

      dataStatisticsOrder.value = res.data.Order;
      checkDataThongKe.value = true;
    }
  } catch (error) {
    console.log(error);
  }
}

// Auto reload
// const intervalId = ref<NodeJS.Timer | null>(null);
// const autoFetchData = ref(false);
// const fetchData = async () => {
//   const length = await fetchUsers();
//   if (length === 0) {
//     clearInterval(intervalId.value!);
//     intervalId.value = null;
//   }
// };
// const startInterval = () => {
//   console.log("start")
//   intervalId.value = setInterval(fetchData, 10000);
// };
// onMounted(() => {
//   startInterval()
// });

// const stopInterval = () => {
//   console.log("stop")
//   clearInterval(intervalId.value!);
//   intervalId.value = null;
//   console.log("stop?:", intervalId.value) //had null but setInterval do not off
// };
// const toggleAutoFetchData = () => {
//   autoFetchData.value = !autoFetchData.value;
//   if (autoFetchData.value) {
//     startInterval();
//   } else {
//     stopInterval();
//   }
// };
// onBeforeUnmount(() => {
//   clearInterval(intervalId.value!);
// });
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

// 👉 search filters
const realSearch = ref();
const selectedOption = ref({ state: "ID", abbr: "id" });

watch(selectedOption, (newVal, oldVal) => {
  realSearch.value = newVal;
});

const chooseSearch = [
  { state: "ID", abbr: "id" },
  { state: "Name", abbr: "name" },
];

window.addEventListener("keyup", (event) => {
  if (event.keyCode === 13) SearchUser();
});

async function SearchUser() {
  try {
    lstOrderLoad.value = "";
    statusInterval.value = false;
    if (realSearch.value == "name") {
      idUser.value = "";
      nameUser.value = searchQuery.value;
      fetchUsers();
    }
    if (realSearch.value == "id") {
      nameUser.value = "";
      idUser.value = searchQuery.value;
      fetchUsers();
    } else {
      nameUser.value = "";
      idUser.value = searchQuery.value;
      fetchUsers();
    }

    // const eres = await fetchUsers();
    // console.log(eres, "test ");
    // if (!eres) {
    //   console.log(eres, "test ");
    //   notify({
    //     title: "Not found",
    //     text: "Not found user",
    //     type: "error",
    //   });
    // }
  } catch (error) {}
}

const resolveUserRoleVariant = (role: string) => {
  const roleLowerCase = role.toLowerCase();

  if (roleLowerCase === "subscriber")
    return { color: "primary", icon: "bx-user" };
  if (roleLowerCase === "author") return { color: "warning", icon: "bx-cog" };
  if (roleLowerCase === "maintainer")
    return { color: "success", icon: "bx-doughnut-chart" };
  if (roleLowerCase === "editor") return { color: "info", icon: "bx-pencil" };
  if (roleLowerCase === "admin") return { color: "error", icon: "bx-laptop" };

  return { color: "primary", icon: "bx-user" };
};

const resolveUserStatusVariant = (stat: number) => {
  // const statLowerCase = stat.toLowerCase();
  if (stat === 1) return "warning";
  if (stat === 3) return "success";
  if (stat === 2) return "secondary";

  return "primary";
};

const isAddNewUserDrawerVisible = ref(false);

// 👉 watching current page
watchEffect(() => {
  if (currentPage.value > totalPage.value) currentPage.value = totalPage.value;
});

// 👉 Convert To Currency

const convertToCurrency = (balance: number, exchangeRate: number) => {
  // Tỉ giá: 1 tệ = 3500 đồng
  const currency = balance / exchangeRate;

  return currency.toFixed(2); // Lấy 2 chữ số thập phân
};

// 👉 Computing pagination data
const paginationData = computed(() => {
  const firstIndex = lstOrderLoad.value.length
    ? (currentPage.value - 1) * rowPerPage.value + 1
    : 0;

  const lastIndex =
    lstOrderLoad.value.length + (currentPage.value - 1) * rowPerPage.value;

  return `${firstIndex}-${lastIndex} of ${totalUsers.value}`;
});

// SECTION Checkbox toggle
const selectedRows = ref<string[]>([]);
const selectAllUser = ref(false);

// 👉 add/remove all checkbox ids in array
const selectUnselectAll = () => {
  selectAllUser.value = !selectAllUser.value;
  if (selectAllUser.value) {
    lstOrderLoad.value.forEach((user: any) => {
      if (!selectedRows.value.includes(`check${user.id}`))
        selectedRows.value.push(`check${user.id}`);
    });
  } else {
    selectedRows.value = [];
  }
};

// 👉 watch if checkbox array is empty all select should be uncheck
watch(
  selectedRows,
  () => {
    if (!selectedRows.value.length) selectAllUser.value = false;
  },
  { deep: true }
);

// 👉 watch if checkbox array is empty all select should be uncheck

// 👉 add/remove individual checkbox from array
const addRemoveIndividualCheckbox = (checkID: string) => {
  if (selectedRows.value.includes(checkID)) {
    const index = selectedRows.value.indexOf(checkID);

    selectedRows.value.splice(index, 1);
  } else {
    selectedRows.value.push(checkID);
    selectAllUser.value = true;
  }
};

// !SECTION checkbox toggle

// 👉 Add new user
const addNewUser = (userData: UserProperties) => {
  userListStore.addUser(userData);

  // refetch User
  // fetchUsers();
};

const computedMoreList = computed(() => {
  return (paramId: number, paramStatus: string) =>
    paramStatus == "pending"
      ? [
          {
            title: "View",
            value: "view",
            prependIcon: "bx-show",
            to: { name: "apps-user-view-id", params: { id: paramId } },
          },
          { title: "Win", value: "approve", prependIcon: "bx-check" },
          { title: "Lose", value: "cancel", prependIcon: "bx-block" },
          { title: "Delete", value: "delete", prependIcon: "bx-trash-alt" },
        ]
      : [
          {
            title: "View",
            value: "view",
            prependIcon: "bx-show",
            to: { name: "apps-user-view-id", params: { id: paramId } },
          },
          { title: "EditS", value: "edit", prependIcon: "bx-pencil" },
          { title: "Delete", value: "delete", prependIcon: "bx-trash-alt" },
        ];
});

const userListMeta = [
  {
    icon: "bx-user",
    color: "primary",
    title: "Session",
    stats: 12,
    percentage: 1,
    subtitle: "Total Users",
  },
  {
    icon: "bx-user-plus",
    color: "error",
    title: "Paid Users",
    stats: "4,567",
    percentage: +18,
    subtitle: "Last week analytics",
  },
  {
    icon: "bx-user-check",
    color: "success",
    title: "Active Users",
    stats: "19,860",
    percentage: -14,
    subtitle: "Last week analytics",
  },
  {
    icon: "bx-user-voice",
    color: "warning",
    title: "Pending Users",
    stats: "237",
    percentage: +42,
    subtitle: "Last week analytics",
  },
];

// Khai báo biến
const lstOrderLoad = ref<any>([]);
const page = ref(1);
const limitPage = ref(20);

// lệnh kiểm soat
const reLoadOrder = async () => {
  const res = await request.get("admin/listing", {
    params: {
      page: page.value,
      limit: limitPage.value,
    },
  });

  const data = res.data;

  lstOrderLoad.value = data.data;
};

function changeDate(inputDateTime = "") {
  // Tạo đối tượng Date từ chuỗi đầu vào
  const dateObj = new Date(inputDateTime);

  // Cộng thêm 7 giờ
  dateObj.setUTCHours(dateObj.getUTCHours() + 7);

  // Lấy thông tin giờ, phút và giây
  const hours = dateObj.getUTCHours();
  const minutes = dateObj.getUTCMinutes();
  const seconds = dateObj.getUTCSeconds();

  // Lấy ngày, tháng và năm
  const day = dateObj.getUTCDate();
  const month = dateObj.getUTCMonth() + 1; // Lưu ý: Tháng trong JavaScript bắt đầu từ 0, nên cần cộng thêm 1
  const year = dateObj.getUTCFullYear();

  // Tạo chuỗi kết quả
  // console.log(outputDateTime); // Kết quả: 07:22:58 24-05-2023
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${day
    .toString()
    .padStart(2, "0")}-${month.toString().padStart(2, "0")}-${year}`;
}

async function chooseResult(orderId: number, orderResult: string) {
  loadingEditOrder.value = orderId;
  await request.post("admin/order_confirm", {
    orderId,
    orderResult,
  });
  loadingEditOrder.value = 0;
  reLoadOrder();
}

const idInterval = ref();
const statusInterval = ref(true);
function setUploadTable() {
  idInterval.value = setInterval(() => {
    reLoadOrder();
    currentPage.value = 1;
  }, 2500);
}
onUnmounted(() => {
  clearInterval(idInterval.value);
});
onMounted(() => {
  fetchUsers();
  fetchStatistics();

  // reLoadOrder();
  // setUploadTable();
  // watch(statusInterval, (newVal, oldVal)=>{
  //   if (newVal== true) {
  //   setUploadTable();
  // } else {
  //   clearInterval(idInterval.value);
  // }
  // })
});

// -----
</script>

<template>
  <section>
    <VRow v-if="checkDataThongKe">
      <VCol cols="12" sm="6" lg="3">
        <VCard>
          <VCardText class="d-flex justify-space-between">
            <div>
              <span>{{ languagePack.DASHBOARD_OVERVIEW_TITLE_USER }}</span>
              <div class="d-flex align-center gap-2">
                <h6 class="text-h6">
                  {{ dataStatisticsUser.total }}
                </h6>
                <span
                  :class="
                    toFixedPercentageUser > 0 ? 'text-success' : 'text-error'
                  "
                  class="text-sm"
                >
                  ({{
                    toFixedPercentageUser > 0
                      ? `+${toFixedPercentageUser}`
                      : toFixedPercentageUser
                  }}%)
                </span>
              </div>
              <span class="text-sm">{{
                languagePack.DASHBOARD_OVERVIEW_SUBTITLE_USER
              }}</span>
            </div>

            <VAvatar rounded variant="tonal" color="primary" icon="bx-user" />
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" lg="3">
        <VCard>
          <VCardText class="d-flex justify-space-between">
            <div>
              <span>{{ languagePack.DASHBOARD_OVERVIEW_TITLE_MONEY }}</span>
              <div class="d-flex align-center gap-2">
                <h6 class="text-h6">{{ dataStatisticsAmount.totalAmount }}$</h6>
                <span
                  :class="
                    dataStatisticsAmount.amountPercentage > 0
                      ? 'text-success'
                      : 'text-error'
                  "
                  class="text-sm"
                >
                  ({{
                    dataStatisticsAmount.amountPercentage > 0
                      ? `+${dataStatisticsAmount.amountPercentage.toFixed(2)}`
                      : dataStatisticsAmount.amountPercentage.toFixed(2)
                  }}%)
                </span>
              </div>
              <span class="text-sm">{{
                languagePack.DASHBOARD_OVERVIEW_SUBTITLE_MONEY
              }}</span>
            </div>

            <VAvatar
              rounded
              variant="tonal"
              color="primary"
              icon="bx-money-withdraw"
            />
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" lg="3">
        <VCard>
          <VCardText class="d-flex justify-space-between">
            <div>
              <span>{{ languagePack.DASHBOARD_OVERVIEW_TITLE_ORDER }}</span>
              <div class="d-flex align-center gap-2">
                <h6 class="text-h6">
                  {{ dataStatisticsOrder.total }}
                </h6>
                <span
                  :class="
                    dataStatisticsOrder.percentage > 0
                      ? 'text-success'
                      : 'text-error'
                  "
                  class="text-sm"
                >
                  ({{
                    dataStatisticsOrder.percentage > 0
                      ? `+${dataStatisticsOrder.percentage.toFixed(2)}`
                      : dataStatisticsOrder.percentage.toFixed(2)
                  }}%)
                </span>
              </div>
              <span class="text-sm">{{
                languagePack.DASHBOARD_OVERVIEW_SUBTITLE_ORDER
              }}</span>
            </div>

            <VAvatar
              rounded
              variant="tonal"
              color="primary"
              icon="bx-candles"
            />
          </VCardText>
        </VCard>
      </VCol>

      <!--
        <VCol cols="12" sm="6" lg="3">
        <VCard>
        <VCardText class="d-flex justify-space-between">
        <div>
        <span>{{
        languagePack.DASHBOARD_OVERVIEW_TITLE_FUTURE_FEATURES
        }}</span>
        <div class="d-flex align-center gap-2">
        <h6 class="text-h6">
        {{ 700 }}
        </h6>
        <span
        :class="30 > 0 ? 'text-success' : 'text-error'"
        class="text-sm"
        >
        ({{ 30 > 0 ? `+${30}` : 30 }}%)
        </span>
        </div>
        <span class="text-sm">{{
        languagePack.DASHBOARD_OVERVIEW_SUBTITLE_FUTURE_FEATURES
        }}</span>
        </div>

        <VAvatar rounded variant="tonal" color="green" icon="bx-wifi-off" />
        </VCardText>
        </VCard>
        </VCol>
      -->
      <VCol cols="12">
        <VCard :title="languagePack.DASHBOARD_OVERVIEW_LIST_ORDER_TITLE">
          <VCardText>
            <VRow>
              <!-- 👉 Search for.... -->

              <VCol cols="12" sm="6" lg="4" md="4">
                <div style="height: 100%">
                  <VSelect
                    v-model="selectedOption"
                    :label="languagePack.DASHBOARD_OVERVIEW_LIST_ORDER_BY"
                    :items="chooseSearch"
                    item-title="state"
                    item-value="abbr"
                  />
                </div>
              </VCol>
              <!-- 👉 Search form -->
              <VCol cols="12" sm="6" lg="4" md="4">
                <div
                  class="app-user-search-filter d-flex align-center"
                  style="height: 100%"
                >
                  <!-- 👉 Search  -->
                  <VTextField
                    v-model="searchQuery"
                    :placeholder="
                      languagePack.DASHBOARD_OVERVIEW_LIST_ORDER_SEARCHKEY_PLACEHOLDER
                    "
                    density="compact"
                    class="me-3"
                  />

                  <!-- <VBtn> <VIcon start icon="bx-search" />Search </VBtn> -->
                  <VBtn class="me-3" @click="SearchUser">
                    {{
                      languagePack.DASHBOARD_OVERVIEW_LIST_ORDER_SEARCHKEY_BUTTON
                    }}
                    <VIcon end icon="bx-search" />
                  </VBtn>

                  <VBtn
                    density="compact"
                    icon="mdi-reload"
                    @click="fetchUsers(currentPage)"
                  />
                  <!--
                    <VBtn @click="toggleAutoFetchData">{{ autoFetchData ? 'Tắt' : 'Bật' }}
                    <VIcon end icon="bx-search" />
                    </VBtn>
                  -->
                </div>
              </VCol>

              <!--
                <VCol cols="12" sm="6" lg="4" md="4" style="display: flex; justify-content: center;">

                <VSwitch
                v-model="statusInterval"
                inset
                :label="`${languagePack.AUTO_UPDATE}: ${statusInterval.toString() === 'true' ? 'YES' : 'NO'}`"
                :true-value=true
                :false-value=false
                />
                </VCol>
              -->
            </VRow>
          </VCardText>

          <VDivider />

          <VCardText class="d-flex flex-wrap gap-4">
            <!-- 👉 Export button -->
            <VBtn
              variant="tonal"
              color="secondary"
              prepend-icon="bx-arrow-from-bottom"
            >
              {{ languagePack.DASHBOARD_OVERVIEW_LIST_ORDER_EXPORT }}
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
            <!-- <VBtn @click="isAddNewUserDrawerVisible = true"> Add User </VBtn> -->
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
                  {{ languagePack.DASHBOARD_OVERVIEW_LIST_ORDER_ID_ORDER }}
                </th>
                <th scope="col">ID USER</th>
                <!-- <th scope="col">
                  {{ languagePack.USER_MANAGE_username }}
                </th> -->
                <th scope="col">
                  {{ languagePack.DASHBOARD_OVERVIEW_LIST_ORDER_INPUT }}
                </th>
                <th scope="col">
                  {{ languagePack.DASHBOARD_OVERVIEW_LIST_ORDER_OUTPUT }}
                </th>
                <th scope="col">
                  {{ languagePack.DASHBOARD_OVERVIEW_LIST_ORDER_SYMBOLS }}
                </th>
                <th scope="col">
                  {{ languagePack.DASHBOARD_OVERVIEW_LIST_ORDER_TYPE }}
                </th>
                <th scope="col">
                  {{ languagePack.DASHBOARD_OVERVIEW_LIST_ORDER_DURATION }}
                </th>
                <!--
                  <th scope="col">
                  {{ languagePack.NOTE }}
                  </th>
                -->
                <th scope="col">
                  {{ languagePack.DASHBOARD_OVERVIEW_LIST_ORDER_AMOUNT }}
                </th>
                <th scope="col">
                  {{ languagePack.DASHBOARD_OVERVIEW_LIST_ORDER_PROFIT }}
                </th>

                <th scope="col">
                  {{ languagePack.DASHBOARD_OVERVIEW_LIST_ORDER_CREATE_AT }}
                </th>
                <th scope="col" style="text-align: center">
                  {{ languagePack.DASHBOARD_OVERVIEW_LIST_ACTIONS }}
                </th>
              </tr>
            </thead>

            <!-- 👉 table body -->
            <tbody>
              <tr v-for="order in lstOrderLoad" :key="order.id">
                <!-- 👉 Checkbox -->
                <!--
                  <td>
                  <VCheckbox
                  :id="`check${user.id}`"
                  :model-value="selectedRows.includes(`check${user.id}`)"
                  class="mx-1"
                  @click="addRemoveIndividualCheckbox(`check${user.id}`)"
                  />
                  </td>
                -->
                <td>
                  <span class="text-capitalize text-base txtmini">{{
                    order.id
                  }}</span>
                </td>
                <td style="text-align: center">
                  <span class="text-capitalize text-base txtmini">{{
                    order.user_id
                  }}</span>
                </td>
                <!-- 👉 User -->
                <!--
                  <td>
                  <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                  <h6 class="text-sm">
                  <RouterLink
                  :to="{
                  name: 'apps-user-view-id',
                  params: { id: order.id },
                  }"
                  class="font-weight-medium user-list-name txtmini"
                  >
                  {{ order.username }}
                  </RouterLink>
                  </h6>
                  </div>
                  </div>
                  </td>
                -->

                <!-- 👉 Role -->
                <!-- <td>
                  <span class="text-capitalize text-base txtmini">{{
                    order.fullName
                  }}</span>
                </td> -->
                <td>
                  <span class="text-capitalize text-base txtmini">{{
                    order.entry_price
                  }}</span>
                </td>
                <td>
                  <span class="text-capitalize text-base txtmini">{{
                    order.exit_price
                  }}</span>
                </td>
                <td>
                  <span class="text-capitalize text-base txtmini">{{
                    order.name
                  }}</span>
                </td>

                <!-- 👉 Plan -->
                <td class="text-capitalize text-high-emphasis">
                  <span
                    :class="[
                      order.order_type == 'long'
                        ? 'success-green'
                        : 'error-red',
                    ]"
                    class="text-base txtmini"
                    >{{ order.order_type }}</span
                  >
                </td>
                <td style="text-align: center; align-items: center">
                  <span class="text-base txtmini text-high-emphasis">{{
                    order.order_duration
                  }}</span>
                </td>
                <!--
                  <td>
                  <VTextarea
                  v-model="order.note"
                  label="----"
                  no-resize
                  rows="1"
                  />

                  </td>
                -->
                <!-- 👉 Billing -->
                <td>
                  <span class="text-base txtmini text-high-emphasis">{{
                    formatUsdt(order.amount)
                  }}</span>
                </td>
                <td class="text-capitalize txtmini text-high-emphasis">
                  <span
                    :class="[
                      order.order_result == 'win'
                        ? 'success-green'
                        : 'error-red',
                    ]"
                    class="text-base txtmini"
                  >
                    {{
                      order.order_result == "win"
                        ? formatUsdt(parseFloat(order.profit))
                        : formatUsdt(-parseFloat(order.amount))
                    }}
                  </span>
                </td>
                <td class="text-capitalize text-high-emphasis">
                  <span class="text-base txtmini">{{
                    changeDate(order.createdAt)
                  }}</span>
                </td>
                <!-- 👉 Status -->
                <!-- 👉 Actions -->
                <td class="text-center" style="width: 80px">
                  <VBtn
                    v-if="order.order_result == 'pending'"
                    color="success"
                    size="small"
                    :loading="order.id === loadingEditOrder ? true : false"
                    :disabled="order.id === loadingEditOrder ? true : false"
                    @click="chooseResult(order.id, 'win')"
                  >
                    Win
                  </VBtn>
                  <VBtn
                    v-else
                    :color="order.order_result == 'win' ? 'success' : 'error'"
                    size="small"
                    variant="text"
                  >
                    KQ: {{ order.order_result }} </VBtn
                  >&ensp;
                  <VBtn
                    v-if="order.order_result == 'pending'"
                    color="error"
                    size="small"
                    :loading="order.id === loadingEditOrder ? true : false"
                    :disabled="order.id === loadingEditOrder ? true : false"
                    @click="chooseResult(order.id, 'lose')"
                  >
                    Lose
                  </VBtn>
                </td>
              </tr>
            </tbody>

            <!-- 👉 table footer  -->
            <tfoot v-show="!lstOrderLoad.length">
              <tr>
                <td colspan="7" class="text-center text-body-1">
                  No data available
                </td>
              </tr>
            </tfoot>
          </VTable>
          <VDivider />
          <!-- SECTION Pagination -->
          <VCardText class="d-flex flex-wrap justify-end gap-4 pa-2">
            <!-- 👉 Rows per page -->
            <div class="d-flex align-center" style="width: 200px">
              <span class="text-no-wrap text-sm me-3"
                >{{
                  languagePack.DASHBOARD_OVERVIEW_LIST_ORDER_ROW_PER_PAGE
                }}:</span
              >
              <VSelect
                v-model="rowPerPage"
                density="compact"
                class="per-page-select"
                variant="plain"
                :items="[10, 20, 30, 50]"
              />
            </div>

            <!-- 👉 Pagination and pagination meta -->
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
    <!--
      <AddNewUserDrawer
      v-model:isDrawerOpen="isAddNewUserDrawerVisible"
      @user-data="addNewUser"
      />
    -->
    <VProgressLinear v-else height="10" indeterminate color="primary" />
  </section>
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

.text-capitalize {
  text-transform: capitalize;
}

.user-list-name:not(:hover) {
  color: rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity));
}
.v-textarea {
  width: 146px !important;
}
.success-green {
  color: #4ec110;
}
.error-red {
  color: #db3b24;
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
  font-size: 12px;
}
</style>
