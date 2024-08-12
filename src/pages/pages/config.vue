<script setup lang="ts">
import { notify } from "@kyvg/vue3-notification";
import { ref } from "vue";
import request from "@/utils2/request";
import { languagePack } from "@/languages";

const dataInterest = ref<any>();
const dataStaking = ref<any>();

const maxWithdrawal = ref();
const minWithdrawl = ref();
const minToup = ref();
const withdrawalFee = ref();
const maxNumberOrder = ref();
const converFee = ref();
const blackList = ref();
const address_admin = ref();
const loadingTable = ref(false);
const isInterestVisible = ref(false);
const idInterest = ref(null);
const tab = ref("one");
const value = ref(0);
const percent = ref(0);
const isDelete = ref(false);

// Staking
const isStakingVisible = ref(false);
const idStaking = ref(null);
const dateStaking = ref(0);
const rateStaking = ref(0);
const typeStaking = ref("");
const descriptionStaking = ref("");

const isDeleteStaking = ref(false);

const fetchData = async () => {
  loadingTable.value = true;
  await request
    .get("admin/config/get_config")
    .then((res) => {
      maxWithdrawal.value = res.data.data[0].max_withdrawal;
      minWithdrawl.value = res.data.data[0].min_withdrawal;
      withdrawalFee.value = res.data.data[0].withdrawal_fee;
      converFee.value = `${withdrawalFee.value} %`;
      minToup.value = res.data.data[0].min_topup;
      maxNumberOrder.value = res.data.data[0].max_number_or_orders;
      blackList.value = res.data.data[0].black_list;
    })
    .catch((err) => console.log(383773, err));
  await request.get("admin/config-interest").then((res) => {
    dataInterest.value = res.data?.data;
  });
  await request.get("admin/staking").then((res) => {
    dataStaking.value = res.data?.data;
  });
  loadingTable.value = false;
};

fetchData();

const updateConfig = async () => {
  loadingTable.value = true;

  const converWithdrawalFee = converFee.value.replace("%", "");

  await request
    .post("admin/config/update", {
      max_withdrawal: maxWithdrawal.value,
      min_withdrawal: minWithdrawl.value,
      withdrawal_fee: parseFloat(converWithdrawalFee),
      min_topup: minToup.value,
      max_number_or_orders: maxNumberOrder.value,
      black_list: blackList.value,
      address_admin: address_admin.value,
    })
    .then((res) => {
      notify({
        title: "Thành công",
        text: "Cập nhật thành công!",
        type: "success",
      });
      fetchData();
    })
    .catch((err) => {
      notify({
        title: "Thất bại",
        text: "Cập nhật thất bại!",
        type: "error",
      });
    })
    .finally(() => (loadingTable.value = false));
};

const getEdit = (val: any) => {
  isInterestVisible.value = true;
  idInterest.value = val.id;
  value.value = val.value;
  percent.value = val.percent;
};

const openCreateInterest = (val: any) => {
  isInterestVisible.value = true;
  value.value = 0;
  percent.value = 0;
  idInterest.value = null;
};

const createInterest = async () => {
  await request
    .post("admin/config-interest/", {
      value: value.value,
      percent: percent.value,
    })
    .then((res) => {
      notify({
        title: "Thành công",
        text: "Tạo mới thành công!",
        type: "success",
      });
      isInterestVisible.value = false;
      value.value = 0;
      percent.value = 0;
      idInterest.value = null;
      fetchData();
    })
    .catch((err) => {
      notify({
        title: "Thất bại",
        text: "Cập nhật thất bại!",
        type: "error",
      });
    })
    .finally(() => (loadingTable.value = false));
};

