import React, { useState, useMemo, useEffect,useRef } from "react";
import {
  DatePicker,
  Typography,
  Tooltip,
  Switch,
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
let activeId1 = -1;

const App = () => {
  /*
  const paginationInit = {
    pagination: {
      current: 1,
      pageSize: 10,
      showQuickJumper: true,
      showTotal,
      showSizeChanger: true,
    },
  }

  useEffect(() => {
    fetchData();
    console.log('JSON.stringify(tableParams)]', JSON.stringify(tableParams))
  }, [
    tableParams.pagination?.current,
    tableParams.pagination?.pageSize,
    tableParams?.columnKey,
    tableParams?.order,
  ]);
  */
  const [isShowSearch, setIsShowSearch] = useState(false);
  const onSearchChange = (checked) => {
    console.log(`switch to ${checked}`);
    setIsShowSearch(checked);
  };

  function addDaysToDate(startDate, daysToAdd) {
    // 创建一个新的Date对象，确保它是基于给定的startDate
    let endDate = new Date(startDate);

    // 使用setDate方法来添加天数
    // 注意：setDate方法设置的是一个月中的某一天（1-31），因此我们需要先获取当前日期的天数，然后加上要添加的天数
    endDate.setDate(endDate.getDate() + daysToAdd);

    // 返回新的日期
    return formatDate(endDate);
  }
  // 格式化日期输出（可选）
  function formatDate(date) {
    let year = date.getFullYear();
    let month = (1 + date.getMonth()).toString().padStart(2, "0"); // 月份从0开始，所以需要+1
    let day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  // 处理生产日期的变化获取结束日期
  const handleProductionDateChange = () => {
    // 处理生产日期的逻辑
    try {
      let data1 = formCreate1.getFieldValue("productionDate");
      data1 = new Date(data1.format("YYYY-MM-DD"));
      let data2 = formCreate1.getFieldValue("shelfLife");
      if (data1 && data2) {
        let endDate = addDaysToDate(data1, Number(data2));
        formCreate1.setFieldValue("expirationDate", dayjs(endDate));
        console.log(dayjs(endDate));
      }
    } catch (error) {}
  };
  const QTYRef = useRef(null);
  const [nowData, setNowData] = useState({});
  const [supplierlList, setSupplierlList] = useState([]);
  // 扫描录入料号或者供应商料号去之前维护的物料基础信息里面进行筛选
  const fetchData2 = () => {
    let itemCode = formCreate1.getFieldValue("itemCode");
    let supplierItemCode = formCreate1.getFieldValue("supplierItemCode");
    http
      .get(config.API_PREFIX + api.basicItemBaseInfoPage, {
        pageSize: 1000,
        pageNum: 1,
        itemCode: itemCode,
        supplierItemCode: supplierItemCode,
      })
      .then((res) => {
        // console.log("res", res);
        const data = res?.bizData;
        setSupplierlList(data?.records);
        if (data.total == 1) {
          // console.log('data?.records[0].supplier',data?.records[0].supplier)
          let item = data?.records[0];
          setNowData(item);
          formCreate1.setFieldsValue({
            itemCode: item.itemCode,
            supplierItemCode: item.supplierItemCode,
            supplier: item.supplier,
            packageQty: item.packageQty,
            msl: item.msl,
            shelfLife: item.shelfLife,
          });
         
          handleProductionDateChange();
        }
        setTimeout(() => {
          QTYRef.current.focus();
        }, 500);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  //选择供应商填充数据
  const fillInOtherFields = (record) => {
    console.log("record", record);
    supplierlList.forEach((item) => {
      console.log("item.itemCode", item.itemCode);
      if (item.supplier == record) {
        console.log("item.itemCode", item.itemCode);
        formCreate1.setFieldsValue({
          itemCode: item.itemCode,
          supplierItemCode: item.supplierItemCode,
          supplier: item.supplier,
          packageQty: item.packageQty,
          msl: item.msl,
          shelfLife: item.shelfLife,
        });
      }
    });
  };

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
  const [loadingOk1, setLoadingOk1] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formCreate] = Form.useForm();
  const [formCreate1] = Form.useForm();
  const [formSearch] = Form.useForm();
  const [data, setData] = useState([]);

  const columns = [
    {
      title: "入库单ID",
      dataIndex: "id",
      // sorter: true,
      key: "id",
    },
    {
      title: "入库单",
      dataIndex: "orderNumber",
      key: "orderNumber",
    },
    {
      title: "供应商",
      dataIndex: "supplier",
      key: "supplier",
    },
    {
      title: "采购单号",
      dataIndex: "poNumber",
      key: "poNumber",
    },
    {
      title: "送货单号",
      dataIndex: "deliveryNumber",
      key: "deliveryNumber",
    },
    {
      title: "来料数量",
      dataIndex: "deliveryQty",
      key: "deliveryQty",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "送货人",
      dataIndex: "deliveryPerson",
      key: "deliveryPerson",
    },
    {
      title: "收料人",
      dataIndex: "receiver",
      key: "receiver",
    },
    {
      title: "备注",
      dataIndex: "remark",
      key: "remark",
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
      // sorter: true,
      render: (_, record) => {
        return dayjs(_).format("YYYY-MM-DD HH:mm:ss");
      },
    },
    {
      title: "修改时间",
      dataIndex: "updateTime",
      key: "updateTime",
      // sorter: true,
      render: (_, record) => {
        return _ ? dayjs(_).format("YYYY-MM-DD HH:mm:ss") : "";
      },
    },
    {
      title: "操作",
      dataIndex: "operation",
      render: (_, record) => {
        return (
          <Space>
            <Typography.Link onClick={() => showModal1(record)}>
              物料UID打印
            </Typography.Link>
            <Typography.Link onClick={() => showModal("update", record)}>
              修改
            </Typography.Link>
            <Typography.Link onClick={() => del(record)}>删除</Typography.Link>
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
          .del(config.API_PREFIX + api.wmsItemStockIn + `/${record?.id}`, {})
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
  const [isModalOpen1, setIsModalOpen1] = useState(false);

  const showModal = (action, record) => {
    if (action === "update" && record) {
      const {
        id,
        orderNumber,
        supplier,
        poNumber,
        deliveryNumber,
        deliveryQty,
        deliveryPerson,
        receiver,
        remark,
      } = record;
      activeId = id;
      formCreate.setFieldsValue({
        id,
        orderNumber,
        supplier,
        poNumber,
        deliveryNumber,
        deliveryQty,
        deliveryPerson,
        receiver,
        remark,
      });
      setType(type);
    } else {
      activeId = -1;
      formCreate.resetFields();
      setType("");
    }
    setIsModalOpen(true);
  };

  const showModal1 = (record) => {
    if (record) {
      activeId1 = record.id;
      formCreate1.setFieldsValue({ GenerateQty: 1 });
      formCreate1.setFieldsValue({ productionDate: dayjs() });
      setIsModalOpen1(true);
    }
  };

  const handleOk = () => {
    formCreate
      .validateFields()
      .then((values) => {
        console.log("values", values);

        setLoadingOk(true);
        const {
          orderNumber,
          supplier,
          poNumber,
          deliveryNumber,
          deliveryQty,
          deliveryPerson,
          receiver,
          remark,
        } = values;
        let params = {
          orderNumber,
          supplier,
          poNumber,
          deliveryNumber,
          deliveryQty,
          deliveryPerson,
          receiver,
          remark,
        };
        let action = null;
        let msg = "";
        let apiUrl = "";
        console.log("activeId", activeId);
        if (activeId !== -1) {
          action = http.put;
          // apiUrl = `${config.API_PREFIX}${api.printTemplate}/${activeId}`
          apiUrl = `${config.API_PREFIX}${api.wmsItemStockIn}`;
          params.id = activeId;
          msg = "修改成功！";
        } else {
          action = http.post;
          apiUrl = `${config.API_PREFIX}${api.wmsItemStockIn}`;
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
  const getPrintData = async (uniqueCode, params) => {
    return new Promise((resove, reject) => {
      http
      .post(`${config.API_PREFIX}${api.printTemplatePrintData}`, {
        templateId: nowData.labelTemplateId,
        // barcode: res?.bizData[0],
        barcode: uniqueCode,
        itemCode: params.itemCode,
        supplierItemCode: params.supplierItemCode,
        msl: params.msl,
        qty: params.qty,
        productionDate: params.productionDate,
        expirationDate: params.expirationDate,
        lotNo: params.lotNo,
        dateCode: params.dateCode,
        // workStation: "",
        // workOrderNumber: "",
        // productCode: "",
        // orderNumber: "",
        // packagingLevel: 0,
      })
      .then((res1) => {
        resove(res1)
      }).catch((err) => {
        setLoadingOk1(false);
        console.log(err);
        reject(err)
      });;
    })
  }
  const handleOk1 = () => {
    formCreate1
      .validateFields()
      .then((values) => {
        console.log("values", values);
        values.productionDate = dayjs(values.productionDate).format(
          "YYYY-MM-DD HH:mm:ss"
        );
        values.expirationDate = dayjs(values.expirationDate).format(
          "YYYY-MM-DD HH:mm:ss"
        );
        setLoadingOk1(true);
        const {
          itemCode,
          supplierItemCode,
          qty,
          productionDate,
          expirationDate,
          lotNo,
          dateCode,
          GenerateQty,
          msl,
          packageQty,
        } = values;
        console.log("productionDate", productionDate);
        let params = {
          packQty: packageQty,
          stockInId: activeId1,
          itemCode,
          supplierItemCode,
          qty,
          productionDate,
          expirationDate,
          lotNo,
          dateCode,
          GenerateQty,
        };
        
        http
          .post(
            `${config.API_PREFIX}${api.wmsItemStockInGenerateUniqueCode}`,
            params
          )
          .then(async (res) => {
            // formCreate1.resetFields();
            // setLoadingOk1(false);
            // setIsModalOpen1(false);
            // message.success("操作成功！");
            if (res?.bizData.length) {
              for (let i = 0; i < res?.bizData.length; i++) {
                try {
                  const printData = await getPrintData(res?.bizData[i], params)
  
                  myDesign(printData.bizData)
    
                  // @luck 我感觉还是调用两次比较好，中间间隔3s或者5s
                  await new Promise(resolve => setTimeout(resolve, 5000));
                } catch(err) {
                  console.error(err, '生成打印数据或打印异常！')
                  // message.error("生成打印数据或打印异常！");
                }
              }
              formCreate1.resetFields();
              formCreate1.setFieldsValue({ GenerateQty: 1 });
              formCreate1.setFieldsValue({ productionDate: dayjs() });
              setLoadingOk1(false);
              message.success("操作成功！");
            }
          })
          .catch((err) => {
            setLoadingOk1(false);
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
  const handleCancel1 = () => {
    setIsModalOpen1(false);
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
      orderNumber,
      supplier,
      poNumber,
      deliveryNumber,
      deliveryQty,
      deliveryPerson,
      receiver,
      createTimeStart,
      createTimeEnd,
    } = formSearch.getFieldsValue();
    if (orderNumber) {
      params.orderNumber = orderNumber;
    }
    if (supplier) {
      params.supplier = supplier;
    }
    if (poNumber) {
      params.poNumber = poNumber;
    }
    if (deliveryNumber) {
      params.deliveryNumber = deliveryNumber;
    }
    if (deliveryQty) {
      params.deliveryQty = deliveryQty;
    }
    if (deliveryPerson) {
      params.deliveryPerson = deliveryPerson;
    }
    if (receiver) {
      params.receiver = receiver;
    }
    if (createTimeStart) {
      params.createTimeStart =
        createTimeStart.format("YYYY-MM-DD ") + "00:00:00";
    }
    if (createTimeEnd) {
      params.createTimeEnd = createTimeEnd.format("YYYY-MM-DD ") + "00:00:00";
    }
    http
      .get(config.API_PREFIX + api.wmsItemStockInPage, params)
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

  const myDesign = (tplContent) => {
    let LODOP = window.getLodop();
    /*
    if (LODOP.CVERSION) {
      window.CLODOP.On_Return = function (TaskID, Value) {
        // document.getElementById('S1').value = Value;
        console.log("Value", Value);
      };
    }
    */
    if (tplContent) {
      eval(tplContent);
    }
    LODOP.PRINT();
  };

  const [type, setType] = useState();
  const onTypeChange = (value) => {
    console.log("value", value);
    setType(value);
  };
  return (
    <div className="content-wrapper">
      <Breadcrumb
        className="breadcrumb"
        items={[
          {
            title: "仓库信息",
          },
          {
            title: "入库",
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
                <Form.Item label="入库单" name="orderNumber">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="供应商" name="supplier">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="采购单号" name="poNumber">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="送货单号" name="deliveryNumber">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="送货人" name="deliveryPerson">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="收料人" name="receiver">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="入库日期（开始）" name="createTimeStart">
                  <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="入库日期（结束）" name="createTimeEnd">
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
              新增入库单
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
        <Modal
          title="新增/修改入库单"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          confirmLoading={loadingOk}
        >
          <Form
            labelCol={{ span: 6 }}
            form={formCreate}
            style={{ padding: 16, maxHeight: "60vh", overflow: "scroll" }}
          >
            <Form.Item
              label="入库单"
              name="orderNumber"
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
              label="供应商"
              name="supplier"
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
              label="采购单号"
              name="poNumber"
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
              label="送货单"
              name="deliveryNumber"
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
              label="来料数量"
              name="deliveryQty"
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
              label="送货人"
              name="deliveryPerson"
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
              label="收料人"
              name="receiver"
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
              label="备注"
              name="remark"
              rules={[
                {
                  required: true,
                  message: "请输入",
                },
              ]}
            >
              <Input allowClear placeholder="请输入" />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="物料UID打印"
          open={isModalOpen1}
          onOk={handleOk1}
          onCancel={handleCancel1}
          confirmLoading={loadingOk1}
          okText="打印"
        >
          <Form
            labelCol={{ span: 6 }}
            form={formCreate1}
            style={{ padding: 16, maxHeight: "60vh", overflow: "scroll" }}
          >
            <Form.Item
              label="料号"
              name="itemCode"
              rules={[
                {
                  required: true,
                  message: "请输入",
                },
              ]}
            >
              <Input
                allowClear
                onPressEnter={fetchData2}
                placeholder="请输入"
              />
            </Form.Item>

            <Form.Item
              label="供应商"
              name="supplier"
              rules={[
                {
                  required: false,
                  message: "请输入",
                },
              ]}
            >
              {/* <Input allowClear placeholder="接口没有" /> */}
              <Select
                placeholder="请选择"
                allowClear
                onChange={fillInOtherFields}
                options={supplierlList?.map((item) => ({
                  value: item.supplier,
                  label: item.supplier,
                }))}
              />
            </Form.Item>

            <Form.Item
              label="供应商料号"
              name="supplierItemCode"
              rules={[
                {
                  required: true,
                  message: "请输入",
                },
              ]}
            >
              <Input
                allowClear
                onPressEnter={fetchData2}
                placeholder="请输入"
              />
            </Form.Item>

            <Form.Item
              label="包装数量"
              name="packageQty"
              rules={[
                {
                  required: false,
                  message: "请输入",
                },
              ]}
            >
              <Input allowClear placeholder="" />
            </Form.Item>

            <Form.Item
              label="实际数量"
              name="qty"
              rules={[
                {
                  required: true,
                  message: "请输入",
                },
              ]}
            >
              <InputNumber
                ref={QTYRef}
                style={{ width: "100%" }}
                allowClear
                placeholder="请输入"
              />
            </Form.Item>

            <Form.Item
              label="MSL"
              name="msl"
              rules={[
                {
                  required: false,
                  message: "请输入",
                },
              ]}
            >
              <Input allowClear placeholder="" />
            </Form.Item>

            <Form.Item
              label="有效期"
              name="shelfLife"
              rules={[
                {
                  required: false,
                  message: "请输入",
                },
              ]}
            >
              <Input
                allowClear
                onBlur={handleProductionDateChange}
                placeholder=""
              />
            </Form.Item>

            <Form.Item
              label="生产日期"
              name="productionDate"
              rules={[
                {
                  required: true,
                  message: "请输入",
                },
              ]}
            >
              {/* <Input allowClear placeholder="请输入" /> */}
              <DatePicker
                format="YYYY-MM-DD"
                onChange={handleProductionDateChange}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="过期日期"
              name="expirationDate"
              rules={[
                {
                  required: true,
                  message: "请输入",
                },
              ]}
            >
              {/* <Input allowClear placeholder="请输入" /> */}
              <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="批次号"
              name="lotNo"
              rules={[
                {
                  required: false,
                  message: "请输入",
                },
              ]}
            >
              <Input allowClear placeholder="请输入" />
            </Form.Item>

            <Form.Item
              label="DateCode"
              name="dateCode"
              rules={[
                {
                  required: false,
                  message: "请输入",
                },
              ]}
            >
              <Input allowClear placeholder="请输入" />
            </Form.Item>

            <Form.Item
              label="份数"
              name="GenerateQty"
              rules={[
                {
                  required: true,
                  message: "请输入",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                allowClear
                placeholder="请输入"
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default App;
