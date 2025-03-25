import { Question, SelectLang } from '@/components/RightContent';
import { SearchOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import './assets/styles/reset.scss';
import './assets/styles/style.scss';
import { AvatarDropdown, AvatarName } from './components/RightContent/AvatarDropdown';
import ViewQuery from './pages/search1/ViewQuery';
import { errorConfig } from './requestErrorConfig';
import { config } from './utils/config';
import http from './utils/http';
const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  // 定义一个异步函数，用于获取用户信息
  // 定义一个异步函数，用于获取用户信息
  const fetchUserInfo = async () => {
    try {
      // 返回一个包含用户信息的对象
      return {
        name: localStorage.getItem('username'),
        avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
        userid: '00000001',
        email: 'antdesign@alipay.com',
        signature: '海纳百川，有容乃大',
        title: '交互专家',
        group: '蚂蚁金服－某某某事业群－某某平台部－某某技术部－UED',
        tags: [
          {
            key: '0',
            label: '很有想法的',
          },
          {
            key: '1',
            label: '专注设计',
          },
          {
            key: '2',
            label: '辣~',
          },
          {
            key: '3',
            label: '大长腿',
          },
          {
            key: '4',
            label: '川妹子',
          },
          {
            key: '5',
            label: '海纳百川',
          },
        ],
        notifyCount: 12,
        unreadCount: 11,
        country: 'China',
        access: 'admin',
        geographic: {
          province: {
            label: '浙江省',
            key: '330000',
          },
          city: {
            label: '杭州市',
            key: '330100',
          },
        },
        address: '西湖区工专路 77 号',
        phone: '0752-268888888',
      };
      // 如果发生错误，跳转到登录页面
    } catch (error) {
      history.push(loginPath);
      // 如果没有发生错误，返回undefined
    }
    return undefined;
  };
  // 如果不是登录页面，执行
  const { location } = history;
  if (location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    actionsRender: () => [<Question key="doc" />, <SelectLang key="SelectLang" />],
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },

    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    footerRender: () => null,
    layoutBgImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    links: isDev
      ? [
          // <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
          //   <LinkOutlined />
          //   <span>OpenAPI 文档</span>
          // </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          <SettingDrawer
            disableUrlParams
            enableDarkTheme
            settings={initialState?.settings}
            onSettingChange={(settings) => {
              setInitialState((preInitialState) => ({
                ...preInitialState,
                settings,
              }));
            }}
          />
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  ...errorConfig,
};


// ----------------------------------------------------------------------------------
const fetchRouteConfig = async () => {
  console.log('fetchRouteConfig', ViewQuery);
  const res = await http.get(config.API_PREFIX + 'dict/view/list', {});
  if (res) {
    return res?.bizData?.map((item, index) => {
      return {
        path: '/search1/' + index, // + '?id=' + item.dictValue,
        name: item.dictValue,
        element: <ViewQuery />,
        // parentId: '999',
        // id: 9999+item.dictValue,
      };
    });
  }else {
    return [];
  }
};
let extraRoutes = [];
export async function render(oldRender) {
  try {
    // 尝试获取路由配置
    extraRoutes = await fetchRouteConfig();
  } catch (error) {
    // 捕获错误并提供降级处理
    console.error('获取路由配置失败:', error);
    extraRoutes = []; // 降级为默认空路由或预设默认配置
  }
  // 确保继续执行渲染
  oldRender();
}

export function patchClientRoutes({ routes }) {
  // 找到布局路由（通常路径为 '/' 的路由）
  const layoutRoute = routes.find((r) => r.path === '/');
  console.log('layoutRoute.routes', layoutRoute.routes);
  if (layoutRoute) {
    layoutRoute.routes[0].routes.push({
      path: '/search1',
      name: '信息查询',
      access: 'canAdmin',
      icon: <SearchOutlined />,
      wrappers: layoutRoute.wrappers,
      component: layoutRoute.component,
      element: <ViewQuery />, // 这里要有页面才显示子组件页面，要不然是空白的
      id: '999',
      routes: [...extraRoutes],
      children: [...extraRoutes],
    });
    console.log('Updated routes:', layoutRoute.routes); // 验证添加后的路由
  }
}
// ------------------------------------------------------------------------------------------------------