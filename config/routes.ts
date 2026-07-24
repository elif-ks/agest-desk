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
      access: 'canUser',

    component: './dashboard/analysis',
  },

  {
    path: '/talepler',
      access: 'canUser',
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
  path: '/admin',
  name: 'Yönetim',
  icon: 'setting',
  access: 'canAdmin',
  routes: [
    {
      path: '/admin',
      redirect: '/admin/dashboard',
    },
    {
      path: '/admin/dashboard',
      name: 'Yönetim Paneli',
      icon: 'dashboard',
      access: 'canAdmin',
      component: './admin/dashboard/index',
    },
    {
      path: '/admin/kullanicilar',
      name: 'Kullanıcı Yönetimi',
      icon: 'team',
      access: 'canAdmin',
      component: './admin/kullanicilar/index',
      
    },
    {
  path: '/admin/departmanlar',
  name: 'Departman Yönetimi',
  icon: 'apartment',
  access: 'canAdmin',
  component: './admin/departmanlar',
},
  ],
},
// {
//   path: '/',
//   redirect: '/dashboard',
// },

  {
    path: '/*',
    component: './exception/404',
  },
];