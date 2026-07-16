export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user/login',
        name: 'Giriş Yap',
        component: './user/login',
      },
      {
        path: '/user',
        redirect: '/user/login',
      },
    ],
  },

  {
    path: '/dashboard',
    name: 'Ana Panel',
    icon: 'home',
    component: './dashboard/analysis',
  },

  {
    path: '/talepler',
    name: 'Talepler',
    icon: 'fileText',
    routes: [
      {
        path: '/talepler',
        redirect: '/talepler/gelen',
      },
      {
        path: '/talepler/yeni',
        name: 'Yeni Talep',
        icon: 'plusCircle',
        component: './form/basic-form',
      },
      {
        path: '/talepler/gelen',
        name: 'Bana Gelen',
        icon: 'inbox',
        component: './table-list',
      },
      {
        path: '/talepler/gonderilen',
        name: 'Gönderdiğim',
        icon: 'send',
        component: './table-list',
      },
      {
        path: '/talepler/bekleyen',
        name: 'Bekleyen',
        icon: 'clockCircle',
        component: './table-list',
      },
      {
        path: '/talepler/islemde',
        name: 'İşlemde',
        icon: 'sync',
        component: './table-list',
      },
      {
        path: '/talepler/tamamlanan',
        name: 'Tamamlanan',
        icon: 'checkCircle',
        component: './table-list',
      },
    ],
  },

  {
    path: '/',
    redirect: '/dashboard',
  },

  {
    path: '/*',
    component: './exception/404',
  },
];