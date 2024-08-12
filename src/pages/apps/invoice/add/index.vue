<script setup lang="ts">
import { onMounted } from "vue";
import type { UserProperties } from "@/@fake-db/types";
import { languagePack } from "@/languages";
import { formatUsdt, formatVnd } from "@/utils2/money";
import request from "@/utils2/request";
import AddNewUserDrawer from "@/views/apps/user/list/AddNewUserDrawer.vue";
import { useUserListStore } from "@/views/apps/user/useUserListStore";

// 👉 Store
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
const idUser = ref("");
const loadingTable = ref(false);
const loadingEditOrder = ref<any>(0);
const cnyAmount = ref();
const usdAmount = ref();

watch(currentPage, (newVal, oldVal) => {
  reLoadOrder(newVal);
});
const fee = ref();

const getConfig = async () => {
  try {
    await request.get("admin/config/get_config").then((res) => {
      if (res.data.success === true)
        fee.value = res.data.data[0].withdrawal_fee;
    });
  } catch (error) {
    console.log(error);
  }
};

getConfig();

// 👉 Test

// // 👉 Fetching users
// const fetchUsers = async (page = 1) => {
//   users.value = "";
//   try {
//     loadingTable.value = true;
//     const res = await request.get("api/admin/listingUser", {
//       params: {
//         page,
//         limit: rowPerPage.value,
//         nameUser: nameUser.value,
//         id: idUser.value,
//       },
//     });
//     if (res.data.success) {
//       loadingTable.value = false;
//       users.value = res.data.data;
// totalUsers.value = res.data.count;
// totalPage.value = Math.ceil(totalUsers.value / rowPerPage.value);

//       return users.value.length;
//     }
//   } catch (error) {
//     loadingTable.value = false;
//   }
// };

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
const VNDVal = ref();
async function usdToCny() {
  const reponse = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
  const data = await reponse.json();
  const usdToCnyRate = data.rates.CNY;

  // Thực hiện chuyển đổi từ USDT sang VND
  // const usdtAmount = number; // Số tiền USDT cần chuyển đổi
  // cnyAmount.value = usdtAmount * usdToCnyRate;
  usdAmount.value = data.rates.USD;
  VNDVal.value = data.rates.VND;

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
      idUser.value = "";
      nameUser.value = searchQuery.value;
      reLoadOrderSearchName(nameUser.value);
    } else {
      nameUser.value = "";
      idUser.value = searchQuery.value;
      reLoadOrderSearchId(idUser.value);
    }
  } catch (error) {}
}

const isAddNewUserDrawerVisible = ref(false);

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

// Khai báo biến
const lstTransactions = ref<any>([]);
const page = ref(1);
const limitPage = ref(15);

// lệnh kiểm soat
const reLoadOrderSearchName = async (fullName: string) => {
  clearInterval(idInterval.value);

  try {
    loadingTable.value = true;

    const res = await request.get("admin/listing_transactions", {
      params: {
        page: page.value,
        limit: limitPage.value,
        typeTransaction: "withdrawal",
        fullName,
      },
    });

    const data = res.data;

    lstTransactions.value = data.transactions;
    loadingTable.value = false;
    console.log(data);
    statusInterval.value = false;
  } catch (error) {
    console.log(error);
    loadingTable.value = false;
  }
};

const reLoadOrderSearchId = async (transactionId: string) => {
  clearInterval(idInterval.value);

  try {
    const res = await request.get("admin/listing_transactions", {
      params: {
        page: page.value,
        limit: limitPage.value,
        typeTransaction: "withdrawal",
        userId: transactionId,
      },
    });

    const data = res.data;

    console.log(data);
    statusInterval.value = false;
    lstTransactions.value = data.transactions;
  } catch (error) {
    loadingTable.value = false;
    console.log(error);
  }
};

const reLoadOrder = async (page: number) => {
  try {
    loadingTable.value = true;

    const res = await request.get("admin/listing_transactions", {
      params: {
        page,
        limit: limitPage.value,
        typeTransaction: "withdrawal",
      },
    });

    const data = res.data;

    console.log("Test input: ", data.transactions[0].amount_usd);
    totalUsers.value = res.data.count;
    totalPage.value = Math.ceil(totalUsers.value / rowPerPage.value);
    lstTransactions.value = data.transactions;
    loadingTable.value = false;
  } catch (error) {
    loadingTable.value = false;
  }
};

