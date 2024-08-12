import { languagePack } from '@/languages'

export default [
  {
    // title: languagePack.NAVIGATION_DASHBOARDS,
    title: languagePack.NAVIGATION_DASHBOARDS_OVERVIEW,
    to: 'dashboards-overview',
    icon: { icon: 'bx-home' },

    // children: [
    //   {
    //     title: languagePack.NAVIGATION_DASHBOARDS_OVERVIEW,
    //     to: 'dashboards-overview',

    //   },
    // {
    //   title: languagePack.NAVIGATION_DASHBOARDS_ANALYTICS,
    //   to: 'dashboards-analytics',
    // },
    // {
    //   title: 'CRM',
    //   to: 'dashboards-crm',
    // },
    // {
    //   title: 'eCommerce',
    //   to: 'dashboards-ecommerce',
    // },
    // ],
    // badgeContent: 'New',
    badgeClass: 'bg-error',
  },
]
