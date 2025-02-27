import { ProLayoutProps } from '@ant-design/pro-components';

/**
 * @name
 */
const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  // 拂晓蓝
  colorPrimary: '#1890ff',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: '智慧 · 物联网',
  pwa: true,
  logo: undefined,//'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg', //logo地址
  iconfontUrl: '',
  token: {
    // bgLayout: '#529b2e',
    // 颜色 '#e6a23c','#f56c6c',
    header: {
      colorBgHeader: '#40a9ff',
      colorHeaderTitle: '#fff',
      // colorTextMenu: '#fff',
      // colorTextMenuActive: '#fff',
      // colorBgMenuItemSelected: '#555555',
      // colorTextMenuSelected: '#fff',
      colorTextRightActionsItem: '#fff',
      // heightLayoutHeader: 56,
    },
    pageContainer: {
      // paddingBlockPageContainerContent: 0,
      // paddingInlinePageContainerContent: 0,
      // colorBgPageContainer:'#f0f0f0',
    },
  },
};

export default Settings;
