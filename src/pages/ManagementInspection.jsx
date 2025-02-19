import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  DatePicker,
  Typography,
  Spin,
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
import debounce from "lodash/debounce";
import http from "../utils/http";
import { config } from "../utils/config";
import api from "../utils/api";
import  dayjs from "dayjs";
const { TextArea } = Input;
const { Option } = Select;

const { confirm } = Modal;
let activeId = -1;
// let debounceTimeout = null;

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
  const panelCodeRef = useRef(null);
  // const [form] = Form.useForm();
  const [previousPanelCodeValue, setPreviousPanelCodeValue] = useState("");
  const [isVI, setIsVI] = useState(false);
  const debounceTimeoutRef = useRef(null);

  const [value3, setValue3] = useState([]);
  // 不良明细列表(未启用)
  const [tags, setTags] = useState([]);
  const handleChange = (value) => {
    console.log("tags value", value);
    setTags(value);
  };
  // 不良名称列表
  const [defectNameList, setDefectNameList] = useState([]);
  // 不良代码列表
  const [defectCodeList, setDefectCodeList] = useState([]);
  const handlePanelCodeChange = (e) => {
    const currentValue = e.target.value;
    // 清除之前的防抖计时器
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // 设置新的防抖计时器
    debounceTimeoutRef.current = setTimeout(() => {
      // 判断当前值与上一次的值是否不同
      if (currentValue && currentValue !== previousPanelCodeValue) {
        http
          .get(config.API_PREFIX + api.basicTestDefectCodePage, {
            //不良代码信息-分页查询
            defectCode: currentValue,
          })
          .then((res) => {
            console.log("res", res);
            const records = res?.bizData?.records;
            if (records.length) {
              const { defectCategory, defectName } = records[0];
              // setOrderNumber(orderNumber)
              // setProductCode(productCode)

              // formCreate.setFieldsValue({
              //   defectName,
              // });
              if (defectCategory === "VI") {
                // 不良名称显示到表单
                let dNameList =[...new Set([...defectNameList, defectName])]
                setDefectNameList(dNameList);
                formCreate.setFieldValue("defectName", dNameList);
                // 不良代码不显示
                let dCodeList =[...new Set([...defectCodeList, currentValue])]
                setDefectCodeList(dCodeList);
                // 下面注释之前显示到不良明细,现在不要了
                // console.log('[...tags, currentValue]', [...tags, currentValue])
                // let uniqueTags = [...new Set([...tags, currentValue])];
                // setTags(uniqueTags);
                // formCreate.setFieldValue("defectDetails", uniqueTags); //['666']
                setIsVI(true);
                formCreate.setFieldValue("panelCode", "");
              } else {
                setIsVI(false);
              }
            } else {
              // formCreate.setFieldsValue({
              //   defectName: '',
              // })
              setIsVI(false);
              handleOk(); //自动保存
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }

      // 更新上一次的值
      setPreviousPanelCodeValue(currentValue);
    }, 300);
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
  const [loading, setLoading] = useState(false);
  const [formCreate] = Form.useForm();
  const [formSearch] = Form.useForm();
  const [data, setData] = useState([]);

  const columns = [
    {
      title: "工位ID",
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
      dataIndex: "productCode",
      key: "productCode",
    },
    {
      title: "测试结果",
      dataIndex: "testResult",
      key: "testResult",
      render: (_, record) => {
        return _ === "Y" ? (
          <Tag color="green">OK</Tag>
        ) : (
          <Tag color="volcano">NG</Tag>
        );
      },
    },
    {
      title: "不良明细",
      dataIndex: "defectDetails",
      key: "defectDetails",
    },
    {
      title: "不良代码",
      dataIndex: "defectCode",
      key: "defectCode",
    },
    {
      title: "不良名称",
      dataIndex: "defectName",
      key: "defectName",
    },
    {
      title: "测试人",
      dataIndex: "tester",
      key: "tester",
    },
    {
      title: "测试时间",
      dataIndex: "createTime",
      key: "createTime",
      // sorter: true,
      render: (_, record) => {
        return dayjs(_).format("YYYY-MM-DD HH:mm:ss");
      },
    },
    {
      title: "大板条码",
      dataIndex: "shelfLife",
      key: "shelfLife",
    },
    {
      title: "拼板号",
      dataIndex: "",
      key: "",
    },
    {
      title: "备注",
      dataIndex: "remark",
      key: "remark",
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
            <Typography.Link onClick={() => del(record)} disabled>
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
          .del(config.API_PREFIX + api.visualInspection + `/${record?.id}`, {})
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

  const showModal = (action, record) => {
    console.log("record", record);
    if (action === "update" && record) {
      const {
        id,
        workStation,
        workOrderNumber,
        panelCode,
        defectDetails, // "111,222"
        defectCode, // "6645634,sdfsdfsdf"
        defectName
      } = record;
      activeId = id;
   
      formCreate.setFieldsValue({
        workStation,
        workOrderNumber,
        panelCode,
        defectDetails: defectDetails?.split(","),
        defectName: defectName?.split(","), 
        defectCode: defectCode?.split(","), 
      });
      setValue3(workOrderNumber);

      // 不良名称显示到表单
      setDefectNameList(defectDetails?.split(",")||[]);
      // 不良代码不显示
      setDefectCodeList(defectCode?.split(",")||[]);
    } else {
      activeId = -1;
      formCreate.resetFields();
      if (localStorage.getItem("workStation1")) {
        formCreate.setFieldValue(
          "workStation",
          localStorage.getItem("workStation1")
        );
      }
      if (localStorage.getItem("workOrderNumber1")) {
        formCreate.setFieldValue(
          "workOrderNumber",
          localStorage.getItem("workOrderNumber1")
        );
      }
    }
    setIsModalOpen(true);
    // 使用setTimeout确保在Modal渲染后执行
    setTimeout(() => {
      panelCodeRef.current.focus();
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
          workStation,
          workOrderNumber,
          panelCode,
          defectCode,
          defectDetails,
          defectName
        } = values;
        
        let params = {
          workStation,
          workOrderNumber: workOrderNumber, //workOrderNumber.value
          panelCode,
          defectName: defectName?.join(","), 
          defectCode: defectCodeList?.join(","),
          defectDetails: defectDetails?.join(","),
        };
        // console.log('params',params)
        // return
        let action = null;
        let msg = "";
        let apiUrl = "";
        console.log("activeId", activeId);
        if (activeId !== -1) {
          action = http.put;
          // apiUrl = `${config.API_PREFIX}${api.printTemplate}/${activeId}`
          apiUrl = `${config.API_PREFIX}${api.visualInspection}`;
          params.id = activeId;
          msg = "修改成功！";
        } else {
          action = http.post;
          apiUrl = `${config.API_PREFIX}${api.visualInspection}`;
          msg = "新增成功！";
        }
        action(apiUrl, params)
          .then((res) => {
            // formCreate.resetFields();
            formCreate.setFieldValue("panelCode", "");
            formCreate.setFieldValue("defectName", []);
            formCreate.setFieldValue("defectDetails", []);
            setTags([]);
            setDefectNameList([]);
            setDefectCodeList([]);
            // 使用setTimeout确保在Modal渲染后执行
            setTimeout(() => {
              panelCodeRef.current.focus();
            }, 500);
            setLoadingOk(false);
            // setIsModalOpen(false);
            fetchData();
            message.success(msg);
            //保存完之后清除记录的不良明细和不良代码
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
      productCode,
      testResult,
      tester,
      testTimeStart,
      testTimeEnd,
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
    if (productCode) {
      params.productCode = productCode;
    }
    if (testResult) {
      params.testResult = testResult;
    }
    if (tester) {
      params.tester = tester;
    }
    if (testTimeStart) {
      params.testTimeStart = testTimeStart.format("YYYY-MM-DD") + " 00:00:00";
    }
    if (testTimeEnd) {
      params.testTimeEnd = testTimeEnd.format("YYYY-MM-DD" + " 23:59:59");
    }

    http
      .get(config.API_PREFIX + api.visualInspectionPage, params)
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

  function DebounceSelect({ fetchOptions, debounceTimeout = 800, ...props }) {
    const [fetching, setFetching] = useState(false);
    const [options, setOptions] = useState([]);
    const fetchRef = useRef(0);
    const debounceFetcher = useMemo(() => {
      const loadOptions = (value) => {
        fetchRef.current += 1;
        const fetchId = fetchRef.current;
        setOptions([]);
        setFetching(true);
        fetchOptions(value, (newOptions) => {
          if (fetchId !== fetchRef.current) {
            // for fetch callback order
            return;
          }
          setOptions(newOptions);
          setFetching(false);
        });
      };
      return debounce(loadOptions, debounceTimeout);
    }, [fetchOptions, debounceTimeout]);

    const handleFocus = () => {
      debounceFetcher("");
    };
    return (
      <Select
        labelInValue={false}
        filterOption={false}
        onSearch={debounceFetcher}
        notFoundContent={fetching ? <Spin size="small" /> : null}
        onFocus={handleFocus}
        {...props}
        options={options}
      />
    );
  }
  const saveWorkStationStorage = (e) => {
    // 保存工位信息
    // console.log('workStation',formCreate.getFieldValue("workStation"))
    if (
      formCreate.getFieldValue("workStation") &&
      formCreate.getFieldValue("workStation") != ""
    ) {
      localStorage.setItem(
        "workStation1",
        formCreate.getFieldValue("workStation")
      );
    }
  };
  // Usage of DebounceSelect

  async function fetchUserList(username, callback) {
    console.log("fetching user", username);
    let params = {};
    if (username) {
      params.orderNumber = username;
    }
    http
      .get(config.API_PREFIX + api.prodworkorderPage, params)
      .then((res) => {
        console.log("res", res);
        const { records } = res?.bizData;
        const data = records.map((item) => ({
          value: item.orderNumber,
          text: item.orderNumber,
        }));
        callback(data || []);
      })
      .catch((err) => {
        console.log(err);
        callback([]);
      });
  }

  return (
    <div className="content-wrapper">
      <Breadcrumb
        className="breadcrumb"
        items={[
          {
            title: "生产管理",
          },
          {
            title: "目检",
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
                <Form.Item label="产品料号" name="productCode">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="测试结果" name="testResult">
                  <Select
                    placeholder="请选择"
                    allowClear
                    showSearch
                    options={[
                      {
                        label: "OK",
                        value: "Y",
                      },
                      {
                        label: "NG",
                        value: "N",
                      },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="测试人" name="tester">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="测试日期（开始）" name="testTimeStart">
                  <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="测试日期（结束）" name="testTimeEnd">
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
              新增目检
            </Button>
          </div>
          <Table
            scroll={{ x: 1500 }}
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
          title="新增/修改目检"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          confirmLoading={loadingOk}
          okButtonProps={{
            disabled: loadingUpload,
          }}
        >
          <Form
            labelCol={{ span: 8 }}
            form={formCreate}
            style={{ padding: 16, maxHeight: "60vh", overflow: "scroll" }}
          >
            <Form.Item
              label="工位"
              name="workStation"
              onBlur={saveWorkStationStorage}
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
              label="工单号"
              name="workOrderNumber"
              rules={[
                {
                  required: true,
                  message: "请输入",
                },
              ]}
            >
              <DebounceSelect
                // mode="multiple"
                showSearch
                allowClear
                value={value3}
                placeholder="请输入"
                fetchOptions={fetchUserList}
                onChange={(newValue) => {
                  console.log("newValue", newValue);
                  if (newValue) {
                    setValue3(newValue);
                    localStorage.setItem("workOrderNumber1", newValue || "");
                  }
                }}
                style={{
                  width: "100%",
                }}
              />
            </Form.Item>
            <Form.Item
              label="产品条码/不良代码"
              name="panelCode"
              rules={[
                {
                  required: true,
                  message: "请扫描",
                },
              ]}
            >
              <Input
                ref={panelCodeRef}
                allowClear
                placeholder="请扫描"
                onPressEnter={handlePanelCodeChange}
              />
            </Form.Item>
            <Form.Item
              label="不良名称"
              name="defectName"
              rules={[
                {
                  required: isVI ? true : false,
                  message: "请输入",
                },
              ]}
            >
              {/* <Input disabled allowClear placeholder="自动填充" /> */}
              <Select
                disabled
                mode="tags"
                suffixIcon={null}
                open={false}
                dropdownRender={() => null}
                placeholder="自动填充"
              ></Select>
            </Form.Item>

            <Form.Item
              label="不良明细"
              name="defectDetails"
              rules={[
                {
                  required: isVI ? true : false,
                  message: "请输入",
                },
              ]}
            >
              <Select
                mode="tags"
                suffixIcon={null}
                // value={tags}
                onChange={handleChange}
                open={false} // 禁用下拉选项弹出
                dropdownRender={() => null} // 通过返回 null 来禁用下拉选项
                placeholder="自动填充"
              >
                {/* 预先定义一些选项 */}
                {/* <Option key="option1">Option 1</Option>
                <Option key="option2">Option 2</Option>
                <Option key="option3">Option 3</Option> */}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default App;
