import React, { useState, useMemo, useRef, useEffect, useContext } from "react";
import {
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
      title: "规则ID",
      dataIndex: "id",
      // sorter: true,
      key: "id",
    },
    {
      title: "规则代码",
      dataIndex: "ruleCode",
      // sorter: true,
      key: "ruleCode",
    },
    {
      title: "规则描述",
      dataIndex: "ruleDescription",
      key: "ruleDescription",
    },
    {
      title: "规则类型",
      dataIndex: "ruleType",
      key: "ruleType",
    },
    {
      title: "规则长度",
      dataIndex: "ruleLength",
      key: "ruleLength",
    },
    {
      title: "创建日期",
      dataIndex: "createTime",
      key: "createTime",
      // sorter: true,
      render: (_, record) => {
        return dayjs(_).format("YYYY-MM-DD HH:mm:ss");
      },
    },
    {
      title: "创建人",
      dataIndex: "createBy",
      key: "createBy",
    },
    {
      title: "修改日期",
      dataIndex: "updateTime",
      key: "updateTime",
      // sorter: true,
      render: (_, record) => {
        return _ ? dayjs(_).format("YYYY-MM-DD HH:mm:ss") : "";
      },
    },
    {
      title: "修改人",
      dataIndex: "updateBy",
      key: "updateBy",
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
            <Typography.Link onClick={() => onChangeCopy(record)}>复制</Typography.Link>
          </Space>
        );
      },
    },
  ];
  const onChangeCopy = (record) => {
    http
      .post(config.API_PREFIX + 'barcodegenrule/copy' + `/${record.id}`, {})
      .then((res) => {
        fetchData();
        message.success('复制成功！');
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const del = (record) => {
    confirm({
      title: "删除确认",
      icon: <ExclamationCircleFilled />,
      content: "删除后无法恢复，请确认是否删除！",
      onOk() {
        console.log("OK");
        http
          .del(config.API_PREFIX + api.barcodegenrule + `/${record?.id}`, {})
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
  const [barcodeGenRulelist, setBarcodeGenRulelist] = useState([]);
  const showModal = (action, record) => {
    setActiveKey("1");
    formCreate.resetFields();
    formCreate.setFieldsValue({
      items: [],
    });
    if (action === "update" && record) {
      // factoryId, workshopId, areaId,
      const {
        id,
        ruleCode,
        ruleDescription,
        ruleType,
        ruleLength,
        barcodeGenRuleDetails,
      } = record;
      activeId = id;
      console.log("barcodeGenRuleDetails", barcodeGenRuleDetails);
      setBarcodeGenRulelist(barcodeGenRuleDetails); //tabs不切换拿不到数据
      formCreate.setFieldsValue({
        // factoryId: factoryId.toString(), workshopId: workshopId.toString(), areaId: areaId.toString(),
        ruleCode,
        ruleDescription,
        ruleType,
        ruleLength,
        items: barcodeGenRuleDetails,
      });
    } else {
      activeId = -1;
      formCreate.resetFields();
      setBarcodeGenRulelist([]);
    }
    setIsModalOpen(true);
  };

  const handleOk = () => {
    formCreate
      .validateFields()
      .then((values) => {
        console.log("values", values);

        setLoadingOk(true);
        // wtf factoryId, workshopId, areaId,  , items   items不切换tabs拿不到数据items
        const { ruleCode, ruleDescription, ruleType, items } = values;
        console.log("items", items);
        let barcodeGenRuleDetailsNew = [];
        if (items) {
          barcodeGenRuleDetailsNew = items.map((item) => {
            return {
              ...item,
              // factoryId,
              // workshopId,
              // areaId,
            };
          });
        } else {
          barcodeGenRuleDetailsNew = barcodeGenRulelist.map((item) => {
            return {
              ...item,
              // factoryId,
              // workshopId,
              // areaId,
            };
          });
        }
        
        // factoryId, workshopId, areaId,
        let params = {
          ruleCode,
          ruleDescription,
          ruleType,
          barcodeGenRuleDetails: barcodeGenRuleDetailsNew,
        };
        let action = null;
        let msg = "";
        let apiUrl = "";
        console.log("activeId", activeId);
        if (activeId !== -1) {
          action = http.put;
          // apiUrl = `${config.API_PREFIX}${api.printTemplate}/${activeId}`
          apiUrl = `${config.API_PREFIX}${api.barcodegenrule}`;
          params.id = activeId;
          msg = "修改成功！";
        } else {
          action = http.post;
          apiUrl = `${config.API_PREFIX}${api.barcodegenrule}`;
          msg = "新增成功！";
        }
        action(apiUrl, params)
          .then((res) => {
            formCreate.resetFields();
            setLoadingOk(false);
            setIsModalOpen(false);
            fetchData();
            message.success(msg);
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

    const { ruleCode, ruleDescription, ruleType } = formSearch.getFieldsValue();
    if (ruleCode) {
      params.ruleCode = ruleCode;
    }
    if (ruleDescription) {
      params.ruleDescription = ruleDescription;
    }
    if (ruleType) {
      params.ruleType = ruleType;
    }

    http
      .get(config.API_PREFIX + api.barcodegenrulePage, params)
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

  const handleDeleteItem = (index, remove) => {
    remove(index);
  };
  const items = [
    {
      key: "1",
      label: "生成规则",
      children: (
        <>
          {/* <Form
          labelCol={{ span: 2 }}
          form={formCreate}
          style={{ padding: 16, maxHeight: '60vh', overflow: 'scroll' }}
        > */}
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
            label="规则代码"
            name="ruleCode"
            rules={[
              {
                required: true,
                message: "请输入",
              },
            ]}
          >
            <Input allowClear placeholder="请输入" />
          </Form.Item>

          <Form.Item
            label="规则描述"
            name="ruleDescription"
            rules={[
              {
                required: true,
                message: "请输入",
              },
            ]}
          >
            <Input allowClear placeholder="请输入" />
          </Form.Item>

          <Form.Item
            label="规则类型"
            name="ruleType"
            rules={[
              {
                required: true,
                message: "请输入",
              },
            ]}
          >
            <Select
              placeholder="请选择"
              allowClear
              options={dictBaseAll?.genRuleType?.map((item) => ({
                value: item.dictKey,
                label: item.dictValue,
              }))}
            />
          </Form.Item>

          {/* <Form.Item
            label="规则长度"
            name="ruleLength"
            rules={[
              {
                required: true,
                message: '请输入',
              },
            ]}
          >
            <Input allowClear placeholder="请输入" />
          </Form.Item> */}
          {/* </Form> */}
        </>
      ),
    },
    {
      key: "2",
      label: "生成规则明细",
      children: (
        <>
          {/* <Form
          labelCol={{ span: 5 }}
          style={{ padding: 15, maxHeight: '60vh', overflow: 'scroll' }}
          form={formCreate}
        > */}
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <table className="myTable">
                <thead>
                  <tr>
                    <th style={{ width: "10%" }}>序号</th>
                    <th style={{ width: "15%" }}>长度</th>
                    <th style={{ width: "15%" }}>数据类型</th>
                    <th style={{ width: "15%" }}>规则描述</th>
                    <th style={{ width: "15%" }}>规格</th>
                    <th style={{ width: "15%" }}>备注</th>
                    <th style={{ width: "10%", textAlign: "center" }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <tr key={key}>
                      <td>
                        <Form.Item
                          name={[name, "num"]}
                          rules={[{ required: true, message: "请输入序号" }]}
                          initialValue={key + 1}
                        >
                          <Input disabled placeholder="序号" />
                        </Form.Item>
                      </td>
                      <td>
                        <Form.Item
                          name={[name, "ruleDetailLength"]}
                          rules={[{ required: true, message: "请输入长度" }]}
                        >
                          <Input placeholder="长度" />
                        </Form.Item>
                      </td>
                      <td>
                        <Form.Item
                          name={[name, "dataType"]}
                          rules={[{ required: true, message: "请输入长度" }]}
                        >
                          <Select
                            placeholder="请选择"
                            allowClear
                            options={dictBaseAll?.genRuleDetailRule?.map(
                              (item) => ({
                                value: item.dictKey,
                                label: item.dictValue,
                              })
                            )}
                          />
                        </Form.Item>
                      </td>
                      <td>
                        <Form.Item
                          name={[name, "ruleDetailDescription"]}
                          rules={[
                            { required: true, message: "请输入规则描述" },
                          ]}
                        >
                          <Input placeholder="规则描述" />
                        </Form.Item>
                      </td>
                      <td>
                        <Form.Item
                          name={[name, "rule"]}
                          rules={[{ required: true, message: "请输入规则" }]}
                        >
                          <Input placeholder="规则" />
                        </Form.Item>
                      </td>
                      <td>
                        <Form.Item
                          name={[name, "remark"]}
                          rules={[{ required: true, message: "请输入备注" }]}
                        >
                          <Input placeholder="备注" />
                        </Form.Item>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <Space>
                          <Typography.Link
                            onClick={() => {
                              handleDeleteItem(name, remove);
                            }}
                            style={{
                              wordBreak: "break-word",
                              whiteSpace: "nowrap",
                            }}
                          >
                            删除
                          </Typography.Link>
                        </Space>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center" }}>
                      <Button
                        onClick={() => {
                          add();
                        }}
                        type="dashed"
                        icon={<PlusOutlined />}
                      >
                        添加规则明细
                      </Button>
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </Form.List>
          {/* </Form> */}
        </>
      ),
    },
  ];
  return (
    <div className="content-wrapper">
      <Breadcrumb
        className="breadcrumb"
        items={[
          {
            title: "条码规则",
          },
          {
            title: "生成规则",
          },
        ]}
      ></Breadcrumb>
      <div className="content">
        <div className="search-wrapper">
          <Form form={formSearch} onFinish={onFinish}>
            <Row gutter="24">
              <Col span={8}>
                <Form.Item label="规则代码" name="ruleCode">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="规则描述" name="ruleDescription">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="规则类型" name="ruleType">
                  <Input allowClear placeholder="请输入" />
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
              新增生成规则
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
        title="新增/修改生成规则"
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
          <Tabs
            activeKey={activeKey}
            items={items}
            onChange={onChange}
            destroyInactiveTabPane={false}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default App;
