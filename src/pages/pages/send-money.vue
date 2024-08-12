<script setup lang="ts">
import { notify } from "@kyvg/vue3-notification";
import { onMounted, ref } from "vue";
import type { UserProperties } from "@/@fake-db/types";
import { formatUsdt, formatVnd } from "@/utils2/money";

import { languagePack } from "@/languages";
import request from "@/utils2/request";
import { useUserListStore } from "@/views/apps/user/useUserListStore";

const userListStore = useUserListStore();
const searchQuery = ref("");
const selectedUser = ref();
const selectedPlan = ref();
const selectedStatus = ref();
const rowPerPage = ref(10); // page size
const currentPage = ref(1);
const totalUsers = ref(14);
const totalPage = ref(1);
const users = ref<any>([]);
const nameUser = ref("");
const loadingTable = ref(false);
const cnyAmount = ref();
const usdAmount = ref();
const id = ref();
const loading = ref(false);
const amount = ref();

const clickMe = async () => {
  loading.value = true;
  try {
    await request
      .post("admin/reward_and_punishment", {
        id: id.value,
        amount: amount.value,
      })
      .then((res) => {
        if (res.data.success == true) {
          loading.value = false;
          notify({
            title: "Thành công",
            text: "Cập nhật thành công!",
            type: "success",
          });
          reLoadOrder(1);
          id.value = "";
          amount.value = "";
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

watch(currentPage, (newVal, oldVal) => {
  reLoadOrder(newVal);
});

// 👉 Test
// Fetch data
async function usdToCny() {
  const reponse = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
  const data = await reponse.json();
  const usdToCnyRate = data.rates.VND;

  // Thực hiện chuyển đổi từ USDT sang VND
  // const usdtAmount = number; // Số tiền USDT cần chuyển đổi
  // cnyAmount.value = usdtAmount * usdToCnyRate;
  usdAmount.value = data.rates.USD;

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
    if (realSearch.value == "name") {
      id.value = "";
      nameUser.value = searchQuery.value;
      reLoadOrderSearchName(nameUser.value);
    } else {
      nameUser.value = "";
      id.value = searchQuery.value;
      reLoadOrderSearchId(id.value);
    }
  } catch (error) {}
}
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

// SECTION Checkbox toggle
const selectedRows = ref<string[]>([]);
const selectAllUser = ref(false);

// 👉 add/remove all checkbox ids in array
const selectUnselectAll = () => {
  selectAllUser.value = !selectAllUser.value;
  if (selectAllUser.value) {
    users.value.forEach((user: any) => {
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
  return (paramId: number) => [
    {
      title: "View",
      value: "view",
      prependIcon: "bx-show",
      to: { name: "apps-user-view-id", params: { id: paramId } },
    },
    { title: "Edit", value: "edit", prependIcon: "bx-pencil" },
    { title: "Delete", value: "delete", prependIcon: "bx-trash-alt" },
  ];
});

const userListMeta = [
  {
    icon: "bx-user",
    color: "primary",
    title: "Session",
    stats: "21,459",
    percentage: +29,
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
const lstTransactions = ref<any>([]);
const page = ref(1);
const limitPage = ref(10);
const data = ref<any>();
const length = ref<number>();

// lệnh kiểm soat
const reLoadOrderSearchName = async (fullName: string) => {
  try {
    loadingTable.value = true;

    const res = await request.get("admin/listing_transactions", {
      params: {
        page: page.value,
        limit: limitPage.value,
        typeTransaction: "manual",
        fullName,
      },
    });

    loadingTable.value = false;
    data.value = res.data;
    length.value = data.value.transactions.length;
    totalUsers.value = res.data.count;
    totalPage.value = Math.ceil(totalUsers.value / limitPage.value);
    statusInterval.value = false;
    lstTransactions.value = data.value.transactions;
  } catch (error) {
    loadingTable.value = false;
  }
};

const reLoadOrderSearchId = async (transactionId: string) => {
  try {
    loadingTable.value = true;

    const res = await request.get("admin/listing_transactions", {
      params: {
        page: page.value,
        limit: limitPage.value,
        typeTransaction: "manual",
        userId: transactionId,
      },
    });

    data.value = res.data;
    loadingTable.value = false;
    totalUsers.value = res.data.count;
    totalPage.value = Math.ceil(totalUsers.value / limitPage.value);
    length.value = data.value.transactions.length;
    statusInterval.value = false;
    lstTransactions.value = data.value.transactions;
  } catch (error) {
    console.log(error);
    loadingTable.value = false;
  }
};

const reLoadOrder = async (page: number) => {
  try {
    loadingTable.value = true;

    const res = await request.get("admin/listing_transactions", {
      params: {
        page,
        limit: limitPage.value,
        typeTransaction: "manual",
      },
    });

    data.value = res.data;
    loadingTable.value = false;
    length.value = data.value.transactions.length;
    totalUsers.value = res.data.count;
    totalPage.value = Math.ceil(totalUsers.value / limitPage.value);
    lstTransactions.value = data.value.transactions;
  } catch (error) {
    loadingTable.value = false;
  }
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

// const idInterval = ref()
// function setUploadTable(){
//   idInterval.value = setInterval(()=>{
//     reLoadOrder(1)
//   },5000)
// }
// 👉 Computing pagination data
const paginationData = computed(() => {
  const firstIndex = length.value
    ? (currentPage.value - 1) * rowPerPage.value + 1
    : 0;

  const lastIndex = length.value! + (currentPage.value - 1) * rowPerPage.value;

  return `${firstIndex}-${lastIndex} of ${totalUsers.value}`;
});

const statusInterval = ref(true);

onUnmounted(() => {
  // clearInterval(idInterval.value)
});
onMounted(() => {
  reLoadOrder(1);

  //   setUploadTable()
  //   watch(statusInterval, (newVal, oldVal)=>{
  //     if (newVal== true) {
  //     setUploadTable();
  //   } else {
  //     clearInterval(idInterval.value);
  //   }
  // })
});

// -----
</script>

<template>
  <section>
    <VRow>
      <VCol cols="12">
        <VCard
          :title="languagePack.NAVIGATION_SENDMONEY"
          style="padding: 10px; height: 260px"
        >
          <VRow>
            <VCol cols="12" sm="4">
              <VTextField
                v-model="id"
                clearable
                clear-icon="bx-x-circle"
                label="ID"
                type="text"
              >
                <!-- Prepend -->
                <!--
                  <template #prepend>
                  <VTooltip location="bottom">
                  <template #activator="{ props }">
                  <VIcon
                  v-bind="props"
                  icon="bx-help-circle"
                  />
                  </template>
                  I'm a tooltip
                  </VTooltip>
                  </template>
                -->

                <!-- AppendInner -->

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
            </VCol>
            <VCol cols="12" sm="4">
              <VTextField
                v-model="amount"
                clearable
                clear-icon="bx-x-circle"
                :label="languagePack.NAVIGATION_AMOUNT"
                type="text"
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
            </VCol>
            <VCol cols="12" sm="4" style="display: flex; align-items: flex-end">
              <VBtn
                :size="$vuetify.display.smAndDown ? 'small' : 'large'"
                class="mt-n3"
                :icon="$vuetify.display.smAndDown"
                @click="clickMe"
              >
                <VIcon icon="bx-target-lock" />
                <span v-if="$vuetify.display.mdAndUp" class="ms-3">{{
                  languagePack.NAVIGATION_SUBMIT
                }}</span>
              </VBtn>
            </VCol>
          </VRow>

          <VRow />
          <VRow>
            <!-- 👉 Search for.... -->

            <VCol cols="12" sm="4">
              <div style="height: 100%">
                <VSelect
                  v-model="selectedOption"
                  :label="languagePack.INVOICE_DEPOINT_ORDER_BY"
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
                    languagePack.INVOICE_DEPOINT_SEARCHKEY_PLACEHOLDER
                  "
                  density="compact"
                  class="me-3"
                />

                <!--
                  <VBtn @click="toggleAutoFetchData">{{ autoFetchData ? 'Tắt' : 'Bật' }}
                  <VIcon end icon="bx-search" />
                  </VBtn>
                -->
              </div>
            </VCol>
            <VCol cols="12" sm="4">
              <div
                class="app-user-search-filter d-flex align-center"
                style="height: 100%"
              >
                <VBtn @click="SearchUser">
                  {{ languagePack.INVOICE_DEPOINT_SEARCH_BUTTON }}
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
        </VCard>
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
              <!--
                <th scope="col" style="width: 48px">
                <VCheckbox
                :model-value="selectAllUser"
                :indeterminate="
                users.length !== selectedRows.length &&
                !!selectedRows.length
                "
                class="mx-1"
                @click="selectUnselectAll"
                />
                </th>
              -->
              <th scope="col">
                {{ languagePack.ID_USER }}
              </th>
              <!-- <th scope="col">
                {{ languagePack.USER_MANAGE_username }}
              </th> -->
              <th scope="col">
                {{ languagePack.INVOICE_DEPOINT_TOTAL_AMOUNT_VN }}(VND)
              </th>
              <th scope="col">
                {{ languagePack.INVOICE_DEPOINT_TOTAL_AMOUNT_USD }}($)
              </th>
              <th scope="col">
                {{ languagePack.INVOICE_DEPOINT_BALANCE }}
              </th>
              <th scope="col">
                {{ languagePack.INVOICE_DEPOINT_BANK }}
              </th>
              <!-- <th scope="col">STATUS</th> -->
              <th scope="col">
                {{ languagePack.INVOICE_DEPOINT_CREATE_AT }}
              </th>
              <th scope="col" style="text-align: center">
                {{ languagePack.INVOICE_DEPOINT_ACTION }}
              </th>
            </tr>
          </thead>

          <!-- 👉 table body -->
          <tbody>
            <tr v-for="order in lstTransactions" :key="order.transactionId">
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

              <!-- 👉 User -->
              <td>
                <span class="text-capitalize text-base text-small-txt"
                  >{{ order.user_id }}
                </span>
              </td>
              <!-- <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <span class="text-capitalize text-base text-small-txt">
                      {{ order.fullName }}
                    </span>
                  </div>
                </div>
              </td> -->

              <!-- 👉 Role -->
              <td>
                <span
                  class="text-capitalize text-base text-small-txt"
                  :class="[order.amount > 0 ? 'success-green' : 'error-red']"
                  >{{ formatVnd(order.amount * cnyAmount) }}</span
                >
              </td>

              <td>
                <span
                  class="text-capitalize text-base text-small-txt"
                  :class="[order.amount > 0 ? 'success-green' : 'error-red']"
                >
                  {{ formatUsdt(order.amount) }}</span
                >
              </td>
              <td>
                <span class="text-capitalize text-base text-small-txt">
                  {{ formatUsdt(order.balance) }}</span
                >
              </td>
              <!--
                <td>
                <span class="text-capitalize text-base">{{ formatUsdt(order.balance) }}</span>
                </td>
                <td>
                <span class="text-capitalize text-base">{{ formatUsdt(order.balanceNow) }}</span>
                </td>
              -->

              <!-- 👉 Plan -->
              <!--
                <td class="text-capitalize text-high-emphasis">
                <span class="text-base">{{ order.status }}</span>
                </td>
              -->
              <td>
                <span class="text-capitalize text-base smail-bank"
                  >{{ languagePack.INVOICE_DEPOINT_ADDBANK_USER_BANK_NAME }}:
                  {{
                    order.nameUser ||
                    languagePack.INVOICE_DEPOINT_ADDBANK_STATUS
                  }}
                  <br />{{ languagePack.INVOICE_DEPOINT_ADDBANK_BANK_NUMBER }}:
                  {{
                    order.numberCard ||
                    languagePack.INVOICE_DEPOINT_ADDBANK_STATUS
                  }}<br />{{ languagePack.INVOICE_DEPOINT_ADDBANK_BANK_NAME }}:
                  {{
                    order.bankName ||
                    languagePack.INVOICE_DEPOINT_ADDBANK_STATUS
                  }}</span
                >
              </td>
              <td class="text-capitalize text-high-emphasis">
                <span class="text-base">{{ changeDate(order.createdAt) }}</span>
              </td>
              <!-- 👉 Status -->
              <!-- 👉 Actions -->
              <!--
                <td class="text-center" style="width: 80px" v-if="order.status == 'pending' ">
                <VBtn color="success" size="small" @click="sendResultDepoint(order.transactionId,'approved')">
                {{ languagePack.INVOICE_DEPOINT_ACTION_APPROVED }}
                </VBtn>&ensp;
                <VBtn color="error" size="small" @click="sendResultDepoint(order.transactionId,'rejected')">
                {{ languagePack.INVOICE_DEPOINT_ACTION_CANCEL }}
                </VBtn>
                </td>
              -->
              <td class="text-center" style="width: 80px">
                <VBtn
                  v-if="order.status == 'approved'"
                  color="success"
                  variant="text"
                  size="small"
                >
                  {{ languagePack.INVOICE_DEPOINT_ACTION_APPROVED }}
                </VBtn>
                <VBtn v-else color="error" variant="text" size="small">
                  {{ languagePack.INVOICE_DEPOINT_ACTION_CANCEL }}
                </VBtn>
              </td>
            </tr>
          </tbody>
        </VTable>
        <!-- SECTION Pagination -->
        <VCardText class="d-flex flex-wrap justify-end gap-4 pa-2">
          <!-- 👉 Rows per page -->

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
      </VCol>
    </VRow>
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
.smail-bank {
  font-size: 11px;
}
.text-small-txt {
  font-size: 13px !important;
}
.success-green {
  color: #4ec110;
}
.error-red {
  color: #db3b24;
}
</style>
