import React, { useState, useMemo, useEffect } from "react";
// import locale from 'antd/lib/date-picker/locale/zh_CN';
import {
  Typography,
  message,
  Card,
  Switch,
  Table,
  Modal,
  Breadcrumb,
  Form,
  Row,
  Col,
  Select,
  Input,
  Space,
  Button,
  InputNumber,
  Divider,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  CloseOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { useAntdResizableHeader } from "@minko-fe/use-antd-resizable-header";
import "@minko-fe/use-antd-resizable-header/index.css";
import http from "../utils/http";
import { config } from "../utils/config";
import api from "../utils/api";
import qs from "qs";

// let data = [];
// for (let i = 0; i < 100; i++) {
//   data.push({
//     key: i.toString(),
//     name: `厂区 ${i}`,
//     age: `车间 ${i}`,
//     address: `产线 ${i}`,
//     name1: `设备类型 ${i}`,
//     name2: `状态 ${i}`,
//   })
// }

let activeId = "";

const App = () => {
  const [formCreate] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(1);
  const [formSearch] = Form.useForm();
  const [data, setData] = useState([]);
  const [isShowSearch, setIsShowSearch] = useState(false);

  const onChange = (e) => {
    console.log("radio checked", e.target.value);
    setValue(e.target.value);
  };

  const [deviceType, setDeviceType] = useState("");
  const deviceTypeChange = (value) => {
    setDeviceType(value);
  };

  const [url, setUrl] = useState("");
  const urlChange = (e) => {
    setUrl(e.target.value);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = (action, record) => {
    formCreate.resetFields();
    formCreate.setFieldsValue({
      items: [],
    });
    setUrl("");
    setDeviceType("");
    if (action === "update") {
      activeId = record.id;
      http
        .post(config.API_PREFIX + api.areaLine + `/${record.id}`, {})
        .then((res) => {
          console.log(res);
          const data = res?.bizData;
          formCreate.setFieldsValue({
            factoryId: data?.factoryId?.toString(),
            workshopId: data?.workshopId?.toString(),
            areName: data?.areName,
            deviceType: data?.deviceType?.toString(),
            isValid: data?.isValid === "Y" ? true : false,
            items: data?.devices || [],
          });
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      activeId = "";
      formCreate.setFieldValue("isValid", true);
    }
    setIsModalOpen(true);
  };
  const handleOk = () => {
    formCreate
      .validateFields()
      .then((values) => {
        console.log("values", values);
        const { factoryId, workshopId, areName, deviceType, isValid } = values;
        let params = {
          factoryId,
          workshopId,
          areName,
          deviceType,
          isValid: isValid ? "Y" : "N",
          devices: values?.items || [],
        };
        if (activeId) {
          params.id = activeId;
        }
        http
          .post(config.API_PREFIX + api.areaLine, params)
          .then((res) => {
            console.log(res);
            fetchData();
            message.success("保存成功！");
            setIsModalOpen(false);
          })
          .catch((err) => {
            console.error(err);
            message.error("保存失败，请重试！");
          });
      })
      .catch((error) => {
        console.log("Form validation error:", error);
      });
  };

  const readConfig = () => {
    const {
      deviceType,
      areName: areaLineName,
      url,
      items,
    } = formCreate.getFieldsValue();
    if (!areaLineName) {
      message.error("请输入产线名称！");
      return;
    }
    if (!deviceType) {
      message.error("请选择设备驱动！");
      return;
    }
    if (!url) {
      message.error("请输入读取路径！");
      return;
    }
    const params = { areaLineName, deviceType, url };
    http
      .post(
        config.API_PREFIX + api.areaLineReadConfig + `?${qs.stringify(params)}`,
        {}
      )
      .then((res) => {
        console.log(res, "deviceType", deviceType, "items", items);
        let devices = res?.bizData?.devices || [];
        if (devices.length) {
          devices.forEach((item, index) => {
            if (!item.devicePath && url) {
              item.devicePath = url;
            }
            if (!item.deviceType && deviceType) {
              item.deviceType = deviceType;
            }
            if (!item.orderNum) {
              item.orderNum = index + 1;
            }
            if (!item.serial) {
              item.serial = index + 1;
            }
            if (!item.alarmPort) {
              item.alarmPort = 8;
            }
            if (!item.alarmPort2) {
              item.alarmPort2 = 8;
            }
            if (!item.stopPort) {
              item.stopPort = 2;
            }

            if (!item.stopPort2) {
              item.stopPort2 = 3;
            }
          });
          // console.log('devices devices: ', devices)
          formCreate.setFieldsValue({ items: [...(items || []), ...devices] }); // 合并，改了又改
          formCreate.setFieldsValue({ items: devices }); // 不合并，替换掉
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const { confirm } = Modal;

  const del = (record) => {
    confirm({
      title: "删除确认",
      icon: <ExclamationCircleFilled />,
      content: "记录删除后无法恢复，是否仍要删除？",
      onOk() {
        http
          .del(config.API_PREFIX + api.areaLine + `/${record.id}`, {})
          .then((res) => {
            fetchData();
            message.success("删除成功！");
          })
          .catch((err) => {
            console.log(err);
            message.error("删除失败，请重试！");
          });
      },
      onCancel() {},
    });
  };

  const columns = [
    {
      title: "厂区",
      dataIndex: "factoryAreaNameProcess",
      key: "factoryAreaNameProcess",
      width: 200,
    },
    {
      title: "车间",
      dataIndex: "workshopAreaNameProcess",
      key: "workshopAreaNameProcess",
      width: 100,
    },
    {
      title: "产线",
      dataIndex: "areName",
      key: "areName",
      width: 100,
    },
    {
      title: "设备类型",
      dataIndex: "deviceType",
      key: "deviceType",
      width: 100,
    },
    {
      title: "状态",
      dataIndex: "areaStatus",
      key: "areaStatus",
      width: 100,
    },
    {
      title: "操作",
      dataIndex: "operation",
      render: (_, record) => {
        return (
          <Space>
            <Typography.Link onClick={() => showModal("update", record)}>
              修改
            </Typography.Link>
            <Typography.Link onClick={() => del(record)}>删除</Typography.Link>
          </Space>
        );
      },
    },
  ];

  const { components, resizableColumns, tableWidth, resetColumns } =
    useAntdResizableHeader({
      columns: useMemo(() => columns, []),
      columnsState: {
        persistenceKey: "localKeyTraceCreation",
        persistenceType: "localStorage",
      },
    });

  const [dictBaseFwa, setDictBaseFwa] = useState({});
  const getDictBaseFwa = () => {
    http
      .post(config.API_PREFIX + api.dictBaseFwa, {})
      .then((res) => {
        console.log("dict", res);
        setDictBaseFwa(res?.bizData);
      })
      .catch((err) => {});
  };

  const [dictBaseAll, setDictBaseAll] = useState({});
  const getDictBaseAll = () => {
    http
      .post(config.API_PREFIX + api.dictBaseAll, {})
      .then((res) => {
        console.log("dict", res);
        setDictBaseAll(res?.bizData);
      })
      .catch((err) => {});
  };

  const areaLinePage = () => {
    http
      .post(config.API_PREFIX + api.areaLinePage, {})
      .then((res) => {
        console.log("areaLinePage", res);
      })
      .catch((err) => {});
  };

  const showTotal = (total, range) => {
    return `总共 ${total} 条记录，当前显示 ${range[0]}-${range[1]}`;
  };

  const paginationInit = {
    pagination: {
      current: 1,
      pageSize: 10,
      showQuickJumper: true,
      showTotal,
      showSizeChanger: true,
    },
  };

  const [tableParams, setTableParams] = useState(paginationInit);

  useEffect(() => {
    getDictBaseFwa();
    getDictBaseAll();
    areaLinePage();
  }, []);

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(tableParams)]);

  const onFinish = () => {
    setTableParams(paginationInit);
  };

  const resetFormSearch = () => {
    formSearch.resetFields();
    setTableParams(paginationInit);
  };

  const handleDeleteItem = (index, remove) => {
    remove(index);
  };

  const fetchData = () => {
    setLoading(true);
    const {
      order,
      field,
      pagination: { current, pageSize },
    } = tableParams;

    let params = {
      current,
      size: pageSize,
    };
    // params['orders[0].column'] = 'id'
    // params['orders[0].asc'] = false
    console.log(order, field); // ascend id
    if (order && field) {
      // 举例：
      // orders[0].column: id
      // orders[0].asc: true
      params["orders[0].column"] = field;
      params["orders[0].asc"] = order === "ascend" ? true : false;
    }

    console.log("formSearch.getFieldsValue()", formSearch.getFieldsValue());
    const { factoryId, replaceItem, areaId, deviceType } =
      formSearch.getFieldsValue();
    if (factoryId) {
      //sdf
      params.factoryId = factoryId;
    }
    if (replaceItem) {
      params.replaceItem = replaceItem;
    }
    if (areaId) {
      params.areaId = areaId;
    }
    if (deviceType) {
      params.deviceType = deviceType;
    }

    http
      .post(
        config.API_PREFIX + api.areaLinePage + `?${qs.stringify(params)}`,
        {}
      )
      .then((res) => {
        const data = res?.bizData;
        setData(data?.records || []);
        setLoading(false);
        console.log("fetchData pagination", tableParams);
        setTableParams({
          ...tableParams,
          pagination: {
            ...tableParams.pagination,
            total: data?.total,
            showTotal,
          },
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleTableChange = (pagination, filters, sorter) => {
    console.log("handleTableChange pagination: ", pagination);
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData([]);
    }
  };

  const onSearchChange = (checked) => {
    console.log(`switch to ${checked}`);
    setIsShowSearch(checked);
  };

  const [deviceTypechildList, setDeviceTypechildList] = useState([]);
  //通过设备类型获取设备驱动
  const handleDeviceTypeChange = (deviceType, index) => {
    let child = dictBaseAll?.deviceTypeType.find(
      (item) => item.dictKey === deviceType
    );
    setDeviceTypechildList(child?.children || []);

    formCreate.setFieldValue(["items", index, "deviceType"], undefined);
  };
  //点击设备驱动赋值
  const handleDeviceTypeFocus = (value, index) => {
    let deviceType = formCreate.getFieldValue([
      "items",
      index,
      "deviceTypeType",
    ]);
    let child = dictBaseAll?.deviceTypeType.find(
      (item) => item.dictKey === deviceType
    );
    setDeviceTypechildList(child?.children || []);
  };
  //获取新字典
  const [deviceProcessData, setDeviceProcessData] = useState([]);
  const [deviceProcessList, setDeviceProcessList] = useState([]);
  const [deviceTypeList, setDeviceTypeList] = useState([]);
  const getDeviceAndProcess = () => {
    http
      .post(config.API_PREFIX + "dict/device/and/process", {})
      .then((res) => {
        let list = res?.bizData
          ?.filter((item) => {
            return item.deviceTypeType === "贴片机";
          })
          .map((item) => item.driveTypeOrProcess);
        setDeviceProcessList(list);
        let list2 = res?.bizData
          ?.filter((item) => {
            return item.deviceTypeType === "工序";
          })
          .map((item) => item.driveTypeOrProcess);
        setDeviceTypeList(list2);
        setDeviceProcessData(res?.bizData || []);
      })
      .catch((err) => {});
  };
  useEffect(() => {
    getDeviceAndProcess();
  }, []);
  return (
    <div className="content-wrapper">
      <Breadcrumb
        className="breadcrumb"
        items={[
          {
            title: "防错追溯",
          },
          {
            title: "创建产线",
          },
        ]}
      ></Breadcrumb>
      <div className="content">
        <div className="tools">
          <Space size="middle">
            <Tooltip title={isShowSearch ? "隐藏搜索" : "显示搜索"}>
              <Switch
                onChange={onSearchChange}
                checkedChildren={<SearchOutlined />}
                unCheckedChildren={<SearchOutlined />}
              />
            </Tooltip>
          </Space>
        </div>
        <div
          className="search-wrapper"
          style={{ display: isShowSearch ? "block" : "none" }}
        >
          <Form form={formSearch} onFinish={onFinish}>
            <Row gutter="24">
              <Col span={8}>
                <Form.Item label="厂区" name="factoryId">
                  <Select
                    placeholder="请选择"
                    allowClear
                    showSearch
                    options={dictBaseFwa?.factory?.map((item) => ({
                      value: item.dictKey,
                      label: item.dictValue,
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="车间" name="workshopId">
                  <Select
                    placeholder="请选择"
                    allowClear
                    showSearch
                    options={dictBaseFwa?.workshop?.map((item) => ({
                      value: item.dictKey,
                      label: item.dictValue,
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="产线" name="areaId">
                  <Select
                    placeholder="请选择"
                    allowClear
                    showSearch
                    options={dictBaseFwa?.area?.map((item) => ({
                      value: item.dictKey,
                      label: item.dictValue,
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="设备类型" name="deviceType">
                  <Select
                    placeholder="请选择"
                    allowClear
                    showSearch
                    options={dictBaseAll?.deviceType?.map((item) => ({
                      value: item.dictKey,
                      label: item.dictValue,
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Space size="small">
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SearchOutlined />}
                  >
                    查询
                  </Button>
                  <Button onClick={resetFormSearch} htmlType="button">
                    重置
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </div>
        <div className="table-wrapper">
          <div style={{ marginBottom: 16, textAlign: "right" }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                showModal("create");
              }}
            >
              创建产线
            </Button>
          </div>
          <Table
            columns={resizableColumns}
            rowKey={(record) => record.id}
            components={components}
            dataSource={data}
            loading={loading}
            scroll={{ x: tableWidth }}
            pagination={tableParams.pagination}
            onChange={handleTableChange}
            bordered
          />
        </div>
      </div>
      <Modal
        width={800}
        style={{
          top: 50,
        }}
        title="创建/编辑产线"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form
          labelCol={{ span: 5 }}
          style={{ padding: 15, maxHeight: "60vh", overflow: "scroll" }}
          form={formCreate}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="厂区"
                name="factoryId"
                rules={[{ required: true, message: "请选择厂区" }]}
              >
                <Select
                  placeholder="请选择"
                  allowClear
                  showSearch
                  options={dictBaseFwa?.factory?.map((item) => ({
                    value: item.dictKey,
                    label: item.dictValue,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="车间"
                name="workshopId"
                rules={[{ required: true, message: "请选择车间" }]}
              >
                <Select
                  placeholder="请选择"
                  allowClear
                  showSearch
                  options={dictBaseFwa?.workshop?.map((item) => ({
                    value: item.dictKey,
                    label: item.dictValue,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="产线"
                name="areName"
                rules={[{ required: true, message: "请输入产线名称" }]}
              >
                <Input allowClear placeholder="请输入" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="驱动"
                name="deviceType"
                rules={[{ required: true, message: "请选择设备驱动" }]}
              >
                <Select
                  placeholder="请选择"
                  showSearch
                  allowClear
                  options={dictBaseAll?.deviceType?.map((item) => ({
                    value: item.dictKey,
                    label: item.dictValue.toUpperCase(),
                  }))}
                  onChange={deviceTypeChange}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="路径" name="url">
                {/* <Input placeholder="请输入" /> */}
                <Space.Compact
                  style={{
                    width: "90%",
                  }}
                >
                  <Input placeholder="请输入" onChange={urlChange} />
                  <Button
                    type="primary"
                    onClick={() => {
                      readConfig();
                    }}
                  >
                    读入机器
                  </Button>
                </Space.Compact>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="有效"
                name="isValid"
                valuePropName="checked"
                labelCol={{ span: 6 }}
              >
                <Switch checkedChildren="有效" unCheckedChildren="无效" />
              </Form.Item>
            </Col>
            {/* <Col span={12}>
              <Form.Item label=" " colon={false}>
                <Radio.Group onChange={onChange} value={value}>
                  <Radio.Button value={1}>读入机器</Radio.Button>
                  <Radio.Button value={2}>添加机器</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col> */}
          </Row>

          {/* for start */}
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <Card
                    size="small"
                    title={`机器 ${key + 1}`}
                    key={key}
                    extra={
                      <CloseOutlined
                        onClick={() => {
                          handleDeleteItem(name, remove);
                        }}
                      />
                    }
                    style={{
                      marginBottom: 15,
                    }}
                  >
                    <Row gutter={24}>
                      <Col span={12}>
                        <Form.Item
                          label="名称"
                          name={[name, "deviceName"]}
                          labelCol={{ span: 6 }}
                          rules={[
                            { required: true, message: "请输入设备名称" },
                          ]}
                        >
                          <Input placeholder="请输入" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="驱动/工序"
                          name={[name, "deviceType"]}
                          labelCol={{ span: 6 }}
                          rules={[
                            { required: true, message: "请选择驱动/工序" },
                          ]}
                          initialValue={deviceType}
                        >
                          <Select
                            placeholder="请选择"
                            showSearch
                            allowClear
                            onFocus={(newValue) =>
                              handleDeviceTypeFocus(newValue, index)
                            }
                            options={deviceProcessData?.map((item) => ({
                              value: item.driveTypeOrProcess,
                              label: item.driveTypeOrProcess,
                            }))}
                            onChange={(value) => {
                              //更新dom
                              formCreate.setFieldsValue(
                                formCreate.getFieldsValue()
                              );
                            }}
                          />
                        </Form.Item>
                      </Col>
                      {/* {!deviceTypeList.includes(
                        formCreate.getFieldValue(["items", index, "deviceType"])
                      ) && ( */}
                        <Col span={12}>
                          <Form.Item
                            label="路径"
                            name={[name, "devicePath"]}
                            labelCol={{ span: 6 }}
                            rules={[
                              { required: false, message: "请输入设备路径" },
                            ]}
                            initialValue={url}
                          >
                            <Input placeholder="请输入" />
                          </Form.Item>
                        </Col>
                      {/* )} */}

                      <Col span={12}>
                        <Form.Item
                          label="工位"
                          name={[name, "workStation"]}
                          labelCol={{ span: 6 }}
                          rules={[{ required: true, message: "请输入工位" }]}
                        >
                          <Input placeholder="请输入" />
                        </Form.Item>
                      </Col>
                      {/* <Col span={12}>
                        <Form.Item
                          label="设备类型"
                          name={[name, "deviceTypeType"]}
                          labelCol={{ span: 6 }}
                          rules={[
                            { required: true, message: "请选择设备类型" },
                          ]}
                        >
                          <Select
                            placeholder="请选择"
                            showSearch
                            allowClear
                            onChange={(newValue) =>
                              handleDeviceTypeChange(newValue, index)
                            }
                            options={dictBaseAll?.deviceTypeType?.map(
                              (item) => ({
                                value: item.dictKey,
                                label: item.dictValue,
                              })
                            )}
                          />
                        </Form.Item>
                      </Col> */}
                      <Col span={12}>
                        <Form.Item
                          label="线体序号"
                          name={[name, "serial"]}
                          labelCol={{ span: 6 }}
                          rules={[
                            { required: true, message: "请输入线体序号" },
                          ]}
                          initialValue={key + 1}
                        >
                          <Input placeholder="请输入" />
                        </Form.Item>
                      </Col>
                      {/* 贴片序号只有选择的驱动对应的设备类型为贴片机是才显示
                      deviceProcessList.includes(formCreate.getFieldValue(["items", index, "deviceType"])) */}
                      {deviceProcessList.includes(
                        formCreate.getFieldValue(["items", index, "deviceType"])
                      ) && (
                        <Col span={12}>
                          <Form.Item
                            label="贴片序号"
                            name={[name, "orderNum"]}
                            labelCol={{ span: 6 }}
                            rules={[
                              { required: false, message: "请输入贴片序号" },
                            ]}
                            initialValue={key + 1}
                          >
                            <Input placeholder="请输入" />
                          </Form.Item>
                        </Col>
                      )}

                      <Col span={12}>
                        <Form.Item
                          label="设备编号"
                          name={[name, "deviceSn"]}
                          labelCol={{ span: 6 }}
                          rules={[
                            { required: false, message: "请输入设备编号" },
                          ]}
                        >
                          <Input placeholder="请输入" />
                        </Form.Item>
                      </Col>

                      <Col span={6}>
                        <Form.Item label="报警" labelCol={{ span: 8 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "baseline",
                              height: "31px",
                            }}
                          >
                            <Form.Item
                              // label="报警号"
                              name={[name, "alarmPort"]}
                              labelCol={{ span: 7 }}
                              initialValue={"8"}
                            >
                              <Input placeholder="请输入" />
                            </Form.Item>
                            <Form.Item
                              // label="报警号 轨道2"
                              name={[name, "alarmPort2"]}
                              labelCol={{ span: 8 }}
                              initialValue={"8"}
                            >
                              <Input placeholder="轨道2" />
                            </Form.Item>
                          </div>
                        </Form.Item>
                      </Col>

                      <Col span={6}>
                        <Form.Item label="停机端口" labelCol={{ span: 10 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "baseline",
                              height: "31px",
                            }}
                          >
                            <Form.Item
                              // label="停机端口"
                              name={[name, "stopPort"]}
                              labelCol={{ span: 6 }}
                              initialValue={"2"}
                            >
                              <Input placeholder="请输入" />
                            </Form.Item>
                            <Form.Item
                              // label="停机端口 轨道2"
                              name={[name, "stopPort2"]}
                              labelCol={{ span: 8 }}
                              initialValue={"3"}
                            >
                              <Input placeholder="轨道2" />
                            </Form.Item>
                          </div>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <div style={{ textAlign: "center" }}>
                  <Button
                    onClick={() => {
                      const fieldsValue = formCreate.getFieldsValue();
                      if (!fieldsValue.factoryId) {
                        message.error("请选择厂区！");
                        return;
                      } else if (!fieldsValue.workshopId) {
                        message.error("请选择车间！");
                        return;
                      } else if (!fieldsValue.areName) {
                        message.error("请输入产线名称！");
                        return;
                      } else if (!fieldsValue.deviceType) {
                        message.error("请选择设备驱动！");
                        return;
                      }
                      add();
                      setTimeout(() => {
                        //更新dom
                        formCreate.setFieldsValue(formCreate.getFieldsValue());
                      });
                    }}
                    type="dashed"
                    icon={<PlusOutlined />}
                  >
                    加一台机器
                  </Button>
                </div>
              </>
            )}
          </Form.List>
          {/* for end */}
        </Form>
      </Modal>
    </div>
  );
};

export default App;
