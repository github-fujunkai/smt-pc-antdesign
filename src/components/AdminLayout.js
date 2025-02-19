import React, { useEffect, useState } from "react";
import {
  AppstoreAddOutlined,
  InfoCircleOutlined,
  MenuFoldOutlined,
  SafetyCertificateOutlined,
  BarcodeOutlined,
  GoldOutlined,
  DashboardOutlined,
  MenuUnfoldOutlined,
  SafetyOutlined,
  DownOutlined,
  CopyOutlined,
  SettingOutlined,
  ToolOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme, Button, Dropdown, Space } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { findKeyInMenuItems } from "../utils/util";
import { config } from "../utils/config";
import { color } from "echarts";
// import logo from `../assets/images/${logo}.png`

const { Header, Content, Footer, Sider } = Layout;

const AdminLayout = ({ children, handleAddTab }) => {
  const navigate = useNavigate();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const [collapsed, setCollapsed] = useState(false);
  const [username, setUsername] = useState(false);

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
  }, []);

  const items = [
    // { key: 'home', icon: <DashboardOutlined />, label: <Link to="/home">首页</Link> },
    // { key: 'test', icon: <CopyOutlined />, label: <Link to="/test">测试</Link> },
    {
      key: "setting",
      icon: <SettingOutlined />,
      label: "基础设置",
      children: [
        {
          key: "app-permission",
          label: <Link to="/app-permission">菜单管理</Link>,
        },
        {
          key: "app-role",
          label: <Link to="/app-role">角色管理</Link>,
        },
        {
          key: "app-user",
          label: <Link to="/app-user">用户管理</Link>,
        },
        {
          key: "wrapper",
          label: "包装设置",
          children: [
            {
              key: "wrapper-machine",
              label: <Link to="/wrapper-machine">{/*done-*/}机型维护</Link>,
            },
          ],
        },
        {
          key: "code-review",
          label: <Link to="/code-review">{/*done-*/}不良代码</Link>,
        },
        {
          key: "printer-template",
          label: <Link to="/printer-template">{/*done-*/}打印模板</Link>,
        },
        {
          key: "WarehouseSetup",
          label: <Link to="/WarehouseSetup">仓库设置</Link>,
        },
      ],
    },
    {
      key: "setting-modeling",
      label: "工厂建模",
      icon: <AppstoreAddOutlined />,
      children: [
        {
          key: "factory",
          label: <Link to="/factory">厂区管理</Link>,
        },
        {
          key: "workshop",
          label: <Link to="/workshop">车间管理</Link>,
        },
        {
          key: "trace-creation",
          label: <Link to="/trace-creation">创建产线</Link>,
        },
      ],
    },
    {
      key: "setting-material",
      label: "替代物料",
      icon: <GoldOutlined />,
      children: [
        {
          key: "material-generality",
          label: <Link to="/material-generality">通用替代料</Link>,
        },
        {
          key: "material-program",
          label: <Link to="/material-program">程序替代料</Link>,
        },
        {
          key: "material-order",
          label: <Link to="/material-order">工单替代料</Link>,
        },
      ],
    },
    {
      key: "setting-barcode",
      label: "规则设定",
      icon: <BarcodeOutlined />,
      children: [
        {
          key: "barcode-comparing",
          label: <Link to="/barcode-comparing">料号比对</Link>,
        },
        {
          key: "barcode-decoding",
          label: <Link to="/barcode-decoding">条码解析</Link>,
        },
        {
          key: "barcode-creation",
          label: <Link to="/barcode-creation">生成规则</Link>,
        },
      ],
    },
    {
      key: "store-info",
      label: "仓库管理",
      icon: <GoldOutlined />,
      children: [
        {
          key: "store-material",
          label: <Link to="/store-material">物料信息</Link>,
        },
        // {
        //   key: "store-in",
        //   label: <Link to="/store-in">打印-入库</Link>,
        // },
        {
          key: "MaterialInbound",
          label: <Link to="/MaterialInbound">原材入库</Link>,
        },
        {
          key: "MaterialOutbound",
          label: <Link to="/MaterialOutbound">原材出库</Link>,
        },
        {
          key: "InventoryQuery",
          label: <Link to="/InventoryQuery">库存查询</Link>,
        },
        {
          key: "InventoryCount",
          label: <Link to="/InventoryCount">库存盘点</Link>,
        },
        {
          key: "MaterialHistory",
          label: <Link to="/MaterialHistory">原材履历</Link>,
        },
      ],
    },
    {
      key: "trace",
      icon: <SafetyCertificateOutlined />,
      label: "防错追溯",
      children: [
        {
          key: "trace-safe",
          label: <Link to="/trace-safe">防错追溯</Link>,
        },
        {
          key: "trace-setting",
          label: <Link to="/trace-setting">参数设置</Link>,
        },
      ],
    },
    {
      key: "trace-info",
      label: "信息查询",
      icon: <InfoCircleOutlined />,
      children: [
        {
          key: "info-scanning",
          label: <Link to="/info-scanning">扫描记录</Link>,
        },
        {
          key: "info-transit",
          label: <Link to="/info-transit">过站记录</Link>,
        },
        {
          key: "info-trace",
          label: <Link to="/info-trace">追溯信息</Link>,
        },
        {
          key: "info-shutdown",
          label: <Link to="/info-shutdown">停机信息</Link>,
        },
        {
          key: "info-order",
          label: <Link to="/info-order">工单物料</Link>,
        },
        {
          key: "info-material",
          label: <Link to="/info-material">物料记录</Link>,
        },
      ],
    },
    {
      key: "production-plan",
      label: "生产计划",
      icon: <ScheduleOutlined />,
      children: [
        {
          key: "plan-order",
          label: <Link to="/plan-order">{/*done-*/}工单信息</Link>,
        },
        {
          key: "technological-process",
          label: <Link to="/technological-processs">工艺流程</Link>,
        },
      ],
    },
    {
      key: "production-management",
      label: "生产管理",
      icon: <ToolOutlined />,
      children: [
        {
          key: "management-inspection",
          label: <Link to="/management-inspection">{/*done-*/}目检</Link>,
        },
        {
          key: "management-maintenance",
          label: <Link to="/management-maintenance">{/*done-*/}维修</Link>,
        },
        {
          key: "packaging-inquiry",
          label: <Link to="/packaging-inquiry">{/*done-*/}包装</Link>,
        },
        // , {
        //   key: 'management-wrapper',
        //   label: '打印-包装',
        //   children: [{
        //     key: 'wrapper-level-one',
        //     label:  <Link to="/wrapper-level-one">一级包装</Link>,
        //   }, {
        //     key: 'wrapper-level-two',
        //     label: <Link to="/wrapper-level-two">二级包装</Link>,
        //   }]
        // }
        {
          key: "management-delivery",
          label: <Link to="/management-delivery">出货</Link>,
        },
      ],
    },
    // {
    //   key: 'device-management',
    //   label: '设备管理',
    //   icon: <RobotOutlined />,
    //   children: [{
    //     key: 'device-type',
    //     label: <Link to="/device-type">new-设备型号</Link>,
    //   }, {
    //     key: 'device-modeling',
    //     label: <Link to="/device-modeling">new-车间建模</Link>,
    //   }, {
    //     key: 'device-model',
    //     label: <Link to="/device-model">车间建模</Link>,
    //   }]
    // },
  ];

  useEffect(() => {
    // 获取当前页面的路由路径
    const currentPath = window.location.pathname;
    console.log("currentPath", currentPath);
    // 根据当前路径设置对应的菜单项为选中状态
    // const selectedItem = items.find((item) => item?.label?.props?.to === currentPath);
    const selectedItem = findKeyInMenuItems(
      items,
      currentPath.toString().substr(1)
    );
    console.log("selectedItem", selectedItem);
    if (selectedItem) {
      setCurrent(selectedItem.key);
    }
  }, []);

  const [current, setCurrent] = useState("");
  const onClickMenu = (e) => {
    console.log("click ", e);
    setCurrent(e.key);

    // 获取当前页面的路由路径
    const currentPath = window.location.pathname;
    console.log("currentPath", currentPath);
    // 根据当前路径设置对应的菜单项为选中状态
    // const selectedItem = items.find((item) => item?.label?.props?.to === currentPath);
    const selectedItem = findKeyInMenuItems(
      items,
      currentPath.toString().substr(1)
    );
    console.log("selectedItem", selectedItem);
    handleAddTab(
      selectedItem.label.props.to,
      selectedItem.label.props.children
    );
  };
  const logout = () => {
    // localStorage.clear()
    localStorage.removeItem(config.AUTH_TOKEN);
    navigate("/", { replace: true });
  };

  const brand = localStorage.getItem("brand");
  let logo = null;
  try {
    logo = require(`../assets/images/${brand}.png`);
  } catch (e) {
    // logo = require(`../assets/images/logo.png`); // 默认logo
  }
  let brander = {
    aj: {
      zhFullText: "安健智能",
      zhAbstractText: "安健",
      enFullText: "AJTECH",
      enAbstractText: "AJ",
    },
    rz: {
      zhFullText: "瑞制智能",
      zhAbstractText: "瑞制",
      enFullText: "RZTECH",
      enAbstractText: "RZ",
    },
  };
  if (!brander[brand]) {
    brander[brand] = {
      zhFullText: "智慧",
      zhAbstractText: "智慧",
      enFullText: "SMART",
      enAbstractText: "SMT",
    };
  }
  return (
    <Layout style={{ minHeight: "100%" }}>
      <Sider
        style={{
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          backgroundColor: "#f5f6f7",
        }}
        theme="light"
        breakpoint="lg"
        collapsedWidth="80"
        onBreakpoint={(broken) => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
        trigger={null}
        collapsible
        collapsed={collapsed}
      >
        <div className="demo-logo-vertical">
          <div
            className="collapsed"
            style={{ color: "#fff", fontSize: "22px" }}
          >
            {collapsed
              ? `${brander[brand].enAbstractText} · IOT`
              : `${brander[brand].zhFullText} · 物联网`}
          </div>
        </div>
        <Menu
          className="custom-menu"
          theme="light"
          mode="inline"
          onClick={onClickMenu}
          selectedKeys={[current]}
          items={items}
        />
      </Sider>
      <Layout
        className="bg-content"
        style={collapsed ? { marginLeft: 80 } : { marginLeft: 200 }}
      >
        <Header
          className="header"
          style={{
            padding: "0 16px 0 0",
            backgroundColor: "#177bff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            lineHeight: 1,
            height: "45px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              type="text"
              icon={
                collapsed ? (
                  <MenuUnfoldOutlined
                    style={{ color: "rgba(255, 255, 255, 0.65)" }}
                  />
                ) : (
                  <MenuFoldOutlined
                    style={{ color: "rgba(255, 255, 255, 0.65)" }}
                  />
                )
              }
              onClick={() => setCollapsed(!collapsed)}
            />
            {/* <div style={{display: 'flex', alignItems: 'center',position: 'relative',left: '45%'}}>
              { logo ? <img src={logo} style={{height: 50}} /> : null }
              <div style={{lineHeight: 1.5, color: 'rgba(255, 255, 255, 0.65)', marginLeft: 16}}>
                <div style={{fontSize: 18, letterSpacing: 5}}>{`${brander[brand].zhFullText}IOT平台`}</div>
                <div style={{fontSize: 14, letterSpacing: 2}}>{`${brander[brand].enFullText} IOT PLATFORM`}</div>
              </div>
            </div> */}
          </div>
          <Dropdown
            menu={{
              items: [
                {
                  key: "1",
                  label: "退出登录",
                },
              ],
              onClick: logout,
            }}
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space style={{ color: "rgba(255, 255, 255, 0.65)" }}>
                <span>欢迎 {username}，退出</span>
                <DownOutlined />
              </Space>
            </a>
          </Dropdown>
        </Header>
        <Content>
          <div
            style={{
              // height: 'calc(100% - 55px)',
              overflow: "auto",
            }}
          >
            {children}
          </div>
        </Content>
        {/* <Footer
          style={{
            textAlign: 'center',
            backgroundColor: 'transparent',
            color: 'rgba(255, 255, 255, 0.65)',
          }}
        >
          {`${brander[brand].zhFullText}`} ©{new Date().getFullYear()} Created by {`${brander[brand].enFullText}`}
        </Footer> */}
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