async function sendResultDepoint(transactionId: number, type: string) {
  loadingEditOrder.value = transactionId;
  await request.post("admin/confirm_withdrawal", {
    transactionId,
    status: type,
  });
  loadingEditOrder.value = 0;
  reLoadOrder(1);
}
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

const idInterval = ref();
const statusInterval = ref(true);
function setUploadTable() {
  idInterval.value = setInterval(() => {
    reLoadOrder(1);
    currentPage.value = 1;
  }, 5000);
}
onUnmounted(() => {
  clearInterval(idInterval.value);
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
  // fetchUsers()
});

// -----
</script>

<template>
  <section>
    <VRow>
      <VCol cols="12">
        <VCard :title="languagePack.INVOICE_WITHDRAW_TITLE">
          <VCardText>
            <VRow>
              <!-- 👉 Search for.... -->

              <VCol cols="12" sm="6" lg="4" md="4">
                <div style="height: 100%">
                  <VSelect
                    v-model="selectedOption"
                    :label="languagePack.INVOICE_WITHDRAW_ORDER_BY"
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
                      languagePack.INVOICE_WITHDRAW_SEARCHKEY_PLACEHOLDER
                    "
                    density="compact"
                    class="me-3"
                  />

                  <!-- <VBtn> <VIcon start icon="bx-search" />Search </VBtn> -->
                  <VBtn class="me-3" @click="SearchUser">
                    {{ languagePack.INVOICE_WITHDRAW_SEARCH_BUTTON }}
                    <VIcon end icon="bx-search" />
                  </VBtn>
                  <VBtn
                    density="compact"
                    icon="mdi-reload"
                    @click="reLoadOrder(currentPage)"
                  />

                  <!--
                    <VBtn @click="toggleAutoFetchData">{{ autoFetchData ? 'Tắt' : 'Bật' }}
                    <VIcon end icon="bx-search" />
                    </VBtn>
                  -->
                </div>
              </VCol>
              <!--
                <VCol cols="12" sm="6" lg="4" md="4" style="    display: flex;
                justify-content: center;">
                <VSwitch
                v-model="statusInterval"
                inset
                :label="`${languagePack.AUTO_UPDATE}: ${statusInterval.toString() === 'true' ? 'YES' : 'NO'}`
                "
                :true-value=true
                :false-value=false
                />
                </VCol>
              -->
            </VRow>
          </VCardText>

          <VDivider />
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
                  {{ languagePack.INVOICE_WITHDRAW_ID_ORDER }}
                </th>

                <th scope="col">
                  {{ languagePack.ID_USER }}
                </th>
                <!-- <th scope="col">
                  {{ languagePack.USER_MANAGE_avatar }}
                </th> -->
                <th scope="col">
                  {{ languagePack.INVOICE_WITHDRAW_TOTAL_AMOUNT_VN }}(VNĐ)
                </th>

                <th scope="col">
                  {{ languagePack.INVOICE_WITHDRAW_TOTAL_AMOUNT_USD }}($)
                </th>
                <!--
                  <th scope="col">
                  {{ languagePack.NOTE }}
                  </th>
                -->
                <th scope="col">{{ languagePack.EXCHANGE_RATE }}VNĐ</th>
                <th scope="col">
                  {{ languagePack.INVOICE_WITHDRAW_BALANCE }}
                </th>
                <th scope="col">
                  {{ languagePack.INVOICE_WITHDRAW_BANK }}
                </th>
                <th scope="col">
                  {{ languagePack.INVOICE_WITHDRAW_CREATE_AT }}
                </th>
                <th scope="col" style="text-align: center">
                  {{ languagePack.INVOICE_WITHDRAW_ACTION }}
                </th>
              </tr>
            </thead>

            <!-- 👉 table body -->
            <tbody>
              <tr v-for="order in lstTransactions" :key="order.transactionId">
                <!-- 👉 Checkbox -->

                <td>
                  <span class="text-capitalize text-base text-small-txt">{{
                    order.transactionId
                  }}</span>
                </td>
                <td>
                  <span class="text-capitalize text-base text-small-txt"
                    >{{ order.user_id }}
                  </span>
                </td>
                <!-- 👉 User -->
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
                  <span class="text-capitalize text-base text-small-txt"
                    >{{ formatVnd(order.amount - (order.amount * fee) / 100) }}
                  </span>
                </td>
                <td>
                  <span class="text-capitalize text-base text-small-txt"
                    >{{ formatUsdt(order.amount_usd) }}
                  </span>
                </td>

                <!--
                  <td>
                  <VTextarea
                  v-model="order.note"
                  label="----"
                  no-resize
                  rows="1"
                  readonly
                  />
                  </td>
                -->
                <td>
                  <span class="text-capitalize text-base text-small-txt"
                    >{{ formatVnd(VNDVal) }}
                  </span>
                </td>
                <td>
                  <span class="text-capitalize text-base text-small-txt">
                    {{ formatUsdt(order.balanceNow) }}</span
                  >
                </td>
                <td>
                  <span class="text-capitalize text-base smail-bank"
                    >{{ languagePack.INVOICE_WITHDRAW_ADDBANK_USER_BANK_NAME }}:
                    {{
                      order.nameUser ||
                      languagePack.INVOICE_WITHDRAW_ADDBANK_STATUS
                    }}
                    <br />{{
                      languagePack.INVOICE_WITHDRAW_ADDBANK_BANK_NUMBER
                    }}:
                    {{
                      order.numberCard ||
                      languagePack.INVOICE_WITHDRAW_ADDBANK_STATUS
                    }}<br />{{
                      languagePack.INVOICE_WITHDRAW_ADDBANK_BANK_NAME
                    }}:
                    {{
                      order.bankName ||
                      languagePack.INVOICE_WITHDRAW_ADDBANK_STATUS
                    }}</span
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
                <td class="text-capitalize text-high-emphasis">
                  <span class="text-base text-small-txt">{{
                    changeDate(order.createdAt)
                  }}</span>
                </td>
                <!-- 👉 Status -->
                <!-- 👉 Actions -->
                <td
                  v-if="order.status == 'pending'"
                  class="text-center"
                  style="width: 80px"
                >
                  <VBtn
                    color="success"
                    size="small"
                    :loading="
                      order.transactionId === loadingEditOrder ? true : false
                    "
                    :disabled="
                      order.transactionId === loadingEditOrder ? true : false
                    "
                    @click="sendResultDepoint(order.transactionId, 'approved')"
                  >
                    {{ languagePack.INVOICE_WITHDRAW_ACTION_APPROVED }} </VBtn
                  >&ensp;
                  <VBtn
                    color="error"
                    size="small"
                    :loading="
                      order.transactionId === loadingEditOrder ? true : false
                    "
                    :disabled="
                      order.transactionId === loadingEditOrder ? true : false
                    "
                    @click="sendResultDepoint(order.transactionId, 'rejected')"
                  >
                    {{ languagePack.INVOICE_WITHDRAW_ACTION_CANCEL }}
                  </VBtn>
                </td>
                <td v-else class="text-center" style="width: 80px">
                  <VBtn
                    v-if="order.status == 'approved'"
                    color="success"
                    variant="text"
                    size="small"
                  >
                    {{ languagePack.INVOICE_WITHDRAW_ACTION_APPROVED }}
                  </VBtn>
                  <VBtn v-else color="error" variant="text" size="small">
                    {{ languagePack.INVOICE_WITHDRAW_ACTION_CANCEL }}
                  </VBtn>
                </td>
              </tr>
            </tbody>
          </VTable>
          <VDivider />
          <!-- SECTION Pagination -->
          <VCardText class="d-flex flex-wrap justify-end gap-4 pa-2">
            <!-- 👉 Rows per page -->
            <div class="d-flex align-center" style="width: 171px">
              <span class="text-no-wrap text-sm me-3">Rows per page:</span>
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
    <AddNewUserDrawer
      v-model:isDrawerOpen="isAddNewUserDrawerVisible"
      @user-data="addNewUser"
    />
  </section>
</template>

<style lang="scss" scoped>
.smail-bank {
  font-size: 11px;
}
.text-small-txt {
  font-size: 12px !important;
}
.v-textarea {
  width: 140px !important;
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
.v-input.v-input--horizontal.v-input--density-comfortable.v-input--readonly.v-textarea.v-text-field.v-textarea--no-resize {
  width: 150px !important;
}
.v-input.v-input--horizontal.v-input--density-comfortable.v-input--readonly.v-textarea.v-text-field.v-textarea--no-resize {
  width: 150px !important;
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
</style>
