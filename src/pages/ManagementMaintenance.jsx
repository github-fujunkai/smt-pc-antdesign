import React, { useState, useMemo, useRef, useEffect, useContext } from "react";
import {
  DatePicker,
  Tooltip,
  Switch,
  Popconfirm,
  Tabs,
  Typography,
  Image,
  Tag,
  Butotn,
  Table,
  Modal,
  Breadcrumb,
  Form,
  Row,
  Col,
  Select,
  Input,
  InputNumber,
  Space,
  Button,
  message,
} from "antd";
import {
  ExclamationCircleFilled,
  LoadingOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import http from "../utils/http";
import { config } from "../utils/config";
import api from "../utils/api";
import  dayjs from "dayjs";
const { TextArea } = Input;

const { confirm } = Modal;
let activeId = -1;

const App = () => {
  const [isShowSearch, setIsShowSearch] = useState(false); 
  const onSearchChange = (checked) => {
    console.log(`switch to ${checked}`);
    setIsShowSearch(checked);
  };
  const workStationRef = useRef(null);
  const panelCodeRef = useRef(null);
  const repairActionsRef = useRef(null);
  const handlePressEnter = (panelCode) => {
    // console.log('panelCode', formCreate.getFieldValue('panelCode'))
    // 这里是处理回车事件的代码
    setTimeout(() => {
      repairActionsRef.current.focus();
    }, 500);
    // 根据产品条码查工单号
    http
      .get(
        config.API_PREFIX +
          api.productNoGetWorkOrderNumber +
          "?panelCode=" +
          formCreate.getFieldValue("panelCode"),
        {}
      )
      .then((res) => {
        formCreate.setFieldValue("workOrderNumber", res?.bizData);
      })
      .catch((err) => {
        console.log(err);
      });
    // setSelectedRowKeys([]);

    // 不良信息列表 新增的时候扫描了才显示
    http
    .get(config.API_PREFIX + api.prodRepairDefectList+ '?panelCode=' + formCreate.getFieldValue('panelCode'), {})
    .then((res) => {
      setData2(
        res?.bizData?.map((item) => ({
          ...item,
          key: item.id,
        })) || []
      );
    })
    .catch((err) => {
      console.log(err);
    });
  };
  const saveWorkStationStorage = (e) => {
    // 保存工位信息
    // console.log('workStation',formCreate.getFieldValue("workStation"))
    if (
      formCreate.getFieldValue("workStation") &&
      formCreate.getFieldValue("workStation") != ""
    ) {
      localStorage.setItem(
        "workStation",
        formCreate.getFieldValue("workStation")
      );
    }
  };

  const columns2 = [
    {
      title: "不良代码",
      key: "defectCode",
      dataIndex: "defectCode",
    },
    {
      title: "不良名称",
      key: "defectName",
      dataIndex: "defectName",
    },
    {
      title: "不良位置",
      key: "locationName",
      dataIndex: "locationName",
    },
    {
      title: "其它信息",
      key: "otherInfo",
      dataIndex: "otherInfo",
    },
  ];
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const onSelectChange = (newSelectedRowKeys) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const [dictBaseFwa, setDictBaseFwa] = useState({});
  const getDictBaseFwa = () => {
    http
      .post(config.API_PREFIX + api.dictBaseFwa, {})
      .then((res) => {
        console.log("dict111", res);
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

  useEffect(() => {
    getDictBaseFwa();
    getDictBaseAll();
    areaLinePage();
  }, []);

  const onFinish = (values) => {
    console.log("search values", values);
    if (tableParams.pagination?.current !== 1) {
      setTableParams(paginationInit);
    } else {
      fetchData();
    }
  };
  const resetFormSearch = () => {
    formSearch.resetFields();
    if (tableParams.pagination?.current !== 1) {
      setTableParams(paginationInit);
    } else {
      fetchData();
    }
  };
  const [loadingOk, setLoadingOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formCreate] = Form.useForm();
  const [formSearch] = Form.useForm();
  const [data, setData] = useState([]);

  const columns = [
    {
      title: "维修ID",
      dataIndex: "id",
      // sorter: true,
      key: "id",
    },
    {
      title: "工位",
      dataIndex: "workStation",
      // sorter: true,
      key: "workStation",
    },
    {
      title: "产品条码",
      dataIndex: "panelCode",
      key: "panelCode",
    },
    {
      title: "工单号",
      dataIndex: "workOrderNumber",
      key: "workOrderNumber",
    },
    {
      title: "产品料号",
      dataIndex: "productItemCode",
      key: "productItemCode",
    },
    {
      title: "维修人",
      dataIndex: "repairer",
      key: "repairer",
    },
    {
      title: "维修时间",
      dataIndex: "createTime",
      key: "createTime",
      // sorter: true,
      render: (_, record) => {
        return dayjs(_).format("YYYY-MM-DD HH:mm:ss");
      },
    },
    {
      title: "大板条码",
      dataIndex: "wtf2",
      key: "wtf2",
    },
    {
      title: "拼板号",
      dataIndex: "wtf3",
      key: "wtf3",
    },
    {
      title: "维修内容",
      dataIndex: "repairActions",
      key: "repairActions",
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
            <Typography.Link disabled onClick={() => del(record)}>
              删除
            </Typography.Link>
          </Space>
        );
      },
    },
  ];

  const del = (record) => {
    confirm({
      title: "删除确认",
      icon: <ExclamationCircleFilled />,
      content: "删除后无法恢复，请确认是否删除！",
      onOk() {
        console.log("OK");
        http
          .del(config.API_PREFIX + api.prodRepair + `/${record?.id}`, {})
          .then((res) => {
            fetchData();
            message.success("删除成功！");
          })
          .catch((err) => {
            console.log(err);
          });
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data2, setData2] = useState([]);

  const showModal = (action, record) => {
    console.log("record", record);
    setActiveKey("1");
    formCreate.resetFields();
    setSelectedRowKeys([]);

    setIsModalOpen(true);
    
    if (action === "update" && record) {
      const { id, workStation, workOrderNumber, panelCode, repairActions } =
        record;
      activeId = id;
      formCreate.setFieldsValue({
        workStation,
        workOrderNumber,
        panelCode,
        repairActions,
      });
      // 不良信息列表，放到编辑中增加了产品条码查询条件
      http
        .get(config.API_PREFIX + api.prodRepairDefectList+ '?panelCode='+panelCode, {})
        .then((res) => {
          setData2(
            res?.bizData?.map((item) => ({
              ...item,
              key: item.id,
            })) || []
          );
        })
        .then(() => {
          setSelectedRowKeys(record?.defects.map((item) => item.testDefectId));
        })
        .catch((err) => {
          console.log(err);
        });


    } else {
      activeId = -1;
      formCreate.resetFields();
      if (localStorage.getItem("workStation")) {
        formCreate.setFieldValue(
          "workStation",
          localStorage.getItem("workStation")
        );
      }
    }
    // 使用setTimeout确保在Modal渲染后执行
    setTimeout(() => {
      if (workStationRef.current) {
        if (
          !formCreate.getFieldValue("workStation") ||
          formCreate.getFieldValue("workStation") == ""
        ) {
          workStationRef.current.focus();
        } else {
          panelCodeRef.current.focus();
        }
      }
    }, 500);
  };

  const handleOk = () => {
    formCreate
      .validateFields()
      .then((values) => {
        console.log("values", values);
        setLoadingOk(true);
        // wtf
        const {
          /*factoryId, workshopId, areaId,*/ workStation,
          workOrderNumber,
          panelCode,
          repairActions,
        } = values;

        let params = {
          /*factoryId, workshopId, areaId,*/ workStation,
          workOrderNumber,
          panelCode,
          repairActions,
          repairDefects: selectedRowKeys?.map((item) => ({
            testDefectId: item,
          })),
        };
        let action = null;
        let msg = "";
        let apiUrl = "";
        console.log("activeId", activeId);
        if (activeId !== -1) {
          action = http.put;
          // apiUrl = `${config.API_PREFIX}${api.printTemplate}/${activeId}`
          apiUrl = `${config.API_PREFIX}${api.prodRepair}`;
          params.id = activeId;
          msg = "修改成功！";
        } else {
          action = http.post;
          apiUrl = `${config.API_PREFIX}${api.prodRepair}`;
          msg = "新增成功！";
        }
        action(apiUrl, params)
          .then((res) => {
            setLoadingOk(false);
            fetchData();
            message.success(msg);
            // 新增保存之后此界面不关闭，保留工位信息，清空产品条码、维修内容、不良原因，光标自动定位到产品条码进行下一个循环操作
            if (activeId == -1) {
              formCreate.resetFields();
              formCreate.setFieldsValue({ workStation: params.workStation });
              panelCodeRef.current.focus();
            } else {
              formCreate.resetFields();
              setIsModalOpen(false);
            }
          })
          .catch((err) => {
            setLoadingOk(false);
            console.log(err);
          });
      })
      .catch((error) => {
        console.log("Form validation error:", error);
      });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  // const { confirm } = Modal;

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

  const [tableParams, setTableParams] = useState({ ...paginationInit });

  /*
  useEffect(() => {
    fetchData();
    console.log('JSON.stringify(tableParams)]', JSON.stringify(tableParams))
    // fixme 只是 total 变了而已，fetchData xhr 回调又执行了一次 xhr
    // {"pagination":{"current":1,"pageSize":10,"showQuickJumper":true,"showSizeChanger":true}}
    // {"pagination":{"current":1,"pageSize":10,"showQuickJumper":true,"showSizeChanger":true,"total":14}}
  }, [JSON.stringify(tableParams)]);
  */
  useEffect(() => {
    fetchData();
    console.log("JSON.stringify(tableParams)]", JSON.stringify(tableParams));
  }, [
    tableParams.pagination?.current,
    tableParams.pagination?.pageSize,
    tableParams?.columnKey,
    tableParams?.order,
  ]);

  const [tplVariable, setTplVariable] = useState(false);
  const [tpls, setTpls] = useState([]);
  useEffect(() => {
    http
      .get(config.API_PREFIX + api.printTemplateVariable, {})
      .then((res) => {
        console.log("res", res);
        const data = res?.bizData;
        console.log("printTemplateVariable", data);
        setTplVariable(data);
      })
      .catch((err) => {
        console.log(err);
      });

    http
      .get(config.API_PREFIX + api.printTemplatePage, {
        current: 0,
        size: 1000,
      })
      .then((res) => {
        console.log("res", res);
        setTpls(res?.bizData?.records || []);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const fetchData = () => {
    setLoading(true);
    const {
      order,
      field,
      pagination: { current, pageSize },
    } = tableParams;

    // sequelize 举例
    // order: [[ 'created_at', 'desc' ], [ 'categoryId', 'desc' ]],
    console.log("order, field", order, field);

    // 多个传参举例-hzry
    // GET /api/resource?sort=created_at:desc,categoryId:asc

    let params = {
      current,
      size: pageSize,
    };
    // params['orders[0].column'] = 'id'
    // params['orders[0].asc'] = false
    if (field && order) {
      // params.sort = `${field}:${order}`  // hzry
      // 举例：lxy
      // orders[0].column: id
      // orders[0].asc: true
      params["orders[0].column"] = field;
      params["orders[0].asc"] = order === "ascend" ? true : false;
    }

    const {
      workStation,
      panelCode,
      workOrderNumber,
      repairer,
      wtf2,
      repairTimeStart,
      repairTimeEnd,
      productItemCode,
    } = formSearch.getFieldsValue();
    if (workStation) {
      params.workStation = workStation;
    }
    if (panelCode) {
      params.panelCode = panelCode;
    }
    if (workOrderNumber) {
      params.workOrderNumber = workOrderNumber;
    }
    if (repairer) {
      params.repairer = repairer;
    }
    if (wtf2) {
      params.wtf2 = wtf2;
    }
    if (productItemCode) {
      params.productItemCode = productItemCode;
    }
    if (repairTimeStart) {
      params.repairTimeStart =
        repairTimeStart.format("YYYY-MM-DD") + " 00:00:00";
    }
    if (repairTimeEnd) {
      params.repairTimeEnd = repairTimeEnd.format("YYYY-MM-DD" + " 23:59:59");
    }

    http
      .get(config.API_PREFIX + api.prodRepairPage, params)
      .then((res) => {
        console.log("res", res);
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
    console.log("handleTableChange: ", pagination, filters, sorter);
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });
    console.log("tableParams1", tableParams);

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData([]);
    }
  };

  const [loadingUpload, setLoadingUpload] = useState(false);
  const [imageUrl, setImageUrl] = useState();

  const myDesign = () => {
    let LODOP = window.getLodop();
    if (LODOP.CVERSION) {
      window.CLODOP.On_Return = function (TaskID, Value) {
        // document.getElementById('S1').value = Value;
        console.log("Value", Value);
        formCreate.setFieldValue("content", Value);
      };
    }
    // document.getElementById('S1').value = LODOP.PRINT_DESIGN();
    let tplContent = formCreate.getFieldValue("content");
    if (tplContent) {
      eval(tplContent);
    }
    const value = LODOP.PRINT_DESIGN();
    console.log("value", value);
  };

  const [activeKey, setActiveKey] = useState("1");
  const onChange = (key) => {
    // console.log(key);
    setActiveKey(key);
  };

  return (
    <div className="content-wrapper">
      <Breadcrumb
        className="breadcrumb"
        items={[
          {
            title: "生产管理",
          },
          {
            title: "维修",
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
                <Form.Item label="工位" name="workStation">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="产品条码" name="panelCode">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="工单号" name="workOrderNumber">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="产品料号" name="productItemCode">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="维修人" name="repairer">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              {/* <Col span={8}>
                <Form.Item label="维修明细？" name="wtf2">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col> */}
              <Col span={8}>
                <Form.Item label="维修日期（开始）" name="repairTimeStart">
                  <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="维修日期（结束）" name="repairTimeEnd">
                  <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
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
              新增维修信息
            </Button>
          </div>
          <Table
            columns={columns}
            rowKey={(record) => record.id}
            dataSource={data}
            pagination={tableParams.pagination}
            onChange={handleTableChange}
            loading={loading}
            bordered
          />
        </div>
      </div>
      <Modal
        title="新增/修改维修信息"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loadingOk}
        okButtonProps={{
          disabled: loadingUpload,
        }}
        width={1000}
      >
        <Form
          labelCol={{ span: 3 }}
          style={{ padding: 15, maxHeight: "60vh", overflow: "scroll" }}
          form={formCreate}
        >
          {/* <Form.Item
            label="厂区"
            name="factoryId"
            rules={[{ required: true, message: '请选择厂区' }]}
          >
            <Select
              placeholder="请选择"
              allowClear
              showSearch
              options={dictBaseFwa?.factory?.map(item => ({
                value: item.dictKey,
                label: item.dictValue,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="车间"
            name="workshopId"
            rules={[{ required: true, message: '请选择车间' }]}
          >
            <Select
              placeholder="请选择"
              allowClear
              showSearch
              options={dictBaseFwa?.workshop?.map(item => ({
                value: item.dictKey,
                label: item.dictValue,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="产线"
            name="areaId"
            rules={[{ required: true, message: '请选择产线' }]}
          >
            <Select
              placeholder="请选择"
              allowClear
              showSearch
              options={dictBaseFwa?.area?.map(item => ({
                value: item.dictKey,
                label: item.dictValue,
              }))}
            />
          </Form.Item> */}
          <Form.Item
            label="工位"
            name="workStation"
            rules={[
              {
                required: true,
                message: "请输入",
              },
            ]}
          >
            <Input
              ref={workStationRef}
              onBlur={saveWorkStationStorage}
              allowClear
              placeholder="请输入"
            />
          </Form.Item>

          <Form.Item
            label="工单号"
            name="workOrderNumber"
            rules={[
              {
                required: false,
                message: "请输入",
              },
            ]}
          >
            <Input disabled allowClear placeholder="请输入" />
          </Form.Item>

          <Form.Item
            label="产品条码"
            name="panelCode"
            rules={[
              {
                required: true,
                message: "请输入",
              },
            ]}
          >
            <Input
              ref={panelCodeRef}
              onPressEnter={handlePressEnter}
              allowClear
              placeholder="请输入"
            />
          </Form.Item>

          <Form.Item
            label="维修内容"
            name="repairActions"
            rules={[
              {
                required: true,
                message: "请输入",
              },
            ]}
          >
            <TextArea ref={repairActionsRef} allowClear placeholder="请输入" />
          </Form.Item>

          <Form.Item
            label="不良原因"
            rules={[
              {
                required: false,
                message: "请输入",
              },
            ]}
          >
            <Table
              size="small"
              pagination={false}
              rowSelection={rowSelection}
              columns={columns2}
              dataSource={data2}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default App;