const interestUpdate = async () => {
  loadingTable.value = true;
  await request
    .put(`admin/config-interest/${idInterest.value}`, {
      value: value.value,
      percent: percent.value,
    })
    .then((res) => {
      notify({
        title: "Thành công",
        text: "Cập nhật thành công!",
        type: "success",
      });
      idInterest.value = null;
      value.value = 0;
      percent.value = 0;
      isInterestVisible.value = false;
      fetchData();
    })
    .catch((err) => {
      notify({
        title: "Thất bại",
        text: "Cập nhật thất bại!",
        type: "error",
      });
    })
    .finally(() => (loadingTable.value = false));
};

const deleteInterest = async () => {
  loadingTable.value = true;
  await request
    .delete(`admin/config-interest/${idInterest.value}`)
    .then((res) => {
      notify({
        title: "Thành công",
        text: "Xoá thành công!",
        type: "success",
      });
      idInterest.value = null;
      value.value = 0;
      percent.value = 0;
      isInterestVisible.value = false;
      isDelete.value = false;
      fetchData();
    })
    .catch((err) => {
      notify({
        title: "Thất bại",
        text: "Cập nhật thất bại!",
        type: "error",
      });
    })
    .finally(() => (loadingTable.value = false));
};

const openCreateStaking = (val: any) => {
  isStakingVisible.value = true;
  typeStaking.value = "";
  dateStaking.value = 0;
  rateStaking.value = 0;
  descriptionStaking.value = "";
  idStaking.value = null;
};

const createStaking = async () => {
  await request
    .post("admin/staking/", {
      dateHold: dateStaking.value,
      interestRate: rateStaking.value,
      type: typeStaking.value,
      description: descriptionStaking.value,
    })
    .then((res) => {
      notify({
        title: "Thành công",
        text: "Tạo mới thành công!",
        type: "success",
      });
      isStakingVisible.value = false;
      typeStaking.value = "";
      dateStaking.value = 0;
      rateStaking.value = 0;
      descriptionStaking.value = "";
      idStaking.value = null;
      fetchData();
    })
    .catch((err) => {
      notify({
        title: "Thất bại",
        text: "Cập nhật thất bại!",
        type: "error",
      });
    })
    .finally(() => (loadingTable.value = false));
};

const getEditStaking = (val: any) => {
  isStakingVisible.value = true;
  idStaking.value = val.id;
  typeStaking.value = val.type;
  dateStaking.value = val.dateHold;
  rateStaking.value = val.interestRate;
  descriptionStaking.value = val.description;
};

const stakingUpdate = async () => {
  loadingTable.value = true;
  await request
    .put(`admin/staking/${idStaking.value}`, {
      dateHold: dateStaking.value,
      interestRate: rateStaking.value,
      type: typeStaking.value,
      description: descriptionStaking.value,
    })
    .then((res) => {
      notify({
        title: "Thành công",
        text: "Cập nhật thành công!",
        type: "success",
      });

      isStakingVisible.value = false;
      typeStaking.value = "";
      dateStaking.value = 0;
      rateStaking.value = 0;
      descriptionStaking.value = "";
      idStaking.value = null;
      fetchData();
    })
    .catch((err) => {
      notify({
        title: "Thất bại",
        text: "Cập nhật thất bại!",
        type: "error",
      });
    })
    .finally(() => (loadingTable.value = false));
};

const deleteStaking = async () => {
  loadingTable.value = true;
  await request
    .delete(`admin/staking/${idStaking.value}`)
    .then((res) => {
      notify({
        title: "Thành công",
        text: "Xoá thành công!",
        type: "success",
      });
      isStakingVisible.value = false;
      typeStaking.value = "";
      dateStaking.value = 0;
      rateStaking.value = 0;
      descriptionStaking.value = "";
      idStaking.value = null;
      isDeleteStaking.value = false;
      fetchData();
    })
    .catch((err) => {
      notify({
        title: "Thất bại",
        text: "Cập nhật thất bại!",
        type: "error",
      });
    })
    .finally(() => (loadingTable.value = false));
};
</script>

