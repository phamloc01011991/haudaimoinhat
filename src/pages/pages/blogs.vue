<script setup lang="ts">
import { onMounted, ref } from "vue";
import { languagePack } from "@/languages";
import request from "@/utils2/request";
import ImageUploader from "quill-image-uploader";
// 👉 Store

const searchQuery = ref("");
const rowPerPage = ref(10); // page size
const currentPage = ref(1);
const totalUsers = ref(14);
const totalPage = ref(1);
const isDialogVisible = ref(false);

const users = ref<any>([]);
const nameUser = ref("");
const idUser = ref("");
const loadingTable = ref(false);
const data = ref<any>();
const checkboxString = ref("On");
const dataTitle = ref();
const dataTitleEng = ref();
const dataSlug = ref();
const dataContent = ref();
const dataContentEng = ref();
const dataForNoti = ref();
const idPost = ref();
const statusVal = ref();

const modulesImage = ref({
  name: "imageUploader",
  module: ImageUploader,
  options: {
    upload: (file) => {
      return new Promise((resolve, reject) => {
        const data = new FormData();
        data.append("image", file);
        data.append("key", "05f693bbd8f9a956eaa178d0a7b40037");
        return fetch("https://api.imgbb.com/1/upload", {
          method: "post",
          body: data,
        })
          .then(async (res) => {
            const result = await res.json();
            console.log("🚀 ~ .then ~ result:", result);
            resolve(result.data.display_url);
          })
          .catch((error) => {
            console.log("🚀 ~ returnnewPromise ~ error:1", error);
            reject("Upload failed");
          });
      });
    },
  },
});
const fetchPost = async () => {
  await request.get("admin/blog").then((res) => {
    data.value = res.data.data;
  });
};

const handleOpenPost = async (valId: any) => {
  console.log("🚀 ~ handleOpenPost ~ valId:", valId);
  idPost.value = valId;
  isDialogVisible.value = true;

  if (valId) {
    await request
      .get("admin/blog/" + valId)
      .then((res) => {
        console.log("🚀 ~ .then ~ res:", res.data);
        //   checkDataFID.value = true;
        const { data } = res.data;
        dataTitle.value = data.title;
        dataTitleEng.value = data.titleEnglish;
        dataContent.value = data.description;
        dataContentEng.value = data.descriptionEnglish;
        accountDataLocal.value = data.featuredImage;
        checkboxString.value = data.actived ? "On" : "Off";

        // if (dataForNoti.value[0].status == null || 1) checkboxString.value = "On";

        // if (dataForNoti.value[0].status == 2) checkboxString.value = "Off";
      })
      .catch((err) => {
        console.log("🚀 ~ handleOpenPost ~ err:", err);
      });
  } else {
    dataTitle.value = "";
    dataTitleEng.value = "";
    dataContent.value = "";
    dataContentEng.value = "";
    accountDataLocal.value = "";
    checkboxString.value = "On";
  }
};

const deletePost = async (id: number) => {
  await request
    .delete("admin/blog/" + idPost.value)
    .then((res) => {
      isDialogVisible.value = false;
      idPost.value = null;
      dataTitle.value = "";
      dataTitleEng.value = "";
      dataContent.value = "";
      dataContentEng.value = "";
      accountDataLocal.value = "";
      fetchPost();
    })
    .catch((err) => {
      console.log("🚀 ~ handleOpenPost ~ err:", err);
    });
};

