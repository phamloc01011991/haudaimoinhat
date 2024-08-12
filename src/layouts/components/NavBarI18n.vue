<script lang="ts" setup>
import NavBarI18n from '@core/components/I18n.vue'
import { useThemeConfig } from '@core/composable/useThemeConfig'
import type { I18nLanguage } from '@layouts/types'

const { isAppRtl } = useThemeConfig()

const i18nCompLanguages: I18nLanguage[] = [
  {
    label: 'English',
    i18nLang: 'EN',
  },
  {
    label: 'Việt Nam',
    i18nLang: 'VN',
  },
  {
    label: 'China',
    i18nLang: 'CN',
  },
]

const handleLangChange = (lang: string) => {
  const locations: any = localStorage.getItem('locations')
  const locationsObj = JSON.parse(locations)

  locationsObj.language = lang

  const updatedLocations = JSON.stringify(locationsObj)

  localStorage.setItem('locations', updatedLocations)
  location.reload()
}
</script>

<template>
  <NavBarI18n
    :languages="i18nCompLanguages"
    @change="handleLangChange"
  />
</template>
