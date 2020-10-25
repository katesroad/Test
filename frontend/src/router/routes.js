const routes = [
  {
    path: "/",
    component: () => import("layouts/index.vue"),
    children: [
      {
        path: "/",
        component: () => import("pages/home/index.vue")
      },
      {
        path: "/blocks",
        component: () => import("pages/blocks/index.vue")
      },
      {
        path: "/block",
        redirect: "/blocks"
      },
      {
        path: "/block/:number",
        component: () => import("pages/block/index.vue")
      },
      {
        path: "/txs",
        component: () => import("pages/txs/index.vue")
      },
      {
        path: "/tx",
        redirect: "/txs"
      },
      {
        path: "/tx/:hash",
        component: () => import("pages/tx/index.vue")
      },
      {
        path: "/address/:hash",
        component: () => import("pages/address/index.vue")
      },
      {
        path: "/token/:hash",
        component: () => import("pages/token/index.vue")
      },
      {
        path: "/token",
        redirect: "/tokens"
      },
      {
        path: "/tokens",
        component: () => import("pages/tokens/index.vue")
      },
      {
        path: "/swap/:hash",
        component: () => import("pages/swap/index.vue")
      },
      {
        path: "/anyswap",
        component: () => import("pages/anyswap/index.vue")
      },
      {
        path: "*",
        component: () => import("pages/404.vue")
      }
    ]
  },
  {
    path: "*",
    component: () => import("pages/404.vue")
  }
];

export default routes;