onMounted(() => {
  fetchPost();
});
function generateSlug(str) {
  return str
    .toLowerCase() // Chuyển chuỗi thành chữ thường
    .replace(/[\s_]+/g, "-") // Thay thế khoảng trắng và dấu gạch dưới bằng dấu gạch ngang
    .replace(/[^\w-]+/g, "") // Loại bỏ các kí tự đặc biệt
    .replace(/^-+|-+$/g, ""); // Loại bỏ các dấu gạch ngang thừa ở đầu và cuối chuỗi
}
const updatePost = async () => {
  await request
    .put("admin/blog/" + idPost.value, {
      title: dataTitle.value,
      titleEnglish: dataTitleEng.value,
      description: dataContent.value,
      descriptionEnglish: dataContentEng.value,
      featuredImage: accountDataLocal.value,
      actived: checkboxString.value === "On" ? true : false,
    })
    .then((res) => {
      isDialogVisible.value = false;
      idPost.value = null;
      dataTitle.value = "";
      dataContent.value = "";
      dataTitleEng.value = "";
      dataContentEng.value = "";
      accountDataLocal.value = "";
      fetchPost();
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
};
const createPost = async () => {
  await request
    .post("admin/blog/", {
      title: dataTitle.value,
      titleEnglish: dataTitleEng.value,
      slug: generateSlug(dataTitle.value),
      description: dataContent.value,
      descriptionEnglish: dataContentEng.value,
      featuredImage: accountDataLocal.value,
      actived: checkboxString.value === "On" ? true : false,
    })
    .then((res) => {
      isDialogVisible.value = false;
      idPost.value = null;
      dataTitle.value = "";
      dataContent.value = "";
      dataTitleEng.value = "";
      dataContentEng.value = "";
      accountDataLocal.value = "";
      fetchPost();
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
};

const titleTable = languagePack.POSTS;
const refInputEl = ref<HTMLElement>();

const accountDataLocal = ref();
const changeAvatar = (file: Event) => {
  const fileReader = new FileReader();
  const { files } = file.target as HTMLInputElement;
  console.log("🚀 ~ changeAvatar ~ files:", files);

  if (files && files.length) {
    const data = new FormData();
    data.append("image", files[0]);
    data.append("key", "05f693bbd8f9a956eaa178d0a7b40037");
    return fetch("https://api.imgbb.com/1/upload", {
      method: "post",
      body: data,
    })
      .then(async (res) => {
        const result = await res.json();
        console.log("🚀 ~ .then ~ result:", result);

        accountDataLocal.value = result.data.display_url;
      })
      .catch((error) => {
        console.log("🚀 ~ returnnewPromise ~ error:1", error);
      });
  }
};

// reset avatar image
const resetAvatar = () => {
  accountDataLocal.value = "";
};
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
            <VBtn @click="handleOpenPost(null)" variant="tonal">
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
                  {{ languagePack.NOTIFY_ID }}
                </th>
                <th scope="col">
                  {{ languagePack.NOTIFY_TITLE }}
                </th>

                <th scope="col" style="text-align: center">
                  {{ languagePack.NOTIFY_ACTIONS }}
                </th>
              </tr>
            </thead>

            <!-- 👉 table body -->
            <tbody>
              <tr v-for="noti in data" :key="noti.id">
                <td>
                  {{ noti.id }}
                </td>
                <!-- 👉 User -->
                <td>
                  <span class="text-capitalize text-base">{{
                    noti.title
                  }}</span>
                </td>

                <!-- 👉 Actions -->
                <td class="text-center">
                  <!-- <MoreBtn :menu-list="computedMoreList(user.userId)" item-props /> -->
                  <VBtn
                    color="success"
                    size="small"
                    @click="handleOpenPost(noti.id)"
                  >
                    {{ languagePack.NOTIFY_ACTIONS_EDIT }} </VBtn
                  >&ensp;
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
    <VDialog v-model="isDialogVisible" max-width="600">
      <!-- Dialog Activator -->

      <!-- <VBtn v-bind="props"> Open Dialog </VBtn> -->

      <!-- Dialog Content -->
      <VCard :title="languagePack.POSTS">
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
              <VTextField v-model="dataTitleEng" label="English" />
            </VCol>
            <VCol cols="12">
              <div class="d-flex flex-wrap gap-4">
                <VBtn color="primary" @click="refInputEl?.click()">
                  <span>Upload</span>

                  <input
                    ref="refInputEl"
                    type="file"
                    name="file"
                    accept=".jpeg,.png,.jpg,GIF"
                    hidden
                    @input="changeAvatar"
                  />
                </VBtn>
                <div v-if="accountDataLocal">
                  <img
                    :src="accountDataLocal"
                    alt="Uploaded"
                    style="max-width: 100%"
                  />
                </div>
              </div>
            </VCol>
            <VCol cols="12">
              <QuillEditor
                style="height: 320px"
                v-model:content="dataContent"
                contentType="html"
                :modules="modulesImage"
                toolbar="full"
              />
            </VCol>
            <VCol cols="12">
              <span>English Content</span>
              <QuillEditor
                style="height: 320px"
                v-model:content="dataContentEng"
                contentType="html"
                :modules="modulesImage"
                toolbar="full"
              />
            </VCol>
          </VRow>
        </VCardText>

        <VCardText class="d-flex justify-end gap-2">
          <VBtn variant="tonal" @click="deletePost" v-if="idPost">
            Delete
          </VBtn>
          <VBtn @click="idPost ? updatePost() : createPost()">
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
