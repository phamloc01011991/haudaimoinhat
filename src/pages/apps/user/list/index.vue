<script setup lang="ts">
import { notify } from "@kyvg/vue3-notification";
import { onMounted } from "vue";
import { languagePack } from "@/languages";
import { formatUsdt, formatVnd } from "@/utils2/money";
import request from "@/utils2/request";
import { useUserListStore } from "@/views/apps/user/useUserListStore";
import { avatarText } from "@core/utils/formatters";

// 👉 Store
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

watch(currentPage, (newVal, oldVal) => {
  limitNow.value = newVal;
  fetchUsers(newVal);
});

// 👉 Test

// 👉 Fetching users
const fetchUsers = async (page = 1, type = "id", searchValue = "") => {
  users.value = "";
  try {
    loadingTable.value = true;

    const res = await request.get("admin/listingUser", {
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
      console.log(users.value);

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

// 👉 search filters
const realSearch = ref();
const selectedOption = ref({ state: "ID", abbr: "id" });

watch(selectedOption, (newVal, oldVal) => {
  realSearch.value = newVal;
});

const chooseSearch = [
  { state: "ID", abbr: "id" },
  { state: "Name", abbr: "nameUser" },
  { state: languagePack.REFERRAL_CODE, abbr: "transferCode" },
  { state: languagePack.INVITED_CODE, abbr: "invitedCode" },
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

const isAddNewUserDrawerVisible = ref(false);

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
const username = ref("");
const balance = ref("");
const password = ref("");
const securityCode = ref();
const transferCode = ref("");
const rank = ref("");
async function runLoadEdit(userId: number) {
  userIdSelect.value = userId;
  loadingEditUser.value = userId;

  const res = await request.get("admin/listingUserWithId", {
    params: {
      id: userId,
    },
  });

  loadingEditUser.value = 0;

  const data = res.data;

  username.value = data.data.fullName;
  balance.value = data.data.balance;
  password.value = "";
  Note.value = data.data.note;
  creditScore.value = data.data.creditScore;
  securityCode.value = data.data.securityCode;
  transferCode.value = data.data.transferCode;
  rank.value = data.data.rank;
  isDialogVisible.value = true;
}

// Load data bank
async function runLoadUpdate() {
  const res = await request.post("admin/updateUser", {
    id: userIdSelect.value,

    // username: username.value,
    fullName: username.value,
    securityCode: securityCode.value,
    transferCode: transferCode.value,
    balance: balance.value,
    password: password.value,
    note: Note.value,
    creditScore: creditScore.value,
    rank: rank.value,
  });

  const data = res.data;

  console.log(data);
  if (data.success == true) fetchUsers();

  isDialogVisible.value = false;
}
const isBankVisible = ref(false);
const nameBank = ref("");
const numberBank = ref("");
const Bank = ref("");
const Note = ref("");
const creditScore = ref("");
const branchName = ref("");
const isDelete = ref(false);
const idBank = ref();
async function runloadBank(userId: number, bankId: number) {
  idBank.value = bankId;
  userIdSelect.value = userId;

  const res = await request.get("admin/listingUserWithId", {
    params: {
      id: userId,
    },
  });

  const data = res.data;
  if (data.success == true) {
    nameBank.value = data.data.nameUser;
    Bank.value = data.data.bankName;
    numberBank.value = data.data.numberCard;
    branchName.value = data.data.branchName;
    username.value = data.data.username;
  }
  isBankVisible.value = true;
}
async function runBankUpdate() {
  const res = await request.post("admin/updateUser", {
    id: userIdSelect.value,
    username: username.value,
    numberCard: numberBank.value,
    nameUser: nameBank.value,
    branchName: branchName.value,
    bankName: Bank.value,
  });

  const data = res.data;
  if (data.success == true) {
    fetchUsers(limitNow.value);
  } else {
  }
  isBankVisible.value = false;
}

// Delete bank for user
async function deleteBank() {
  await request
    .post("admin/delete_bank_for_user", {
      bankId: idBank.value,
    })
    .then((res) => {
      if (res.data.success == true) {
        isDelete.value = false;
        isBankVisible.value = false;
        notify({
          title: "Thành công",
          text: "Xoá thành công!",
          type: "success",
        });
        fetchUsers(limitNow.value);
      }
    })
    .catch((err) => {
      notify({
        title: "Thất bại",
        text: `Xoá không thành công${err}`,
        type: "error",
      });
    });
}

// Add notification
const isNotificationVisible = ref(false);
const titleNotification = ref("");
const contentNotification = ref("");
const statusNotification = ref("");
const idUserNotification = ref();

const openNotification = (idUser: number) => {
  idUserNotification.value = idUser;
  console.log(idUserNotification.value);

  isNotificationVisible.value = true;
};

const addNotification = async (idUser: number) => {
  await request
    .post("admin/notify/create_for_user", {
      title: titleNotification.value,
      content: contentNotification.value,
      id: idUserNotification.value,
    })
    .then((res) => {
      const data = res.data;
      if (data.success == true) {
        titleNotification.value = "";
        contentNotification.value = "";
        isNotificationVisible.value = false;
        notify({
          title: "Thành công",
          text: "Thêm thành công!",
          type: "success",
        });
      }
    })
    .catch((err) => {
      idUserNotification.value = false;
      notify({
        title: "Thất bại",
        text: "Cập nhật thất bại!",
        type: "error",
      });
    });
};

const usdAmount = ref();

const vndAmount = ref();
async function usdToVnd() {
  const reponse = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
  const data = await reponse.json();
  const usdToVndRate = data.rates.VND;

  // Thực hiện chuyển đổi từ USDT sang VND
  // const usdtAmount = number; // Số tiền USDT cần chuyển đổi
  // cnyAmount.value = usdtAmount * usdToCnyRate;
  usdAmount.value = data.rates.USD;

  return (vndAmount.value = usdToVndRate);
}
usdToVnd();

// --------end
// Khai báo biến
const page = ref(1);
const limitPage = ref(10);

onMounted(() => {
  fetchUsers();
});

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
              <VBtn
                variant="tonal"
                color="secondary"
                prepend-icon="bx-arrow-from-bottom"
              >
                {{ languagePack.USER_MANAGE_EXPORT }}
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
                    {{ languagePack.USER_MANAGE_avatar }}
                  </th>
                  <th scope="col">
                    {{ languagePack.USER_MANAGE_PHONE }}
                  </th>

                  <!-- <th scope="col">{{ languagePack.USER_MANAGE_RANK }}</th> -->
                  <th scope="col">
                    {{ languagePack.INVOICE_WITHDRAW_TOTAL_AMOUNT_VN }}(VNĐ)
                  </th>

                  <th scope="col">
                    {{ languagePack.USER_MANAGE_BALANCE_USD }}(USD)
                  </th>
                  <th scope="col">
                    {{ languagePack.CREDIT_SCORE }}
                  </th>
                  <!-- <th scope="col">{{ languagePack.USER_MANAGE_USER_NAME }}</th> -->
                  <th scope="col">
                    {{ languagePack.USER_MANAGE_SECURITY_CODE }}
                  </th>
                  <th scope="col">
                    {{ languagePack.NOTE }}
                  </th>

                  <th scope="col">
                    {{ languagePack.REFERRAL_CODE }}
                  </th>
                  <th scope="col">
                    {{ languagePack.INVITED_CODE }}
                  </th>

                  <th scope="col">
                    {{ languagePack.USER_MANAGE_BANK }}
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
                          class="image-user"
                        />
                        <span v-else class="text-sm">{{
                          avatarText(user.fullName)
                        }}</span>
                      </VAvatar>

                      <!-- <div>
                        <span class="text-xs text-medium-emphasis">{{
                          user.fullName
                        }}</span>
                      </div> -->
                    </div>
                  </td>
                  <td>
                    <span class="text-capitalize text-base">{{
                      user.phone
                    }}</span>
                  </td>
                  <!--
                    <td>
                    <span class="text-capitalize text-base">{{
                    user.rank == 1
                    ? "Bạc"
                    : user.rank == 2
                    ? "Vàng"
                    : user.rank == 3
                    ? "Bạch Kim"
                    : "Kim cương"
                    }}</span>
                    </td>
                  -->
                  <!-- 👉 Role -->
                  <td>
                    <span class="text-base text-high-emphasis">{{
                      formatVnd(user.balance * vndAmount)
                    }}</span>
                  </td>

                  <td>
                    <span class="text-capitalize text-base">{{
                      formatUsdt(user.balance)
                    }}</span>
                  </td>

                  <td>
                    <span class="text-capitalize text-base">{{
                      user.creditScore
                    }}</span>
                  </td>
                  <!--
                    <td>
                    <span class="text-capitalize text-base">{{
                    user.fullName
                    }}</span>
                    </td>
                  -->
                  <td>
                    <span class="text-capitalize text-base">{{
                      user.securityCode
                    }}</span>
                  </td>
                  <td>
                    <VTextarea
                      v-model="user.note"
                      label="----"
                      no-resize
                      rows="1"
                      readonly
                    />
                    <!--
                      <span class="text-capitalize text-base">{{
                      user.Note || "---"

                      }}</span>
                    -->
                  </td>

                  <td>
                    <span class="text-capitalize text-base">{{
                      user.referralCode
                    }}</span>
                  </td>
                  <td>
                    <span class="text-capitalize text-base">{{
                      user.invitedCode
                    }}</span>
                  </td>

                  <td>
                    <span class="text-capitalize text-base smail-bank"
                      >{{ user.nameUser || languagePack.NO_ADD_BANK }} <br />{{
                        user.numberCard || languagePack.NO_ADD_BANK
                      }}<br />{{
                        user.bankName || languagePack.NO_ADD_BANK
                      }}</span
                    >
                  </td>
                  <!-- 👉 Status -->
                  <!-- 👉 Actions -->
                  <td class="text-center">
                    <VBtn
                      size="small"
                      color="warning"
                      :loading="user.id === loadingEditUser ? true : false"
                      @click="runLoadEdit(user.id)"
                    >
                      {{ languagePack.USER_MANAGE_ACTIONS_EDIT }} </VBtn
                    >&ensp;
                    <VBtn
                      v-if="user.bank_id"
                      size="small"
                      color="primary"
                      @click="runloadBank(user.id, user.bank_id)"
                    >
                      {{ languagePack.USER_MANAGE_ACTIONS_BANK }} </VBtn
                    >&ensp;
                    <VBtn
                      size="small"
                      color="success"
                      @click="openNotification(user.id)"
                    >
                      <VIcon icon="bxs-bell-plus" />
                    </VBtn>
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

        <VCardText>
          <VRow>
            <!-- <VCol cols="12">
              <VTextField
                v-model="username"
                :label="languagePack.USER_MANAGE_USER_NAME"
              />
            </VCol> -->

            <!--
              <VCol cols="12">
              <VTextField
              v-model="username"
              :label="languagePack.USER_MANAGE_username"
              />
              </VCol>
            -->

            <VCol cols="12">
              <VTextField
                v-model="password"
                :label="languagePack.USER_MANAGE_NEW_PASSWORD"
              />
            </VCol>
            <VCol cols="12">
              <VTextarea
                v-model="Note"
                :label="languagePack.NOTE"
                no-resize
                rows="2"
              />
              <!-- <VTextField v-model="Note" :label="languagePack.NOTE" /> -->
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="securityCode"
                :label="languagePack.USER_MANAGE_SECURITY_CODE"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="creditScore"
                :label="languagePack.CREDIT_SCORE"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="balance"
                :label="languagePack.USER_MANAGE_BALANCE_USD"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="rank"
                hint="1:Bạc; 2:Vàng; 3:Bạch Kim; 4:Kim cương"
                type="number"
                label="Rank"
              />
            </VCol>
          </VRow>
        </VCardText>

        <VCardText class="d-flex justify-end gap-2">
          <VBtn
            color="secondary"
            variant="tonal"
            @click="isDialogVisible = false"
          >
            Close
          </VBtn>
          <VBtn @click="runLoadUpdate"> Save </VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Load Bank edit update -->
    <VDialog v-model="isBankVisible" max-width="600">
      <!-- Dialog Activator -->
      <!-- Dialog Content -->
      <VCard :title="languagePack.USER_MANAGE_INFO_BANK_USER_TITLE">
        <DialogCloseBtn
          variant="text"
          size="small"
          @click="isBankVisible = false"
        />

        <VCardText>
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="nameBank"
                :label="languagePack.USER_MANAGE_INFO_BANK_USER_BANK_S_NAME"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="numberBank"
                :label="languagePack.USER_MANAGE_INFO_BANK_USER_BANK_NUMBER"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="Bank"
                :label="languagePack.USER_MANAGE_INFO_BANK_USER_BANK_NAME"
              />
            </VCol>
            <!--
              <VCol
              cols="12"
              sm="6"
              >
              <VTextField
              v-model="age"
              type="number"
              label="Age"
              />
              </VCol>
              <VCol
              cols="12"
              sm="6"
              >
              <VTextField
              v-model="interest"
              label="Interests"
              />
              </VCol>
            -->
          </VRow>
        </VCardText>

        <VCardText class="d-flex justify-end gap-2">
          <VBtn
            color="secondary"
            variant="tonal"
            @click="isBankVisible = false"
          >
            Close
          </VBtn>
          <VBtn @click="runBankUpdate"> Save </VBtn>
          <VBtn color="error" @click="isDelete = true"> Delete </VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Load Noti create -->
    <VDialog v-model="isNotificationVisible" max-width="600">
      <!-- Dialog Activator -->
      <!-- Dialog Content -->
      <VCard :title="languagePack.USER_MANAGE_ADD_NOTIFI_TITLE">
        <DialogCloseBtn
          variant="text"
          size="small"
          @click="isNotificationVisible = false"
        />

        <VCardText>
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="titleNotification"
                :label="languagePack.USER_MANAGE_ADD_NOTIFI_SUB_TITLE"
              />
            </VCol>
            <VCol cols="12">
              <VTextarea
                v-model="contentNotification"
                :label="languagePack.USER_MANAGE_ADD_NOTIFI_CONTENT"
              />
            </VCol>
          </VRow>
        </VCardText>

        <VCardText class="d-flex justify-end gap-2">
          <VBtn
            color="secondary"
            variant="tonal"
            @click="isNotificationVisible = false"
          >
            {{ languagePack.USER_MANAGE_ADD_NOTIFI_BTN_CLOSE }}
          </VBtn>
          <VBtn @click="addNotification">
            {{ languagePack.USER_MANAGE_ADD_NOTIFI_BTN_SAVE }}
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <VDialog v-model="isDelete" persistent class="v-dialog-sm">
      <!-- Dialog Activator -->

      <!-- Dialog Content -->
      <VCard title="Delete Bank">
        <DialogCloseBtn variant="text" size="small" @click="isDelete = false" />

        <VCardText>
          {{ languagePack.DELETE_USER_CONFIRM }}
        </VCardText>

        <VCardText class="d-flex justify-end gap-2">
          <VBtn color="secondary" variant="tonal" @click="isDelete = false">
            Cancel
          </VBtn>
          <VBtn @click="deleteBank"> Delete </VBtn>
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
