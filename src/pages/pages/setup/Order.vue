<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
import { onMounted, ref } from 'vue'
import request from '../../../utils2/request'
import type { CustomInputContent } from '@core/types'
import { languagePack } from '@/languages'

const val = ref('')
const data = ref<any>([])
const setupID = ref('')
const selectedRadio = ref('')
const loadingTable = ref(false)

const fetchData = async () => {
  loadingTable.value = true
  await request.get('admin/get_setup').then(res => {
    data.value = res.data.data
    val.value = data.value[0].value
    setupID.value = data.value[0].id

    // if(val.value == "win"){
    //   selectedRadio.value = 'win'
    // }else{
    //   selectedRadio.value = 'lose'
    // }
  })

  loadingTable.value = false
}

onMounted(() => {
  fetchData()
})

const radioContent: CustomInputContent[] = [
  {
    title: languagePack.SETUP_WIN_TITLE,
    subtitle: '×͜×',
    desc: languagePack.SETUP_WIN_DESC,
    value: 'win',
  },
  {
    title: languagePack.SETUP_LOSE_TITLE,
    subtitle: '×͜×',
    desc: languagePack.SETUP_LOSE_DESC,
    value: 'lose',
  },
  {
    title: languagePack.SETUP_RANDOM_TITLE,
    subtitle: '×͜×',
    desc: languagePack.SETUP_RANDOM_DESC,
    value: 'random',
  },
]

const updateResult = () => {
  loadingTable.value = true
  request.post('admin/update_setup', {
    id: setupID.value,
    value: val.value,
  }).then(res => {
    notify({
      title: 'Thành công',
      text: 'Cập nhật thành công!',
      type: 'success',
    })
    fetchData()
  }).catch(err => {
    notify({
      title: 'Thất bại',
      text: 'Cập nhật thất bại!',
      type: 'error',
    })
  }).finally(() => loadingTable.value = false)
}
</script>

<template>
  <VCol cols="12">
    <div>
      <VRow style="margin-bottom: 28px;">
        <Vcol
          cols="12"
          sm="12"
        >
          <span
            class="text-capitalize "
            style="margin-bottom: 28px; font-size: 20px;"
          >{{ languagePack.SETUP_TITLE }}</span>
        </Vcol>
      </VRow>
      <VRow>
        <VProgressLinear
          v-if="loadingTable"
          height="10"
          indeterminate
          color="primary"
        />
        <div v-else>
          <CustomRadios
            v-model="val"
            :radio-content="radioContent"
            :grid-column="{ sm: '6', cols: '12' }"
          />

          <!--
            <VCol
            cols="12"
            >
            <VBtn color="warning">
            <VIcon
            start
            icon="bx-wrench"
            />Update
            </VBtn>
            </VCol>
          -->
          <VCol
            cols="12"
            sm="12"
          >
            <VBtn
              block
              color="warning"
              @click="updateResult"
            >
              <VIcon
                start
                icon="bx-wrench"
              />
              {{ languagePack.SETUP_UPDATE_BTN }}
            </VBtn>
          </VCol>
        </div>
      </VRow>
    </div>
  </VCol>
</template>

<style>
#app > div > div > div > div > div.layout-content-wrapper > main > div > div > div > div:nth-child(2) > div.v-input.v-input--horizontal.v-input--density-comfortable.v-input--dirty.v-radio-group > div > div > div > div:nth-child(2) > label > div.flex-grow-1 > div > h6{
  color: #ffb120 !important;
}
#app > div > div > div > div > div.layout-content-wrapper > main > div > div > div > div:nth-child(2) > div.v-input.v-input--horizontal.v-input--density-comfortable.v-input--dirty.v-radio-group > div > div > div > div:nth-child(1) > label > div.flex-grow-1 > div > h6{
  color: #ffb120 !important;
}
#app > div > div > div > div.layout-wrapper.layout-nav-type-vertical.layout-navbar-sticky.layout-footer-static.layout-content-width-boxed > div.layout-content-wrapper > main > div > div > div > div:nth-child(2) > div.v-input.v-input--horizontal.v-input--density-comfortable.v-input--dirty.v-radio-group > div > div > div > div:nth-child(3) > label > div.flex-grow-1 > div > h6{
  color: #ffb120 !important;
}
</style>
