<script setup lang="ts">
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import request from '@/utils2/request'
import { useUserListStore } from '@/views/apps/user/useUserListStore'

// 👉 Store
const userListStore = useUserListStore()
const searchQuery = ref('')
const rowPerPage = ref(10) // page size
const currentPage = ref(1)
const totalUsers = ref(14)
const totalPage = ref(1)

const users = ref<any>([])
const nameUser = ref('')
const idUser = ref('')
const loadingTable = ref(false)
const cnyAmount = ref()

watch(currentPage, (newVal, oldVal) => {
  // fetchUsers(newVal);
})

// 👉 Test

// 👉 Fetching users
const fetchUsers = async (page = 1) => {
  users.value = ''
  try {
    loadingTable.value = true

    const res = await request.get('admin/listingUser', {
      params: {
        page,
        limit: rowPerPage.value,
        nameUser: nameUser.value,
        id: idUser.value,
      },
    })

    if (res.data.success) {
      loadingTable.value = false
      users.value = res.data.data
      totalUsers.value = res.data.count
      totalPage.value = Math.ceil(totalUsers.value / rowPerPage.value)

      return users.value.length
    }
  }
  catch (error) {
    loadingTable.value = false
  }
}

async function usdToCny() {
  const reponse = await fetch('https://api.exchangerate-api.com/v4/latest/USDT')
  const data = await reponse.json()
  const usdToCnyRate = data.rates.CNY

  // Thực hiện chuyển đổi từ USDT sang VND
  // const usdtAmount = number; // Số tiền USDT cần chuyển đổi
  // cnyAmount.value = usdtAmount * usdToCnyRate;

  return cnyAmount.value = usdToCnyRate
}
usdToCny()

// 👉 watching current page
watchEffect(() => {
  if (currentPage.value > totalPage.value)
    currentPage.value = totalPage.value
})

// 👉 search filters
const realSearch = ref()
const selectedOption = ref({ state: 'Name user', abbr: 'name' })

watch(selectedOption, (newVal, oldVal) => {
  realSearch.value = newVal
})

const chooseSearch = [
  { state: 'Name', abbr: 'name' },
  { state: 'ID', abbr: 'id' },
]

async function SearchUser() {
  try {
    if (realSearch.value == 'name') {
      idUser.value = ''
      nameUser.value = searchQuery.value
      fetchUsers()
    }
    if (realSearch.value == 'id') {
      nameUser.value = ''
      idUser.value = searchQuery.value
      fetchUsers()
    }
  }
  catch (error) {}
}

// 👉 watching current page
watchEffect(() => {
  if (currentPage.value > totalPage.value)
    currentPage.value = totalPage.value
})

// 👉 Convert To Currency

// 👉 Computing pagination data
const paginationData = computed(() => {
  const firstIndex = users.value.length
    ? (currentPage.value - 1) * rowPerPage.value + 1
    : 0

  const lastIndex
    = users.value.length + (currentPage.value - 1) * rowPerPage.value

  return `${firstIndex}-${lastIndex} of ${totalUsers.value}`
})

// SECTION Checkbox toggle
const selectedRows = ref<string[]>([])
const selectAllUser = ref(false)

// 👉 watch if checkbox array is empty all select should be uncheck
watch(
  selectedRows,
  () => {
    if (!selectedRows.value.length)
      selectAllUser.value = false
  },
  { deep: true },
)

// !SECTION checkbox toggle

// Khai báo biến
const lstOrderLoad = ref<any>([])
const page = ref(1)
const limitPage = ref(10)

// lệnh kiểm soat
const reLoadOrder = async () => {
  const res = await request.get('listingKyc')
  const data = res.data

  lstOrderLoad.value = data.data
  console.log(data)
}

const verifyAccount = async (idUser: number, idKyc: number, status: number) => {
  const res = await request.post('admin/verifyAccount', {
    idUser,
    idKyc,
    status,
  })

  const data = res.data

  reLoadOrder()
}

onMounted(() => {
  console.log('____________', '')
  reLoadOrder()

  // fetchUsers();
})

// -----
</script>

<template>
  <section>
    <VRow>
      <VCol cols="12">
        <VCard title="Search">
          <VCardText>
            <VRow>
              <!-- 👉 Search for.... -->

              <VCol
                cols="12"
                sm="4"
              >
                <div style="height: 100%">
                  <VSelect
                    v-model="selectedOption"
                    label="Search by..."
                    :items="chooseSearch"
                    item-title="state"
                    item-value="abbr"
                  />
                </div>
              </VCol>
              <!-- 👉 Search form -->
              <VCol
                cols="12"
                sm="4"
              >
                <div
                  class="app-user-search-filter d-flex align-center"
                  style="height: 100%"
                >
                  <!-- 👉 Search  -->
                  <VTextField
                    v-model="searchQuery"
                    placeholder="Search User"
                    density="compact"
                    class="me-3"
                  />

                  <!-- <VBtn> <VIcon start icon="bx-search" />Search </VBtn> -->
                  <VBtn @click="SearchUser">
                    Search
                    <VIcon
                      end
                      icon="bx-search"
                    />
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
              Export
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
                  ID
                </th>
                <th scope="col">
                  USER NAME
                </th>
                <th scope="col">
                  RANK
                </th>
                <th scope="col">
                  BALANCE
                </th>
                <th scope="col">
                  ACTIONS
                </th>
              </tr>
            </thead>

            <!-- 👉 table body -->
            <tbody>
              <tr
                v-for="user in lstOrderLoad"
                :key="user.id"
              >
                <td>
                  {{ user.id }}
                </td>
                <!-- 👉 User -->
                <td>
                  <div class="d-flex align-center">
                    <div class="d-flex flex-column">
                      <h6 class="text-sm">
                        <RouterLink
                          :to="{
                            name: 'apps-user-view-id',
                            params: { id: user.userId },
                          }"
                          class="font-weight-medium user-list-name"
                        >
                          {{ user.fullName }}
                        </RouterLink>
                      </h6>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="text-capitalize text-base"><img
                    width="100"
                    :src="user.frontImage"
                    alt=""
                    srcset=""
                  ></span>
                </td>
                <!-- 👉 Role -->
                <td>
                  <span class="text-capitalize text-base"><img
                    width="100"
                    :src="user.backImage"
                    alt=""
                  ></span>
                </td>

                <!-- 👉 Actions -->
                <td
                  v-if="user.status == 'pending'"
                  class="text-center"
                  style="width: 80px"
                >
                  <!-- <MoreBtn :menu-list="computedMoreList(user.userId)" item-props /> -->
                  <VBtn
                    color="success"
                    size="small"
                    @click="verifyAccount(user.userId, user.id, 3)"
                  >
                    Approved
                  </VBtn>&ensp;
                  <VBtn
                    color="error"
                    size="small"
                    @click="verifyAccount(user.userId, user.id, 1)"
                  >
                    Cancel
                  </VBtn>
                </td>
                <td
                  v-else
                  class="text-center"
                  style="width: 80px"
                >
                  <VBtn
                    v-if="user.status == 3"
                    color="success"
                    variant="text"
                    size="small"
                  >
                    Approved
                  </VBtn>
                  <VBtn
                    v-else
                    color="error"
                    variant="text"
                    size="small"
                  >
                    Rejected
                  </VBtn>
                </td>
              </tr>
            </tbody>
          </VTable>

          <VDivider />

          <!-- SECTION Pagination -->
          <VCardText class="d-flex flex-wrap justify-end gap-4 pa-2">
            <!-- 👉 Rows per page -->
            <div
              class="d-flex align-center"
              style="width: 171px"
            >
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
</style>