<template>
  <section>
    <VCard>
      <VTabs v-model="tab">
        <VTab value="one">
          <span>{{ languagePack.CONFIG_TITLE }}</span>
        </VTab>
        <VTab value="two">
          <span>{{ languagePack.INTEREST_TITLE }}</span>
        </VTab>
        <VTab value="three">
          <span>{{ languagePack.STAKING_TITLE }}</span>
        </VTab>
      </VTabs>

      <VCardText>
        <VWindow v-model="tab">
          <!-- CONFIG -->
          <VWindowItem value="one">
            <VProgressLinear
              v-if="loadingTable"
              height="10"
              indeterminate
              color="primary"
            />
            <VForm v-else @submit.prevent="updateConfig">
              <VRow>
                <VCol cols="12" sm="12">
                  <VRow no-gutters>
                    <VCol cols="12" md="1">
                      <label for="firstNameHorizontalIcons">{{
                        languagePack.USER_RESULT
                      }}</label>
                    </VCol>
                    <VTextField
                      id="firstNameHorizontalIcons"
                      v-model="address_admin"
                      prepend-inner-icon="bx-user"
                      :placeholder="languagePack.USER_RESULT"
                    />
                  </VRow>
                </VCol>
                <VCol cols="12" sm="12">
                  <VRow no-gutters>
                    <VCol cols="12" md="1">
                      <label for="firstNameHorizontalIcons">{{
                        languagePack.USER_RESULT
                      }}</label>
                    </VCol>
                    <VTextField
                      id="firstNameHorizontalIcons"
                      v-model="blackList"
                      prepend-inner-icon="bx-user"
                      :placeholder="languagePack.USER_RESULT"
                      persistent-placeholder
                    />
                  </VRow>
                </VCol>

                <VCol cols="12" sm="12">
                  <VRow no-gutters>
                    <VCol cols="12" md="1">
                      <label for="firstNameHorizontalIcons">{{
                        languagePack.CONFIG_WITHDRAW_FEES
                      }}</label>
                    </VCol>
                    <VTextField
                      id="firstNameHorizontalIcons"
                      v-model="converFee"
                      prepend-inner-icon="bx-wallet-alt"
                      :placeholder="languagePack.CONFIG_WITHDRAW_FEES"
                      persistent-placeholder
                    />
                  </VRow>
                </VCol>

                <VCol cols="12" sm="12">
                  <VRow no-gutters>
                    <VCol cols="12" md="1">
                      <label for="firstNameHorizontalIcons">{{
                        languagePack.CONFIG_MIN_WITHDRAW
                      }}</label>
                    </VCol>
                    <VTextField
                      id="firstNameHorizontalIcons"
                      v-model="minWithdrawl"
                      prepend-inner-icon="bxs-badge-dollar"
                      :placeholder="languagePack.CONFIG_MIN_WITHDRAW"
                      persistent-placeholder
                    />
                  </VRow>
                </VCol>

                <VCol cols="12" sm="12">
                  <VRow no-gutters>
                    <VCol cols="12" md="1">
                      <label for="firstNameHorizontalIcons">{{
                        languagePack.CONFIG_MAX_WITHDRAW
                      }}</label>
                    </VCol>
                    <VTextField
                      id="firstNameHorizontalIcons"
                      v-model="maxWithdrawal"
                      prepend-inner-icon="bxl-flutter"
                      :placeholder="languagePack.CONFIG_MAX_WITHDRAW"
                      persistent-placeholder
                    />
                  </VRow>
                </VCol>
                <VCol cols="12" sm="12">
                  <VRow no-gutters>
                    <VCol cols="12" md="1">
                      <label for="firstNameHorizontalIcons">{{
                        languagePack.CONFIG_MIN_DEPOSIT
                      }}</label>
                    </VCol>
                    <VTextField
                      id="firstNameHorizontalIcons"
                      v-model="minToup"
                      prepend-inner-icon="bx-dollar"
                      :placeholder="languagePack.CONFIG_MIN_DEPOSIT"
                      persistent-placeholder
                    />
                  </VRow>
                </VCol>

                <VCol cols="12" sm="12">
                  <VRow no-gutters>
                    <VCol cols="12" md="1">
                      <label for="firstNameHorizontalIcons">{{
                        languagePack.CONFIG_MAX_ORDER
                      }}</label>
                    </VCol>
                    <VTextField
                      id="firstNameHorizontalIcons"
                      v-model="maxNumberOrder"
                      prepend-inner-icon="bx-candles"
                      :placeholder="languagePack.CONFIG_MAX_ORDER"
                      persistent-placeholder
                    />
                  </VRow>
                </VCol>
                <!-- 👉 submit and reset button -->
                <VCol offset-md="1" cols="12" md="9" class="d-flex gap-4">
                  <VBtn type="submit">
                    {{ languagePack.CONFIG_BTN_SUBMIT }}
                  </VBtn>
                  <VBtn color="secondary" type="reset" variant="tonal">
                    {{ languagePack.CONFIG_BTN_RESET }}
                  </VBtn>
                </VCol>
              </VRow>
            </VForm>
          </VWindowItem>

          <!-- TABLE INTEREST -->
          <VWindowItem value="two">
            <VBtn @click="openCreateInterest">
              {{ languagePack.CREATE }}
            </VBtn>
            <VTable class="text-no-wrap">
              <!-- 👉 table head -->
              <thead>
                <tr>
                  <th scope="col">
                    {{ languagePack.VALUE }}
                  </th>
                  <th scope="col">
                    {{ languagePack.PERCENT }}
                  </th>
                  <th scope="col">
                    {{ languagePack.VERY_USER_ACTIONS }}
                  </th>
                </tr>
              </thead>

              <!-- 👉 table body -->
              <tbody>
                <tr v-for="result in dataInterest" :key="result.id">
                  <td>
                    <span class="text-base text-high-emphasis"
                      >{{ result.value }} (VND)</span
                    >
                  </td>
                  <td>
                    <span class="text-capitalize text-base"
                      >{{ result.percent }} %</span
                    >
                  </td>

                  <td>
                    <VBtn color="warning" @click="getEdit(result)">
                      <VIcon
                        icon="bx-lock-open-alt"
                        style="margin-right: 5px"
                      />
                      {{ languagePack.NOTIFY_ACTIONS_EDIT }} </VBtn
                    >&ensp;
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VWindowItem>

          <!-- TABLE STAKING -->
          <VWindowItem value="three">
            <VBtn @click="openCreateStaking">
              {{ languagePack.CREATE }}
            </VBtn>
            <VTable class="text-no-wrap">
              <!-- 👉 table head -->
              <thead>
                <tr>
                  <th scope="col">
                    {{ languagePack.TYPE }}
                  </th>
                  <th scope="col">
                    {{ languagePack.DATE_HOLD }}
                  </th>
                  <th scope="col">
                    {{ languagePack.PERCENT }}
                  </th>
                  <th scope="col">
                    {{ languagePack.DESCRIPTION }}
                  </th>
                  <th scope="col">
                    {{ languagePack.VERY_USER_ACTIONS }}
                  </th>
                </tr>
              </thead>

              <!-- 👉 table body -->
              <tbody>
                <tr v-for="result in dataStaking" :key="result.id">
                  <td>
                    <span class="text-base text-high-emphasis">{{
                      result.type
                    }}</span>
                  </td>
                  <td>
                    <span class="text-base">{{ result.dateHold }} d </span>
                  </td>
                  <td>
                    <span class="text-capitalize text-base"
                      >{{ result.interestRate }} %
                    </span>
                  </td>
                  <td>
                    <span class="text-capitalize text-base"
                      >{{ result.description }}
                    </span>
                  </td>
                  <td>
                    <VBtn color="warning" @click="getEditStaking(result)">
                      <VIcon
                        icon="bx-lock-open-alt"
                        style="margin-right: 5px"
                      />
                      {{ languagePack.NOTIFY_ACTIONS_EDIT }} </VBtn
                    >&ensp;
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VWindowItem>
        </VWindow>
      </VCardText>
    </VCard>

    <!-- INTEREST MODAL -->
    <VDialog v-model="isInterestVisible" max-width="600">
      <!-- Dialog Activator -->
      <!-- Dialog Content -->
      <VCard :title="languagePack.INTEREST_TITLE">
        <DialogCloseBtn
          variant="text"
          size="small"
          @click="isInterestVisible = false"
        />

        <VCardText>
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="value"
                type="number"
                :label="languagePack.VALUE"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="percent"
                type="number"
                :label="languagePack.PERCENT"
              />
            </VCol>
          </VRow>
        </VCardText>

        <VCardText class="d-flex justify-end gap-2">
          <VBtn
            color="secondary"
            variant="tonal"
            @click="isInterestVisible = false"
          >
            Close
          </VBtn>
          <VBtn @click="idInterest ? interestUpdate() : createInterest()">
            Save
          </VBtn>

          <VBtn v-if="idInterest" color="error" @click="isDelete = true">
            Delete
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <VDialog v-model="isDelete" persistent class="v-dialog-sm">
      <!-- Dialog Activator -->

      <!-- Dialog Content -->
      <VCard title="Delete">
        <DialogCloseBtn variant="text" size="small" @click="isDelete = false" />

        <VCardText>
          {{ languagePack.ALERT_CONFIRM }}
        </VCardText>

        <VCardText class="d-flex justify-end gap-2">
          <VBtn color="secondary" variant="tonal" @click="isDelete = false">
            Cancel
          </VBtn>
          <VBtn @click="deleteInterest"> Delete </VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- STAKING MODAL -->
    <VDialog v-model="isStakingVisible" max-width="600">
      <!-- Dialog Activator -->
      <!-- Dialog Content -->
      <VCard :title="languagePack.STAKING_TITLE">
        <DialogCloseBtn
          variant="text"
          size="small"
          @click="isStakingVisible = false"
        />

        <VCardText>
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="typeStaking"
                type="text"
                :label="languagePack.TYPE"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="dateStaking"
                type="number"
                :label="languagePack.DATE_HOLD"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="rateStaking"
                type="number"
                :label="languagePack.PERCENT"
              />
            </VCol>
            <VCol cols="12">
              <VTextarea
                v-model="descriptionStaking"
                :label="languagePack.DESCRIPTION"
              />
            </VCol>
          </VRow>
        </VCardText>

        <VCardText class="d-flex justify-end gap-2">
          <VBtn
            color="secondary"
            variant="tonal"
            @click="isInterestVisible = false"
          >
            Close
          </VBtn>
          <VBtn @click="idStaking ? stakingUpdate() : createStaking()">
            Save
          </VBtn>

          <!--
            <VBtn v-if="idStaking" color="error" @click="isDeleteStaking = true">
            Delete
            </VBtn>
          -->
        </VCardText>
      </VCard>
    </VDialog>

    <VDialog v-model="isDeleteStaking" persistent class="v-dialog-sm">
      <!-- Dialog Activator -->

      <!-- Dialog Content -->
      <VCard title="Delete">
        <DialogCloseBtn
          variant="text"
          size="small"
          @click="isDeleteStaking = false"
        />

        <VCardText>
          {{ languagePack.ALERT_CONFIRM }}
        </VCardText>

        <VCardText class="d-flex justify-end gap-2">
          <VBtn
            color="secondary"
            variant="tonal"
            @click="isDeleteStaking = false"
          >
            Cancel
          </VBtn>
          <VBtn @click="deleteStaking"> Delete </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </section>
</template>
