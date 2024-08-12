import { languagePack } from '@/languages'

export default [
  { heading: languagePack.NAVIGATION_TITLE_INVOICE },
  {
    title: languagePack.NAVIGATION_DEPOINT,
    icon: { icon: 'bx-file' },
    to: 'apps-invoice-list',

    // children: [
    //   { title: languagePack.NAVIGATION_DEPOINT, to: 'apps-invoice-list' },
    //   { title: languagePack.NAVIGATION_WITHDRAW, to: 'apps-invoice-add' },
    // ],
  },
  {
    title: languagePack.NAVIGATION_WITHDRAW,
    icon: { icon: 'bx-file' },
    to: 'apps-invoice-add',

    // children: [
    //   { title: languagePack.NAVIGATION_DEPOINT, to: 'apps-invoice-list' },
    //   { title: languagePack.NAVIGATION_WITHDRAW, to: 'apps-invoice-add' },
    // ],
  },

  // {
  //   title: languagePack.NAVIGATION_USER,
  //   icon: { icon: 'bx-user' },
  //   children: [
  //     { title: languagePack.NAVIGATION_USER_OVERVIEW, to: 'apps-user-list'},
  //     { title: languagePack.NAVIGATION_SENDMONEY, to: 'pages-send-money'},
  //     { title: languagePack.NAVIGATION_LOCK_ACC_USER, to: 'pages-lock-account'}
  //   ],
  // },
  // {
  //   title: 'Authention',
  //   icon: { icon: 'bx-check-shield' },
  //   children: [
  //     { title: 'Overview', to:{path: '/apps/authention/confirm'} },
  //     // { title: 'View', to: { name: 'apps-user-view-id', params: { id: 21 } } },
  //   ],
  // }
]
