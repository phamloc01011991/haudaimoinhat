<script setup>
import { languagePack } from '@/languages'
import { themeConfig } from '@themeConfig'
</script>

<template>
  <div class="h-100 d-flex align-center justify-space-between">
    <!-- 👉 Footer: left content -->
    <span class="d-flex align-center" />
    <!-- 👉 Footer: right content -->
    <span class="d-md-flex text-primary d-none">
      &copy;
      {{ new Date().getFullYear() }}
      {{ languagePack.FOOTER_MADE_WITH }}
      <VIcon
        icon="bx-heart"
        color="error"
        size="1.25rem"
        class="mx-1"
      />
      {{ languagePack.FOOTER_BY }}
      <a
        href=""
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary ms-1"
      >{{ themeConfig.app.title }}</a>
    </span>
  </div>
</template>
