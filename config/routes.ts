/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,name,icon 的配置
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @param name 配置路由的标题，默认读取国际化文件 menu.ts 中 menu.xxxx 的值，如配置 name 为 login，则读取 menu.ts 中 menu.login 的取值作为标题
 * @param icon 配置路由的图标，取值参考 https://ant.design/components/icon-cn， 注意去除风格后缀和大小写，如想要配置图标为 <StepBackwardOutlined /> 则取值应为 stepBackward 或 StepBackward，如想要配置图标为 <UserOutlined /> 则取值应为 user 或者 User
 * @doc https://umijs.org/docs/guides/routes
 */

export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './Login',
      },
    ],
  },
  // {
  //   path: '/welcome',
  //   name: 'welcome',
  //   icon: 'smile',
  //   component: './Welcome',
  // },
  {
    path: '/app',
    name: '基础设置',
    icon: 'SettingOutlined',
    access: 'canAdmin',
    routes: [
      {
        path: '/app',
        redirect: '/',
      },
      {
        path: '/app/AppPermission',
        name: '菜单管理',
        component: './AppPermission',
      },
      {
        path: '/app/AppRole',
        name: '角色管理',
        component: './AppRole',
      },
      {
        path: '/app/AppUser',
        name: '用户管理',
        component: './AppUser',
      },
      {
        path: '/app/WrapperMachine',
        name: '机型维护',
        component: './WrapperMachine',
      },
      {
        path: '/app/CodeReview',
        name: '不良代码',
        component: './CodeReview',
      },
      {
        path: '/app/PrinterTemplate',
        name: '打印模板',
        component: './PrinterTemplate',
      },
      {
        path: '/app/WarehouseSetup',
        name: '仓库设置',
        component: './WarehouseSetup',
      },
      {
        path: '/app/dictionary',
        name: '数据字典',
        component: './app/dictionary',
      }
    ],
  },
  {
    path: '/factory',
    name: '工厂建模',
    icon: 'InsertRowBelowOutlined',
    access: 'canAdmin',
    routes: [
      {
        path: '/factory',
        redirect: '/',
      },
      {
        path: '/factory/Factory',
        name: '厂区管理',
        component: './Factory',
      },
      {
        path: '/factory/Workshop',
        name: '车间管理',
        component: './Workshop',
      },
      {
        path: '/factory/TraceCreation',
        name: '创建产线',
        component: './TraceCreation',
      },
    ],
  },
  {
    path: '/replace',
    name: '替代物料',
    icon: 'InboxOutlined',
    access: 'canAdmin',
    routes: [
      {
        path: '/replace',
        redirect: '/',
      },
      {
        path: '/replace/MaterialGenerality',
        name: '通用替代料',
        component: './MaterialGenerality',
      },
      {
        path: '/replace/MaterialProgram',
        name: '程序替代料',
        component: './MaterialProgram',
      },
      {
        path: '/replace/MaterialOrder',
        name: '工单替代料',
        component: './MaterialOrder',
      },
    ],
  },
  {
    path: '/rule',
    name: '规则设定',
    icon: 'ProfileOutlined',
    access: 'canAdmin',
    routes: [
      {
        path: '/rule',
        redirect: '/',
      },
      {
        path: '/rule/BarcodeComparing',
        name: '料号对比',
        component: './rule/BarcodeComparing',
      },
      {
        path: '/rule/BarcodeDecoding',
        name: '条码解析',
        component: './rule/BarcodeDecoding',
      },
      {
        path: '/rule/BarcodeCreation',
        name: '生成规则',
        component: './BarcodeCreation',
      },
    ],
  },
  {
    path: '/warehouse',
    name: '仓库管理',
    icon: 'HomeOutlined',
    access: 'canAdmin',
    routes: [
      {
        path: '/warehouse',
        redirect: '/',
      },{
        path: '/warehouse/StoreMaterial',
        name: '物料信息',
        component: './StoreMaterial',
      },
      {
        path: '/warehouse/MaterialInbound',
        name: '入库管理',
        component: './warehouse/MaterialInbound',
      },
      {
        path: '/warehouse/MaterialOutbound',
        name: '出库管理',
        component: './warehouse/MaterialOutbound',
      },
      {
        path: '/warehouse/TransferOrder',
        name: '库位调拨',
        component: './warehouse/TransferOrder',
      },
      {
        path: '/warehouse/InventoryQuery',
        name: '库存查询',
        component: './warehouse/InventoryQuery',
      },
      {
        path: '/warehouse/InventoryCount',
        name: '库存盘点',
        component: './warehouse/InventoryCount',
      },
      {
        path: '/warehouse/MaterialHistory',
        name: '操作履历',
        component: './warehouse/MaterialHistory',
      },
    ],
  },
  {
    path: '/ierror',
    name: '防错追溯',
    icon: 'SafetyCertificateOutlined',
    access: 'canAdmin',
    routes: [
      {
        path: '/ierror',
        redirect: '/',
      },{
        path: '/ierror/TraceSafe',
        name: '防错追溯',
        component: './TraceSafe',
      },
      {
        path: '/ierror/tranceSetting',
        name: '参数设置',
        component: './tranceSetting/Index',
      },
    ],
  },
  // {
  //   path: '/search',
  //   name: '信息查询',
  //   icon: 'SearchOutlined',
  //   access: 'canAdmin',
  //   routes: [
  //     {
  //       path: '/search',
  //       redirect: '/',
  //     },{
  //       path: '/search/InfoScanning',
  //       name: '扫描记录',
  //       component: './InfoScanning',
  //     },
  //     {
  //       path: '/search/CrossStation',
  //       name: '过站查询',
  //       component: './search/CrossStation',
  //     },
  //     {
  //       path: '/search/InfoTransit',
  //       name: '过站记录',
  //       component: './InfoTransit',
  //     },
  //     {
  //       path: '/search/InfoTrace',
  //       name: '追溯信息',
  //       component: './InfoTrace',
  //     },
  //     {
  //       path: '/search/InfoShutdown',
  //       name: '停机信息',
  //       component: './InfoShutdown',
  //     },
  //     {
  //       path: '/search/InfoOrder',
  //       name: '工单物料',
  //       component: './InfoOrder',
  //     },
  //     {
  //       path: '/search/InfoMaterial',
  //       name: '物料记录',
  //       component: './InfoMaterial',
  //     },
  //     {
  //       path: '/search/ViewQuery',
  //       name: '视图查询',
  //       component: './search/ViewQuery',
  //     }
  //   ],
  // },
  {
    path: '/produce',
    name: '生产计划',
    icon: 'ProjectOutlined',
    access: 'canAdmin',
    routes: [
      {
        path: '/produce',
        redirect: '/',
      },{
        path: '/produce/PlanOrder',
        name: '工单信息',
        component: './PlanOrder',
      },
      {
        path: '/produce/TechnologicalProcess',
        name: '工艺流程',
        component: './TechnologicalProcess',
      },
      {
        path: '/produce/product',
        name: '产品管理',
        component: './produce/product',
      },
    ],
  },
  {
    path: '/manufacture',
    name: '生产管理',
    icon: 'SolutionOutlined',
    access: 'canAdmin',
    routes: [
      {
        path: '/manufacture',
        redirect: '/',
      },{
        path: '/manufacture/ManagementInspection',
        name: '目检',
        component: './ManagementInspection',
      },
      {
        path: '/manufacture/ManagementMaintenance',
        name: '维修',
        component: './ManagementMaintenance',
      },
      {
        path: '/manufacture/PackagingInquiry',
        name: '包装',
        component: './PackagingInquiry',
      },
      {
        path: '/manufacture/ManagementDelivery',
        name: '出货',
        component: './ManagementDelivery',
      },
    ],
  },
  {
    path: '/Quality',
    name: '品质管理',
    icon: 'DownSquareOutlined',
    access: 'canAdmin',
    routes: [
      {
        path: '/Quality',
        redirect: '/',
      },{
        path: '/Quality/InspectionScheme',
        name: '检验方案',
        component: './Quality/InspectionScheme',
      },{
        path: '/Quality/examination',
        name: '检验',
        component: './Quality/examination',
      },
    ],
  },
  // {
  //   path: '/admin',
  //   name: 'admin',
  //   icon: 'crown',
  //   access: 'canAdmin',
  //   routes: [
  //     {
  //       path: '/admin',
  //       redirect: '/admin/sub-page',
  //     },
  //     {
  //       path: '/admin/sub-page',
  //       name: 'sub-page',
  //       component: './Admin',
  //     },
  //   ],
  // },
  // {
  //   name: 'list.table-list',
  //   icon: 'table',
  //   path: '/list/index',
  //   component: './TableList',
  // },
  // {
  //   name: 'list.detail',
  //   icon: 'table',
  //   path: '/list/detail/:id',
  //   component: './TableList/detail',
  //   hideInMenu: true,
  //   parentKey: ['/list/index'],
  // },
  {
    path: '/',
    redirect: '/user/login',
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];
