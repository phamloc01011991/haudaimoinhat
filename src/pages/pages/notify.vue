<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { languagePack } from '@/languages'
import request from '@/utils2/request'

// 👉 Store

const searchQuery = ref('')
const rowPerPage = ref(10) // page size
const currentPage = ref(1)
const totalUsers = ref(14)
const totalPage = ref(1)
const isDialogVisible = ref(false)

const users = ref<any>([])
const nameUser = ref('')
const idUser = ref('')
const loadingTable = ref(false)
const data = ref<any>()
const checkboxString = ref('Off')
const dataTitle = ref()
const dataContent = ref()
const dataForNoti = ref()
const idNotify = ref()
const statusVal = ref()

const fetchNoti = async () => {
  await request.get('admin/notify/listing').then(res => {
    data.value = res.data.data
  })
}

const fetchNotiID = async (idNoti: number) => {
  idNotify.value = idNoti
  isDialogVisible.value = true
  await request
    .post('admin/notify/listing_for_id', {
      id: idNoti,
    })
    .then(res => {
    //   checkDataFID.value = true;
      dataForNoti.value = res.data.data
      dataTitle.value = dataForNoti.value[0].title
      dataContent.value = dataForNoti.value[0].content
      if (dataForNoti.value[0].status == null || 1)
        checkboxString.value = 'On'

      if (dataForNoti.value[0].status == 2)
        checkboxString.value = 'Off'
    })
    .catch(err => {
      console.log(err)
    })
}

const deleteNoti = (id: number) => {}

onMounted(() => {
  fetchNoti()
})

const UpdateNoti = async () => {
  if (checkboxString.value == 'On')
    statusVal.value = 1
  else
    statusVal.value = 2

  await request.post('admin/notify/update', {
    id: idNotify.value,
    title: dataTitle.value,
    content: dataContent.value,
    status: statusVal.value,
  }).then(res => {
    isDialogVisible.value = false
    fetchNoti()
    console.log(res)
  }).catch(err => {
    console.log(err)
  })
}

const titleTable = languagePack.NOTIFY_HEADING_TITLE
</script>

<template>
  <section>
    <VRow>
      <VCol cols="12">
        <VCard :title="titleTable">
          <VCardText>
            <VRow>
              <!-- 👉 Search for.... -->
              <!-- 👉 Search form -->
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
              {{ languagePack.NOTIFY_EXPORT }}
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
                  {{ languagePack.NOTIFY_ID }}
                </th>
                <th scope="col">
                  {{ languagePack.NOTIFY_TITLE }}
                </th>
                <th scope="col">
                  {{ languagePack.NOTIFY_CONTENT }}
                </th>
                <th
                  scope="col"
                  style="text-align: center"
                >
                  {{ languagePack.NOTIFY_ACTIONS }}
                </th>
              </tr>
            </thead>

            <!-- 👉 table body -->
            <tbody>
              <tr
                v-for="noti in data"
                :key="noti.id"
              >
                <td>
                  {{ noti.id }}
                </td>
                <!-- 👉 User -->
                <td>
                  <span class="text-capitalize text-base">{{
                    noti.title
                  }}</span>
                </td>
                <!-- 👉 Role -->
                <td>
                  <span class="text-capitalize text-small-txt">{{
                    noti.content
                  }}</span>
                </td>

                <!-- 👉 Actions -->
                <td class="text-center">
                  <!-- <MoreBtn :menu-list="computedMoreList(user.userId)" item-props /> -->
                  <VBtn
                    color="success"
                    size="small"
                    @click="fetchNotiID(noti.id)"
                  >
                    {{ languagePack.NOTIFY_ACTIONS_EDIT }}
                  </VBtn>&ensp;
                  <!--
                    <VBtn color="error" size="small" @click="deleteNoti(noti.id)">
                    DELETE
                    </VBtn>
                  -->
                </td>
              </tr>
            </tbody>
          </VTable>

          <VDivider />

          <!-- SECTION Pagination -->

          <!-- !SECTION -->
        </VCard>
      </VCol>
    </VRow>
    <!-- 👉 Add New User -->
    <VDialog
      v-model="isDialogVisible"
      max-width="600"
    >
      <!-- Dialog Activator -->
      <template #activator="{ props }">
        <!-- <VBtn v-bind="props"> Open Dialog </VBtn> -->
      </template>

      <!-- Dialog Content -->
      <VCard :title="languagePack.NOTIFY_ACTIONS_EDIT_TITLE">
        <DialogCloseBtn
          variant="text"
          size="small"
          @click="isDialogVisible = false"
        />

        <VCardText>
          <VRow>
            <Vcol cols="12">
              <VCheckbox
                v-model="checkboxString"
                style="margin-left: 15px"
                true-value="On"
                false-value="Off"
                color="success"
                :label="`${checkboxString.toString()}`"
              />
            </Vcol>
            <VCol cols="12">
              <VTextField
                v-model="dataTitle"
                :label="languagePack.NOTIFY_ACTIONS_EDIT_TITLE_NOTI"
              />
            </VCol>
            <VCol cols="12">
              <VTextarea
                v-model="dataContent"
                :label="languagePack.NOTIFY_ACTIONS_EDIT_CONTENT"
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
            {{ languagePack.NOTIFY_ACTIONS_EDIT_BTN_CLOSE }}
          </VBtn>
          <VBtn @click="UpdateNoti">
            {{ languagePack.NOTIFY_ACTIONS_EDIT_BTN_SAVE }}
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </section>
</template>

<style scoped>
.smail-bank {
  font-size: 11px;
}
.text-small-txt {
  font-size: 13px !important;
}
</style>
