import { languagePack } from "@/languages";

export default [
  { heading: languagePack.NAVIGATION_TITLE_AUTHENTICATION },
  {
    title: languagePack.NAVIGATION_VERY_USER,
    icon: { icon: "bx-check-shield" },
    to: "pages-typography",
  },
  {
    title: languagePack.NAVIGATION_NOTIFY,
    icon: { icon: "bxs-bell-ring" },
    to: "pages-notify",
  },
  {
    title: languagePack.NAVIGATION_CONFIG,
    icon: { icon: "bx-wrench" },
    to: "pages-config",
  },
  {
    title: "Blogs",
    icon: { icon: "bx-show" },
    to: "pages-blogs",
  },
  {
    title: "Members",
    icon: { icon: "bx-child" },
    to: "pages-members",
  },
  {
    title: languagePack.NAVIGATION_SETUP,
    to: "pages-setup-Order",
    icon: { icon: "bx-cog" },

    // children: [
    //   { title: languagePack.NAVIGATION_SETUP_ORDER, to: 'pages-setup-Order' },
    // { title: 'Basic', to: 'pages-cards-card-basic' },
    // { title: 'Statistics', to: 'pages-cards-card-statistics' },
    // { title: 'Advance', to: 'pages-cards-card-advance' },
    // { title: 'Widgets', to: 'pages-cards-card-widgets' },
    // { title: 'Gamification', to: 'pages-cards-card-gamification' },
    // { title: 'Actions', to: 'pages-cards-card-actions' },
    // ],
  },

  // {
  //   title: 'Components',
  //   icon: { icon: 'bx-box' },
  //   children: [
  //     { title: 'Alert', to: 'components-alert' },
  //     { title: 'Avatar', to: 'components-avatar' },
  //     { title: 'Badge', to: 'components-badge' },
  //     { title: 'Button', to: 'components-button' },
  //     { title: 'Chip', to: 'components-chip' },
  //     { title: 'Dialog', to: 'components-dialog' },
  //     { title: 'Expansion Panel', to: 'components-expansion-panel' },
  //     { title: 'List', to: 'components-list' },
  //     { title: 'Menu', to: 'components-menu' },
  //     { title: 'Pagination', to: 'components-pagination' },
  //     { title: 'Progress Circular', to: 'components-progress-circular' },
  //     { title: 'Progress Linear', to: 'components-progress-linear' },
  //     { title: 'Snackbar', to: 'components-snackbar' },
  //     { title: 'Tabs', to: 'components-tabs' },
  //     { title: 'Timeline', to: 'components-timeline' },
  //     { title: 'Tooltip', to: 'components-tooltip' },
  //   ],
  // },
];
