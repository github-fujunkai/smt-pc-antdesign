import React, { useState, useMemo, useEffect } from "react";
import {
  CopyOutlined,
  DownOutlined,
  ExclamationCircleFilled,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Dropdown,
  Drawer,
  Tooltip,
  Switch,
  Typography,
  DatePicker,
  Image,
  Tag,
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
import http from "../utils/http";
import { config } from "../utils/config";
import dayjs, { Dayjs } from "dayjs";
const TechnologicalProcess = () => {
  const { confirm } = Modal;
  const [dataSource, setDataSource] = useState([]);
  const columns = [
    {
      title: "工艺编码",
      dataIndex: "processCode",
      key: "processCode",
      ellipsis: true,
    },
    {
      title: "工艺名称",
      dataIndex: "processName",
      key: "processName",
      ellipsis: true,
    },
    {
      title: "生产阶别",
      dataIndex: "productionLevel",
      key: "productionLevel",
      ellipsis: true,
    },
    {
      title: "产品料号",
      dataIndex: "productCode",
      key: "productCode",
      ellipsis: true,
    },
    {
      title: "产品名称",
      dataIndex: "productName",
      key: "productName",
      ellipsis: true,
    },
    {
      title: "创建日期",
      dataIndex: "createTime",
      key: "createTime",
      ellipsis: true,
    },
    {
      title: "创建人",
      dataIndex: "createBy",
      key: "createBy",
      ellipsis: true,
    },
    {
      title: "备注",
      dataIndex: "remarks",
      key: "remarks",
      ellipsis: true,
    },
    {
      title: "操作",
      dataIndex: "",
      key: "x",
      fixed: "right",
      width: "180",
      render: (text, record) => {
        return (
          <Space>
            <Typography.Link
              onClick={() => {
                showProduction("add", record);
              }}
            >
              添加工序
            </Typography.Link>
            <Typography.Link
              onClick={() => {
                showModal("update", record);
              }}
            >
              修改
            </Typography.Link>
            <Typography.Link
              onClick={() => {
                handelDelete(record);
              }}
            >
              删除
            </Typography.Link>
          </Space>
        );
      },
    },
  ];
  const [isShowSearch, setIsShowSearch] = useState(false);
  const onSearchChange = (checked) => {
    console.log(`switch to ${checked}`);
    setIsShowSearch(checked);
  };
  const onFormFinish = (values) => {
    let params = {};
    const { startTime, endTime, processCode, processName, productionLevel } =
      values;
    if (startTime && startTime != "") {
      params.startTime = startTime.format("YYYY-MM-DD 00:00:00");
    }
    if (endTime && endTime != "") {
      params.endTime = endTime.format("YYYY-MM-DD 00:00:00");
    }
    if (processCode && processCode != "") {
      params.processCode = processCode;
    }
    if (processName && processName != "") {
      params.processName = processName;
    }
    if (productionLevel && productionLevel != "") {
      params.productionLevel = productionLevel;
    }
    console.log("search values", params);
    fetchData(params);
  };
  const [formSearch] = Form.useForm();
  const resetFormSearch = () => {
    formSearch.resetFields();
  };
  const [prodproductList, setProdproductList] = useState([]);
  const [prodproductId, setProdproductId] = useState(null);
  const getProdproductList = async () => {
    if (!prodproductId) {
      return;
    }
    http
      .get(
        config.API_PREFIX +
          "process/steps/list?" +
          `processRecordId=${prodproductId}`,
        {}
      )
      .then((res) => {
        setProdproductList(res?.bizData);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    if (prodproductId) {
      getProdproductList();
    }
  }, [prodproductId]);
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        "selectedRows: ",
        selectedRows
      );
      let slectId = selectedRows?.[0].id;
      setProdproductId(slectId);
    },
    getCheckboxProps: (record) => ({
      disabled: record.name === "Disabled User", // Column configuration not to be checked
      name: record.name,
    }),
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTechnologicalOpen, setIsTechnologicalOpen] = useState(false);
  const onChangeOpen = (checked) => {
    setIsModalOpen(checked);
    fetchData();
  };
  const onTechnologicalOpen = (checked) => {
    setIsTechnologicalOpen(checked);
    if (prodproductId) {
      getProdproductList();
    }
  };
  const [isEditData, setIsEditData] = useState(null);
  //添加修改工艺
  const showModal = (action, record) => {
    if (action === "update" && record) {
      setIsEditData(record);
    } else {
      setIsEditData(null);
    }
    setIsModalOpen(true);
  };
  //删除工艺
  const handelDelete = (record) => {
    confirm({
      title: "删除确认",
      icon: <ExclamationCircleFilled />,
      content: "删除后无法恢复，请确认是否删除！",
      onOk() {
        http
          .del(config.API_PREFIX + "process/records" + `/${record?.id}`, {})
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
  const [productionId, setProductionId] = useState(null);
  const [selectedRow, setSelectedRow] = useState([]);
  const [validationStepList, setValidationStepList] = useState([]);
  //添加修改工序
  const showProduction = (action, record) => {
    console.log(action, record);
    let curId = null;
    if (action === "update" && record) {
      setProductionId(null);
      setSelectedRow(record); //子集修改用的数据
      curId = record.processRecordId;
    } else {
      setProductionId(record.id); //子集新增用的数据
      setSelectedRow([]);
      curId = record.id;
    }
    //获取校验前工序
    http
      .get(
        config.API_PREFIX + "process/steps/list?" + `processRecordId=${curId}`,
        {}
      )
      .then((res) => {
        let data = res?.bizData.map((item) => {
          return {
            label: item.stepName,
            value: item.id,
          };
        });
        setValidationStepList(data);
      });
    setIsTechnologicalOpen(true);
  };
  //删除工序
  const delProduction = (record) => {
    confirm({
      title: "删除确认",
      icon: <ExclamationCircleFilled />,
      content: "删除后无法恢复，请确认是否删除！",
      onOk() {
        http
          .del(config.API_PREFIX + "process/steps" + `/${record?.id}`, {})
          .then((res) => {
            if (prodproductId) {
              getProdproductList();
            }
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
  const onChangeCopy = () => {
    http
      .post(
        config.API_PREFIX + "process/records/copy" + `/${prodproductId}`,
        {}
      )
      .then((res) => {
        fetchData();
        message.success("复制成功！");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const [pageParams, setPageParams] = useState({
    current: 1,
    size: 5,
  });
  const [total, setTotal] = useState(0);
  const handleQuery = (values) => {
    setPageParams({
      current: values,
      size: 5,
    });
  };
  const fetchData = (values) => {
    http
      .get(config.API_PREFIX + "process/records/page", {
        ...values,
        ...pageParams,
      })
      .then((res1) => {
        const data = res1?.bizData;
        setDataSource(data?.records);
        setTotal(data?.total);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    fetchData();
  }, [pageParams]);

  return (
    <div className="content-wrapper">
      <Breadcrumb
        className="breadcrumb"
        items={[
          {
            title: "生产计划",
          },
          {
            title: "工艺流程",
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
          <Form form={formSearch} onFinish={onFormFinish}>
            <Row gutter="24">
              <Col span={8}>
                <Form.Item label="工艺编码" name="processCode">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="工艺名称" name="processName">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="生产阶别" name="productionLevel">
                  <Select
                    placeholder="请选择"
                    allowClear
                    options={[
                      {
                        value: "SMT",
                        label: "SMT",
                      },
                      {
                        value: "THT",
                        label: "THT",
                      },
                      {
                        value: "DIP",
                        label: "DIP",
                      },
                      {
                        value: "ASSY",
                        label: "ASSY",
                      },
                      {
                        value: "Packing",
                        label: "Packing",
                      },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="开始时间" name="startTime">
                  {/* <Input allowClear placeholder="请输入" /> */}
                  <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="结束时间" name="endTime">
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
        <div style={{ marginBottom: 16, textAlign: "right", marginRight: 20 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal("create")}
            style={{ marginRight: 20 }}
          >
            新增
          </Button>
          <Button
            type="primary"
            icon={<CopyOutlined />}
            onClick={() => onChangeCopy()}
          >
            复制
          </Button>
        </div>
        <div>
          <Table
            pagination={{
              current: pageParams.current,
              pageSize: pageParams.size,
              total: total,
              size: "small",
              onChange: handleQuery,
              showTotal: (total) => `总数 ${total}`,
            }}
            dataSource={dataSource}
            columns={columns}
            rowSelection={{
              type: "radio",
              ...rowSelection,
            }}
            rowKey={(dataSource) => dataSource.id}
            size="small"
            scroll={{ x: "max-content" }}
          />
        </div>
        <div>
          {/* 工序表格列 */}
          <ProductionProcess
            update={showProduction}
            prodproductList={prodproductList}
            del={delProduction}
          />
        </div>
        {/* 工艺弹窗 */}
        <TechnologicalFrom
          isModalOpen={isModalOpen}
          onChange={onChangeOpen}
          isEditData={isEditData}
        />
        {/* 工序弹窗 */}
        <ProductionFrom
          validationStepList={validationStepList}
          productionId={productionId}
          selectedRow={selectedRow}
          isTechnologicalOpen={isTechnologicalOpen}
          onTechnologicalOpen={onTechnologicalOpen}
        />
      </div>
    </div>
  );
};
// 工艺弹窗
const TechnologicalFrom = (props) => {
  const [formCreate] = Form.useForm();
  const [loadingOk, setLoadingOk] = useState(false);
  const { isModalOpen, onChange, isEditData } = props;
  useEffect(() => {
    formCreate.setFieldsValue({
      ...isEditData,
    });
  }, [isEditData]);

  const handleOk = () => {
    console.log(formCreate.getFieldsValue());
    let modalData = formCreate.getFieldsValue();
    let action = null;
    let msg = "";
    if (isEditData) {
      action = http.put;
      msg = "修改成功";
      modalData.id = isEditData?.id;
    } else {
      action = http.post;
      modalData.id = 0;
      msg = "新增成功";
    }
    action(config.API_PREFIX + "process/records", modalData)
      .then((res1) => {
        formCreate.resetFields();
        onChange(false);
        message.success(msg);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleCancel = () => {
    formCreate.resetFields();
    onChange(false);
  };
  const { TextArea } = Input;
  return (
    <Modal
      title="新增/修改工艺"
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
          label="工艺编码"
          name="processCode"
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
          label="工艺名称"
          name="processName"
          rules={[
            {
              required: true,
              message: "请输入",
            },
          ]}
        >
          <Input allowClear placeholder="请输入" />
        </Form.Item>
        {/* <Form.Item
          label="工艺类别"
          name="processCategory"
          rules={[
            {
              required: true,
              message: "请输入",
            },
          ]}
        >
          <Input allowClear placeholder="请输入" />
        </Form.Item> */}
        <Form.Item
          label="生产阶别"
          name="productionLevel"
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
            options={[
              {
                value: "SMT",
                label: "SMT",
              },
              {
                value: "THT",
                label: "THT",
              },
              {
                value: "DIP",
                label: "DIP",
              },
              {
                value: "ASSY",
                label: "ASSY",
              },
              {
                value: "Packing",
                label: "Packing",
              },
            ]}
          />
        </Form.Item>
        <Form.Item
          label="产品料号"
          name="productCode"
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
          label="产品名称"
          name="productName"
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
          label="备注"
          name="remarks"
          rules={[
            {
              required: false,
              message: "请输入",
            },
          ]}
        >
          <TextArea allowClear placeholder="请输入" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
//工序表格列
const ProductionProcess = (props) => {
  const { update, del, prodproductList } = props;

  const [dataSource, setDataSource] = useState([]);
  useEffect(() => {
    setDataSource(prodproductList);
  }, [prodproductList]);
  const columns = [
    {
      title: "序号",
      dataIndex: "stepNumber",
      key: "stepNumber",
    },
    {
      title: "工序编码",
      dataIndex: "stepCode",
      key: "stepCode",
      ellipsis: true,
    },
    {
      title: "工序名称",
      dataIndex: "stepName",
      key: "stepName",
    },
    {
      title: "阶别",
      dataIndex: "level",
      key: "level",
    },
    {
      title: "工序面别",
      dataIndex: "surface",
      key: "surface",
      ellipsis: true,
    },
    {
      title: "工序必过",
      dataIndex: "required",
      key: "required",
    },
    {
      title: "工序类型",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "校验前工序",
      dataIndex: "validationStep",
      key: "validationStep",
      ellipsis: true,
    },
    {
      title: "时长(分钟)",
      dataIndex: "duration",
      key: "duration",
      ellipsis: true,
    },
    {
      title: "工时(秒)",
      dataIndex: "manHour",
      key: "manHour",
      ellipsis: true,
    },
    {
      title: "备注",
      dataIndex: "remarks",
      key: "remarks",
      ellipsis: true,
    },
    {
      title: "操作",
      dataIndex: "",
      key: "x",
      ellipsis: true,
      fixed: "right",
      width: "125px",
      render: (_, record) => {
        return (
          <Space>
            <Typography.Link
              onClick={() => {
                update("update", record);
              }}
            >
              修改
            </Typography.Link>
            <Typography.Link
              onClick={() => {
                del(record);
              }}
            >
              删除
            </Typography.Link>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="">
      <Table
        height={265}
        pagination={{
          pageSize: 5,
        }}
        dataSource={dataSource}
        columns={columns}
        size="small"
        scroll={{ x: true }}
      />
    </div>
  );
};
// 工序弹窗
const ProductionFrom = (props) => {
  const {
    isTechnologicalOpen,
    onTechnologicalOpen,
    productionId,
    selectedRow,
    validationStepList,
  } = props;
  const [isAssemble, setIsAssemble] = useState(false);

  console.log("validationStepList", validationStepList);
  // 校验前工序选项下拉项时不包含当前工序
  const validationStepListMine = validationStepList.filter(
    (item) => item.label != selectedRow.stepName
  );
  useEffect(() => {
    console.log("selectedRow", selectedRow);
    if (selectedRow.type && typeof selectedRow.type === "string") {
      selectedRow.type = selectedRow?.type.split(",") || [];
      console.log("selectedRow.type", selectedRow.type);
      if (selectedRow.type.includes("组装")) {
        setIsAssemble(true);
      }
    }
    formCreate.setFieldsValue({
      ...selectedRow,
    });
  }, [selectedRow]);
  const [formCreate] = Form.useForm();

  const [loadingOk, setLoadingOk] = useState(false);
  const [validationStepName, setValidationStepName] = useState([]);
  const handleOk = () => {
    // console.log(formCreate.getFieldsValue());
    formCreate
      .validateFields()
      .then((values) => {
        let modalData = formCreate.getFieldsValue();
        let action = null;
        let msg = "";
        if (!productionId) {
          action = http.put;
          msg = "修改成功";
          modalData.processRecordId = selectedRow.productionId;
          modalData.id = selectedRow.id;
        } else {
          action = http.post;
          modalData.processRecordId = productionId;
          modalData.id = 0;
          msg = "新增成功";
        }
        modalData.type = modalData.type.join(",");
        modalData.validationStep = validationStepName;
        action(config.API_PREFIX + "process/steps/v2", modalData)
          .then((res1) => {
            formCreate.resetFields();
            message.success(msg);
            onTechnologicalOpen(false);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((error) => {
        console.log("Form validation error:", error);
      });
  };
  const handleCancel = () => {
    formCreate.resetFields();
    onTechnologicalOpen(false);
  };

  const { TextArea } = Input;
  return (
    <Modal
      title="新增/修改工序"
      open={isTechnologicalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loadingOk}
      width={1000}
    >
      <Form
        labelCol={{ span: 6 }}
        form={formCreate}
        style={{ padding: 16, maxHeight: "60vh", overflow: "scroll" }}
      >
        <Row>
          <Col span={12}>
            <Form.Item
              label="工序序号"
              name="stepNumber"
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
              label="工序编码"
              name="stepCode"
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
              label="工序名称"
              name="stepName"
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
              label="工时(秒)"
              name="manHour"
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
              label="阶别"
              name="level"
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
                options={[
                  {
                    value: "SMT",
                    label: "SMT",
                  },
                  {
                    value: "THT",
                    label: "THT",
                  },
                  {
                    value: "DIP",
                    label: "DIP",
                  },
                  {
                    value: "ASSY",
                    label: "ASSY",
                  },
                  {
                    value: "Packing",
                    label: "Packing",
                  },
                ]}
              />
            </Form.Item>
            <Form.Item
              label="工序面别"
              name="surface"
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
                showSearch
                options={[
                  {
                    label: "TOP",
                    value: "TOP",
                  },
                  {
                    label: "BOT",
                    value: "BOT",
                  },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="工序必过"
              name="required"
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
                showSearch
                options={[
                  {
                    label: "是",
                    value: "是",
                  },
                  {
                    label: "否",
                    value: "否",
                  },
                ]}
              />
            </Form.Item>
            <Form.Item
              label="工序类型"
              name="type"
              rules={[
                {
                  required: true,
                  message: "请输入",
                },
              ]}
            >
              <Select
                placeholder="请选择"
                mode="multiple"
                allowClear
                showSearch
                options={[
                  {
                    label: "投入",
                    value: "投入",
                  },
                  {
                    label: "过站",
                    value: "过站",
                  },
                  {
                    label: "组装",
                    value: "组装",
                  },
                  {
                    label: "测试",
                    value: "测试",
                  },
                  {
                    label: "产出",
                    value: "产出",
                  },
                  {
                    label: "一级包装",
                    value: "一级包装",
                  },
                  {
                    label: "二级包装",
                    value: "二级包装",
                  },
                  {
                    label: "分板",
                    value: "分板",
                  },
                ]}
                onChange={(value) => {
                  value.indexOf("组装") > -1
                    ? setIsAssemble(true)
                    : setIsAssemble(false);
                }}
              />
            </Form.Item>
            <Form.Item
              label="校验前工序"
              name="validationStepId"
              rules={[
                {
                  required: false,
                  message: "请输入",
                },
              ]}
            >
              <Select
                placeholder="请选择"
                onChange={(e) => {
                  // 通过值获取当前选择的名称
                  let data = validationStepListMine.filter(
                    (item) => item.value == e
                  );
                  setValidationStepName(data?.[0]?.label);
                }}
                allowClear
                showSearch
                options={validationStepListMine}
              />
            </Form.Item>
            <Form.Item
              label="时长(分钟)"
              name="duration"
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
              label="备注"
              name="remarks"
              rules={[
                {
                  required: false,
                  message: "请输入",
                },
              ]}
            >
              <TextArea allowClear placeholder="请输入" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="时间戳"
              name="genTimeSpan"
              valuePropName="checked"
              rules={[
                {
                  required: false,
                  message: "请输入",
                },
              ]}
            >
              <Switch defaultChecked={false}  />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="重复过站"
              name="repeatProcess"
              valuePropName="checked"
              rules={[
                {
                  required: false,
                  message: "请输入",
                },
              ]}
            >
              <Switch defaultChecked={false}  />
            </Form.Item>
          </Col>
        </Row>
        {isAssemble && (
          <Form.List name="assemblySteps">
            {(fields, { add, remove }) => (
              <table className="myTable">
                <thead>
                  <tr>
                    <th style={{ width: "10%" }}>序号</th>
                    <th style={{ width: "15%" }}>组装件</th>
                    <th style={{ width: "15%" }}>条码规则</th>
                    <th style={{ width: "15%" }}>用量</th>
                    <th style={{ width: "15%" }}>组装顺序</th>
                    <th style={{ width: "15%" }}>组装类别</th>
                    <th style={{ width: "10%", textAlign: "center" }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <tr key={key}>
                      <td>
                        <Form.Item
                          name={[name, "sequenceNumber"]}
                          rules={[{ required: true, message: "请输入序号" }]}
                          initialValue={key + 1}
                        >
                          <Input disabled placeholder="" />
                        </Form.Item>
                      </td>
                      <td>
                        <Form.Item
                          name={[name, "assemblyPart"]}
                          rules={[{ required: true, message: "请输入组装件" }]}
                        >
                          <Input placeholder="" />
                        </Form.Item>
                      </td>
                      <td>
                        <Form.Item
                          name={[name, "barcodeRule"]}
                          rules={[
                            { required: true, message: "请输入条码规则" },
                          ]}
                        >
                          <Input placeholder="" />
                          {/* <Select
                          placeholder="请选择"
                          allowClear
                           options={dictBaseAll?.genRuleDetailRule?.map(
                             (item) => ({
                              value: item.dictKey,
                             label: item.dictValue,
                          )}
                        /> */}
                        </Form.Item>
                      </td>
                      <td>
                        <Form.Item
                          name={[name, "quantity"]}
                          rules={[{ required: true, message: "请输入用量" }]}
                        >
                          <Input placeholder="" />
                        </Form.Item>
                      </td>
                      <td>
                        <Form.Item
                          name={[name, "assemblyOrder"]}
                          rules={[
                            { required: true, message: "请输入组装顺序" },
                          ]}
                        >
                          <Input placeholder="" />
                        </Form.Item>
                      </td>
                      <td>
                        <Form.Item
                          name={[name, "assemblyType"]}
                          rules={[
                            { required: true, message: "请输入组装类别" },
                          ]}
                        >
                          <Select
                            placeholder="请选择"
                            allowClear
                            options={[
                              {
                                value: "单体",
                                label: "单体",
                              },
                              {
                                value: "批次",
                                label: "批次",
                              },
                            ]}
                          />
                        </Form.Item>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <Space>
                          <Typography.Link
                            onClick={() => {
                              remove(name);
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
                        添加组装
                      </Button>
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </Form.List>
        )}
      </Form>
    </Modal>
  );
};
export default TechnologicalProcess;
