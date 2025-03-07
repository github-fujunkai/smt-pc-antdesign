import {
  ExclamationCircleFilled,
  PlusOutlined,
  RollbackOutlined,
  SearchOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useAntdResizableHeader } from '@minko-fe/use-antd-resizable-header';
import '@minko-fe/use-antd-resizable-header/index.css';
import {
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import api from '../utils/api';
import { config } from '../utils/config';
import http from '../utils/http';
import WrapperLevelOneDialog from './WrapperLevelOneDialog';
import WrapperLevelTwoDialog from './WrapperLevelTwoDialog';
const { TextArea } = Input;

const { confirm } = Modal;
let activeId = -1;
let activeId1 = -1;
let activeId2 = -1;
let action2 = '';

// 工单状态
const statusObj = {
  0: '新建',
  1: '下达',
  2: '执行',
  3: '挂起',
  4: '结单',
  5: '取消',
};

// 工单类型
const workOrderTypeObj = {
  0: '量产',
  1: '试产',
  2: '制样',
};

// 制令单状态：0.新建，1.投产，2.挂起，3.结单
const statusObj1 = {
  0: '新建',
  1: '投产',
  2: '挂起',
  3: '接单',
};

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
  const [dictBaseFwa, setDictBaseFwa] = useState({});
  const getDictBaseFwa = () => {
    http
      .post(config.API_PREFIX + api.dictBaseFwa, {})
      .then((res) => {
        console.log('dict', res);
        setDictBaseFwa(res?.bizData);
      })
      .catch((err) => {});
  };

  useEffect(() => {
    getDictBaseFwa();
  }, []);

  const onFinish = (values) => {
    console.log('search values', values);
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
  const [loadingOk2, setLoadingOk2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formCreate] = Form.useForm();
  const [formCreate1] = Form.useForm();
  const [formCreate2] = Form.useForm();
  const [formSearch] = Form.useForm();
  const [data, setData] = useState([]);

  const [columns, setColumns] = useState([
    {
      title: '工位',
      dataIndex: 'workStation',
      key: 'workStation',
      width: 120,
    },
    {
      title: '包装条码',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 200,
    },
    {
      title: '工单号',
      dataIndex: 'workOrderNumber',
      key: 'workOrderNumber',
      width: 120,
    },
    {
      title: '产品料号',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
    },
    {
      title: '包装级别',
      dataIndex: 'packagingLevel',
      key: 'packagingLevel',
      width: 80,
    },
    // {
    //   title: '容器编码',
    //   dataIndex: 'orderNumber',
    //   key: 'orderNumber',
    //   width: 100,
    // },
    {
      title: '产品条码',
      dataIndex: 'panelCode',
      key: 'panelCode',
      width: 120,
    },
    {
      title: '包装人',
      dataIndex: 'createBy',
      key: 'createBy',
      width: 120,
    },
    {
      title: '包装时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (_, record) => {
        return dayjs(_).format('YYYY-MM-DD HH:mm:ss');
      },
      width: 120,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      fixed: 'right',
      render: (_, record) => {
        return (
          <Space>
            <Typography.Link onClick={() => unboxing(record)}>解箱</Typography.Link>
            <Typography.Link onClick={() => unProduct(record)}>解产品</Typography.Link>
            <Typography.Link onClick={() => printTemplateData(record)}>打印</Typography.Link>
          </Space>
        );
      }
    },
    
  ]);

  const unboxing = (record) => {
    confirm({
      title: '解箱',
      icon: <ExclamationCircleFilled />,
      content: '是否执行解箱操作？',
      onOk() {
        console.log('OK');
        http
          .put(config.API_PREFIX + 'pack/product/packaging/unpackingById' + `/${record?.id}`, {})
          .then((res) => {
            fetchData();
            message.success('解箱成功！');
          })
          .catch((err) => {
            console.log(err);
          });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  const unProduct = (record) => {
    confirm({
      title: '解产品',
      icon: <ExclamationCircleFilled />,
      content: '是否执行解产品操作？',
      onOk() {
        http
          .post(config.API_PREFIX + 'pack/product/packaging/unpackSingleProduct', {
            packagingLevel: record.packagingLevel,
            workOrderNumber: record.workOrderNumber,
            productCode: record.productCode,
            workStation: record.workStation,
            uniqueCode: record.orderNumber,
          })
          .then((res) => {
            fetchData();
            message.success('解产品成功！');
          })
          .catch((err) => {
            console.log(err);
          });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  //条码打印
  const printTemplateData = (record) => {
    //根据 包装层级 +产品料号，到机型维护里获取 标签模板ID
    http
      .post(
        `${config.API_PREFIX}${api.packProductConfigPage}?current=1&size=10&packagingLevel=1&productCode=${record.productCode}`,
      )
      .then((res) => {
        const records = res?.bizData?.records;
        if (records.length) {
          const { labelTemplateId } = records[0];
          http
            .post(`${config.API_PREFIX}${api.printTemplatePrintData}`, {
              templateId: labelTemplateId, //打印模板ID
              qty: 1, //有几个条码就是几个
              // orderNumber: "", //产品条码 条码是个列表怎么传？
              packagingLevel: 1, //包装级别
              workOrderNumber: record.workOrderNumber, //工单号
              productCode: record.productCode, //产品料号
              workStation: record.workStation, //工位
              // packageDateTimeFormatter: form.getFieldValue('packageDateTimeFormatter'),
              productName: record.productName,
              orderNumber: record.orderNumber, //产品条码  ---- 这是算是箱号
              actualPackageQty: record.actualPackageQty, //包装数量
            })
            .then((res1) => {
              // 打印
              if (res1.respCode == '200') {
                message.success('操作成功！');
                myDesign(res1?.bizData);
              } else {
                message.warning(res1.respMsg);
                return;
              }
            });
        }
      })
      .catch((err) => {
        // setLoadingOk1(false);
        console.log(err);
      });
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);

  const showModal = (action, record) => {
    if (action === 'update' && record) {
      const {
        id,
        workStation,
        workOrderNumber,
        productCode,
        packagingLevel,
        orderNumber,
        productName,
      } = record;
      activeId = id;
      formCreate.setFieldsValue({
        workStation,
        workOrderNumber,
        productCode,
        packagingLevel,
        orderNumber,
        productName,
      });
    } else {
      activeId = -1;
      formCreate.resetFields();
    }
    setIsModalOpen(true);
  };
  const showModal2 = (action, record) => {
    activeId2 = record.id;
    action2 = action;
    if (action === 'update' && record) {
      formCreate2.resetFields();
      const {
        orderNumber,
        plannedQty,
        completedQty,
        productionAreaId,
        lane,
        cycleTime,
        boardSide,
        productionStage,
        status,
        actualProductionTime,
        actualCompletionDate,
        plannedProductionDate,
        plannedCompletionDate,
      } = record;
      formCreate2.setFieldsValue({
        orderNumber,
        plannedQty,
        completedQty,
        productionAreaId: productionAreaId.toString(),
        lane,
        cycleTime,
        boardSide,
        productionStage,
        status,
        actualProductionTime: dayjs(actualProductionTime),
        actualCompletionDate: dayjs(actualCompletionDate),
        plannedProductionDate: dayjs(plannedProductionDate),
        plannedCompletionDate: dayjs(plannedCompletionDate),
      });
    } else {
      formCreate2.resetFields();
    }
    setIsModalOpen2(true);
  };

  const [open, setOpen] = useState(false);
  const showDrawer = (record) => {
    activeId1 = record.id;
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const onSave = () => {
    formCreate1
      .validateFields()
      .then((values) => {
        console.log('values', values);
        // sdf
        const items = values?.items.map((item) => ({
          ...item,
          workOrderId: activeId1,
        }));
        http
          .post(`${config.API_PREFIX}${api.prodproductionorder}`, items)
          .then((res) => {
            formCreate1.resetFields();
            fetchData();
            onClose();
            message.success('新增成功！');
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((error) => {
        console.log('Form validation error:', error);
      });
  };

  const handleOk = () => {
    formCreate
      .validateFields()
      .then((values) => {
        console.log('values', values);

        setLoadingOk(true);
        // wtf
        const {
          workStation,
          workOrderNumber,
          productCode,
          packagingLevel,
          orderNumber,
          productName,
        } = values;
        let params = {
          workStation,
          workOrderNumber,
          productCode,
          packagingLevel,
          orderNumber,
          productName,
        };
        let action = null;
        let msg = '';
        let apiUrl = '';
        console.log('activeId', activeId);
        if (activeId !== -1) {
          action = http.put;
          // apiUrl = `${config.API_PREFIX}${api.printTemplate}/${activeId}`
          apiUrl = `${config.API_PREFIX}${api.packProductPackaging}`;
          params.id = activeId;
          msg = '修改成功！';
        } else {
          action = http.post;
          apiUrl = `${config.API_PREFIX}${api.packProductPackaging}`;
          msg = '新增成功！';
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
        console.log('Form validation error:', error);
      });
  };

  const handleOk2 = () => {
    formCreate2
      .validateFields()
      .then((values) => {
        console.log('values', values);
        setLoadingOk2(true);
        // wtf
        const { boardCode, panelCode, packagingOrderNumber } = values;
        let params = { boardCode, panelCode, packagingOrderNumber };
        let action = null;
        let msg = '';
        let apiUrl = '';
        console.log('activeId2', activeId2);
        if (action2 === 'update') {
          action = http.put;
          // apiUrl = `${config.API_PREFIX}${api.printTemplate}/${activeId}`
          apiUrl = `${config.API_PREFIX}${api.packProductPackagingCode}`;
          params.id = activeId2;
          msg = '修改成功！';
        } else {
          action = http.post;
          apiUrl = `${config.API_PREFIX}${api.packProductPackagingCode}`;
          msg = '新增成功！';
          params.packagingId = activeId2;
        }
        action(apiUrl, params)
          .then((res) => {
            formCreate2.resetFields();
            setLoadingOk2(false);
            setIsModalOpen2(false);
            fetchData();
            message.success(msg);
            activeId2 = -1;
          })
          .catch((err) => {
            setLoadingOk2(false);
            console.log(err);
          });
      })
      .catch((error) => {
        console.log('Form validation error:', error);
      });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const handleCancel2 = () => {
    setIsModalOpen2(false);
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

  useEffect(() => {
    fetchData();
    console.log('JSON.stringify(tableParams)]', JSON.stringify(tableParams));
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
        console.log('res', res);
        const data = res?.bizData;
        console.log('printTemplateVariable', data);
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
        console.log('res', res);
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
    console.log('order, field', order, field);

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
      params['orders[0].column'] = field;
      params['orders[0].asc'] = order === 'ascend' ? true : false;
    }

    const {
      workStation,
      orderNumber,
      workOrderNumber,
      productCode,
      packagingLevel,
      createBy,
      createTimeStart,
      createTimeEnd,
      maxPackageQty,
    } = formSearch.getFieldsValue();
    if (workStation) {
      params.workStation = workStation;
    }
    if (orderNumber) {
      params.orderNumber = orderNumber;
    }
    if (workOrderNumber) {
      params.workOrderNumber = workOrderNumber;
    }
    if (productCode) {
      params.productCode = productCode;
    }
    if (packagingLevel) {
      params.packagingLevel = packagingLevel;
    }
    if (maxPackageQty) {
      params.maxPackageQty = maxPackageQty;
    }
    if (createBy) {
      params.createBy = createBy;
    }
    if (createTimeStart) {
      params.createTimeStart = createTimeStart.format('YYYY-MM-DD 00:00:00');
    }
    if (createTimeEnd) {
      params.createTimeEnd = createTimeEnd.format('YYYY-MM-DD 00:00:00');
    }

    http
      .get(config.API_PREFIX + api.packProductPackagingPage, params)
      .then((res) => {
        console.log('res', res);
        const data = res?.bizData;

        setData(data?.records || []);
        setLoading(false);
        console.log('fetchData pagination', tableParams);
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
    console.log('handleTableChange: ', pagination, filters, sorter);
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

  const [loadingUpload, setLoadingUpload] = useState(false);
  const [imageUrl, setImageUrl] = useState();

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

  const handleDeleteItem = (index, remove) => {
    remove(index);
  };

  // 一二级包装逻辑
  const [warpperLevel1, setWarpperLevel1] = useState(false);
  const [warpperLevel2, setWarpperLevel2] = useState(false);
  const handleWarpperLevel1 = (value) => {
    setWarpperLevel1(value);
  };
  const handleWarpperLevel2 = (value) => {
    setWarpperLevel2(value);
  };
  // --------------------------------------------------------------------------------------------------------------------
  const { components, resizableColumns, tableWidth, resetColumns } = useAntdResizableHeader({
    columns: useMemo(() => columns, [columns]),
    columnsState: {
      persistenceKey: 'localKeyPackagingInquiry',
      persistenceType: 'localStorage',
    },
  });

  // 可拖动的单个项目组件
  function SortableItem({ id, content, isDraggable }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id: id,
      disabled: !isDraggable, // 使用 disabled 属性来控制是否可以拖动
    });

    const style = {
      transform: `translate3d(${transform?.x}px, ${transform?.y}px, 0)`,
      transition,
      // 如果不可拖动，可以添加不同的样式或逻辑
      opacity: isDraggable ? 1 : 0.5,
      cursor: isDraggable ? 'grab' : 'not-allowed',
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {content}
      </div>
    );
  }

  // 定义传感器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: verticalListSortingStrategy,
    }),
  );

  // 拖放逻辑处理函数
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = columns.findIndex((col) => col.key === active.id);
      const newIndex = columns.findIndex((col) => col.key === over.id);

      if (oldIndex !== newIndex) {
        setColumns((prevColumns) => {
          const updatedColumns = Array.from(prevColumns);
          const [movedColumn] = updatedColumns.splice(oldIndex, 1);
          updatedColumns.splice(newIndex, 0, movedColumn);

          // 保存新的列顺序
          saveColumnsOrder(updatedColumns);

          return updatedColumns;
        });
      }
    } else {
      // 如果没有有效的放置目标，强制更新状态以触发重渲染
      setColumns((prevItems) => [...prevItems]);
    }
  };

  const saveColumnsOrder = (columns) => {
    localStorage.setItem('columnsPackagingInquiry', JSON.stringify(columns.map((col) => col.key)));
  };

  useEffect(() => {
    const savedOrder = localStorage.getItem('columnsPackagingInquiry');
    if (savedOrder) {
      const order = JSON.parse(savedOrder);
      const orderedColumns = order
        .map((key) => columns.find((col) => col.key === key))
        .filter(Boolean);
      setColumns(orderedColumns);
    }
    // 其他初始化逻辑...
  }, []);
  function refreshPage() {
    localStorage.removeItem('columnsPackagingInquiry');
    message.success('复原成功！');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  const [isSortableOpen, setIsSortableOpen] = useState(false);
  // --------------------------------------------------------------------------------------------------------------------
  return (
    <div className="content-wrapper">
      <div className="content">
        <div className="tools">
          <Space size="middle">
            <Tooltip title={isShowSearch ? '隐藏搜索' : '显示搜索'}>
              <Switch
                onChange={onSearchChange}
                checkedChildren={<SearchOutlined />}
                unCheckedChildren={<SearchOutlined />}
              />
            </Tooltip>
            <Tooltip title="调整列顺序">
              <Button
                type="dashed"
                shape="round"
                size="small"
                icon={<SwapOutlined />}
                onClick={() => setIsSortableOpen(true)}
              />
            </Tooltip>
            <Tooltip title="复原列数据">
              <Button
                type="dashed"
                shape="round"
                size="small"
                icon={<RollbackOutlined />}
                onClick={() => refreshPage()}
              />
            </Tooltip>
          </Space>
        </div>
        <div className="search-wrapper" style={{ display: isShowSearch ? 'block' : 'none' }}>
          <Form form={formSearch} onFinish={onFinish}>
            <Row gutter="24">
              <Col span={8}>
                <Form.Item label="工位" name="workStation">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="包装条码" name="orderNumber">
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
                <Form.Item label="包装级别" name="packagingLevel">
                  <Input allowClear placeholder="请输入" />
                  {/* <Select
                    placeholder="请选择"
                    allowClear
                    showSearch
                    options={[{
                        label: '一级包装',
                        value: '0'
                      }, {
                        label: '二级包装',
                        value: '1'
                      }
                    ]}
                  /> */}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="满包数量" name="maxPackageQty">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="包装人" name="createBy">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="起止时间（开始）" name="createTimeStart">
                  {/* <Input allowClear placeholder="请输入" /> */}
                  <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="起止时间（结束）" name="createTimeEnd">
                  {/* <Input allowClear placeholder="请输入" /> */}
                  <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Space size="small">
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
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
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            {/* <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                showModal("create");
              }}
            >
              新增包装
            </Button> */}
            <Button type="primary" style={{ marginRight: 8 }} onClick={handleWarpperLevel1}>
              一级包装
            </Button>
            <Button type="primary" onClick={handleWarpperLevel2}>
              二级包装
            </Button>
          </div>
          <Table
            columns={resizableColumns}
            components={components}
            scroll={{ x: tableWidth }}
            rowKey={(record) => record.id}
            dataSource={data}
            pagination={tableParams.pagination}
            onChange={handleTableChange}
            loading={loading}
            bordered
            // expandable={{
            //   expandedRowRender,
            //   defaultExpandedRowKeys: ['0'],
            //   expandRowByClick: false,
            // }}
          />
        </div>
        <Modal
          title="新增/修改工单"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          confirmLoading={loadingOk}
          okButtonProps={{
            disabled: loadingUpload,
          }}
        >
          <Form
            labelCol={{ span: 6 }}
            form={formCreate}
            style={{ padding: 16, maxHeight: '60vh', overflow: 'scroll' }}
          >
            <Form.Item
              label="工位"
              name="workStation"
              rules={[
                {
                  required: true,
                  message: '请输入',
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
                  message: '请输入',
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
                  required: true,
                  message: '请输入',
                },
              ]}
            >
              <Input allowClear placeholder="请输入" />
            </Form.Item>

            <Form.Item
              label="产品料号"
              name="productCode"
              rules={[
                {
                  required: true,
                  message: '请输入',
                },
              ]}
            >
              <Input allowClear placeholder="请输入" />
            </Form.Item>

            <Form.Item
              label="包装级别"
              name="packagingLevel"
              rules={[
                {
                  required: true,
                  message: '请选择',
                },
              ]}
            >
              <Input allowClear placeholder="请输入" />
              {/* <Select
                placeholder="请选择"
                allowClear
                showSearch
                options={[{
                    label: '一级包装',
                    value: '1'
                  }, {
                    label: '二级包装',
                    value: '2'
                  },
                ]}
              /> */}
            </Form.Item>

            <Form.Item
              label="包装条码"
              name="orderNumber"
              rules={[
                {
                  required: true,
                  message: '请输入',
                },
              ]}
            >
              <Input allowClear placeholder="请输入" />
            </Form.Item>
          </Form>
        </Modal>
        {/* 拖拽组件 */}
        <Modal
          title="调整列顺序（拖动排序）"
          open={isSortableOpen}
          footer={null}
          onOk={() => setIsSortableOpen(false)}
          onCancel={() => setIsSortableOpen(false)}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={columns.filter((col) => !col.fixed).map((item) => item.key)}>
              <Row gutter={16}>
                {columns
                  .filter((col) => !col.fixed)
                  .map((item) => (
                    <Col key={item.key} span={8}>
                      <SortableItem id={item.key} content={item.title} isDraggable={!item?.fixed} />
                    </Col>
                  ))}
              </Row>
            </SortableContext>
          </DndContext>
        </Modal>
        <Modal
          title="新增/修改产品包装-条码"
          open={isModalOpen2}
          onOk={handleOk2}
          onCancel={handleCancel2}
          confirmLoading={loadingOk2}
        >
          <Form
            labelCol={{ span: 6 }}
            form={formCreate2}
            style={{ padding: 16, maxHeight: '60vh', overflow: 'scroll' }}
          >
            <Form.Item
              label="大板条码"
              extra="一级包装用"
              name="boardCode"
              rules={[
                {
                  required: false,
                  message: '请输入',
                },
              ]}
            >
              <Input allowClear placeholder="请输入" />
            </Form.Item>

            <Form.Item
              label="产品条码"
              extra="小板条码，一级包装用"
              name="panelCode"
              rules={[
                {
                  required: false,
                  message: '请输入',
                },
              ]}
            >
              <Input allowClear placeholder="请输入" />
            </Form.Item>

            <Form.Item
              label="包装条码"
              extra="外箱条码，二级包装起才会用到"
              name="packagingOrderNumber"
              rules={[
                {
                  required: false,
                  message: '请输入',
                },
              ]}
            >
              <Input allowClear placeholder="请输入" />
            </Form.Item>
          </Form>
        </Modal>
        <Drawer
          width="95vw"
          title="拆单（批量新增制令单）"
          onClose={onClose}
          open={open}
          closeIcon={false}
          maskClosable={false}
          extra={
            <Space>
              <Button onClick={onClose}>取消</Button>
              <Button type="primary" onClick={onSave}>
                保存
              </Button>
            </Space>
          }
        >
          <Form form={formCreate1} size="small">
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <table className="myTable">
                  <thead>
                    <tr>
                      <th>制令单号</th>
                      {/* <th>工单号</th> */}
                      {/* <th>制令单数量</th> */}
                      <th>投产数量</th>
                      {/* <th>完工数量</th> */}
                      {/* <th>产品名称</th> */}
                      {/* <th>产品料号</th> */}
                      {/* <th>产品版本</th> */}
                      {/* <th>工艺</th> */}
                      <th>产线</th>
                      <th>轨道（Lane）</th>
                      <th>产线CT</th>
                      {/* <th>面次</th> */}
                      <th>阶别</th>
                      <th>制令单状态</th>
                      <th style={{ width: 115 }}>实际投产时间</th>
                      <th style={{ width: 115 }}>实际完工时间</th>
                      {/* <th>创建日期</th> */}
                      {/* <th>计划投产日期</th> */}
                      {/* <th>计划完工日期</th> */}
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <tr>
                        <td>
                          <Form.Item
                            name={[name, 'orderNumber']}
                            rules={[{ required: true, message: '请输入制令单号' }]}
                            // initialValue={key + 1}
                          >
                            <Input placeholder="制令单号" />
                          </Form.Item>
                        </td>
                        {/* <td>
                        <Form.Item
                          name={[name, 'ruleDetailLength']}
                          rules={[{ required: true, message: '请输入长度' }]}
                        >
                          <Input placeholder="工单号" />
                        </Form.Item>
                      </td> */}
                        {/* <td>
                        <Form.Item
                          name={[name, 'wtf1']}
                          rules={[{ required: true, message: '请输入制令单数量' }]}
                        >
                          <Input placeholder="制令单数量" />
                        </Form.Item>
                      </td> */}
                        <td>
                          <Form.Item
                            name={[name, 'plannedQty']}
                            rules={[{ required: true, message: '请输入投产数量' }]}
                          >
                            <Input placeholder="投产数量" />
                          </Form.Item>
                        </td>
                        {/* <td>
                        <Form.Item
                          name={[name, 'rule']}
                          rules={[{ required: true, message: '请输入规则' }]}
                        >
                          <Input placeholder="完工数量" />
                        </Form.Item>
                      </td> */}
                        {/* <td>
                        <Form.Item
                          name={[name, 'remark']}
                          rules={[{ required: true, message: '请输入备注' }]}
                        >
                          <Input placeholder="产品名称" />
                        </Form.Item>
                      </td> */}
                        {/* <td>
                        <Form.Item
                          name={[name, 'remark']}
                          rules={[{ required: true, message: '请输入备注' }]}
                        >
                          <Input placeholder="产品料号" />
                        </Form.Item>
                      </td> */}
                        {/* <td>
                        <Form.Item
                          name={[name, 'remark']}
                          rules={[{ required: true, message: '请输入备注' }]}
                        >
                          <Input placeholder="产品版本" />
                        </Form.Item>
                      </td> */}
                        {/* <td>
                        <Form.Item
                          name={[name, 'wtf2']}
                          rules={[{ required: true, message: '请输入工艺' }]}
                        >
                          <Input placeholder="工艺" />
                        </Form.Item>
                      </td> */}
                        <td>
                          <Form.Item
                            name={[name, 'productionAreaId']}
                            rules={[{ required: true, message: '请输入产线' }]}
                          >
                            <Input placeholder="产线" />
                          </Form.Item>
                        </td>
                        <td>
                          <Form.Item
                            name={[name, 'lane']}
                            rules={[{ required: true, message: '请输入轨道（Lane）' }]}
                          >
                            <Input placeholder="轨道" />
                          </Form.Item>
                        </td>
                        <td>
                          <Form.Item
                            name={[name, 'cycleTime']}
                            rules={[{ required: true, message: '请输入产线CT' }]}
                          >
                            <Input placeholder="产线CT" />
                          </Form.Item>
                        </td>
                        {/* <td>
                        <Form.Item
                          name={[name, '面次是面别吗？']}
                          rules={[{ required: true, message: '请输入面次' }]}
                        >
                          <Input placeholder="面次" />
                        </Form.Item>
                      </td> */}
                        <td>
                          <Form.Item
                            name={[name, 'productionStage']}
                            rules={[{ required: true, message: '请输入阶别' }]}
                          >
                            <Input placeholder="阶别" />
                          </Form.Item>
                        </td>
                        <td>
                          <Form.Item
                            name={[name, 'status']}
                            rules={[{ required: true, message: '请输入制令单状态' }]}
                          >
                            <Select
                              placeholder="状态"
                              allowClear
                              showSearch
                              options={[
                                {
                                  label: '新建',
                                  value: 0,
                                },
                                {
                                  label: '投产',
                                  value: 1,
                                },
                                {
                                  label: '挂起',
                                  value: 2,
                                },
                                {
                                  label: '结单',
                                  value: 3,
                                },
                              ]}
                            />
                          </Form.Item>
                        </td>
                        <td>
                          <Form.Item
                            name={[name, 'actualProductionTime']}
                            rules={[{ required: true, message: '请输入实际投产时间' }]}
                          >
                            <DatePicker
                              placeholder="投产时间"
                              format="YYYY-MM-DD"
                              style={{ width: '100%' }}
                            />
                          </Form.Item>
                        </td>
                        <td>
                          <Form.Item
                            name={[name, 'actualCompletionDate']}
                            rules={[{ required: true, message: '请输入实际完工时间' }]}
                          >
                            <DatePicker
                              placeholder="完工时间"
                              format="YYYY-MM-DD"
                              style={{ width: '100%' }}
                            />
                          </Form.Item>
                        </td>
                        {/* <td>
                        <Form.Item
                          name={[name, 'createTime']}
                          rules={[{ required: true, message: '请输入备注' }]}
                        >
                          <Input placeholder="创建日期" />
                        </Form.Item>
                      </td> */}
                        {/* <td>
                        <Form.Item
                          name={[name, 'plannedProductionDate']}
                          rules={[{ required: true, message: '请输入备注' }]}
                        >
                          <Input placeholder="计划投产日期" />
                        </Form.Item>
                      </td> */}
                        {/* <td>
                        <Form.Item
                          name={[name, 'plannedCompletionDate']}
                          rules={[{ required: true, message: '请输入备注' }]}
                        >
                          <Input placeholder="计划完工日期" />
                        </Form.Item>
                      </td> */}
                        <td>
                          <Space>
                            <Typography.Link
                              onClick={() => {
                                handleDeleteItem(name, remove);
                              }}
                              style={{
                                wordBreak: 'break-word',
                                whiteSpace: 'nowrap',
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
                      <td colSpan={10} style={{ textAlign: 'center' }}>
                        <Button
                          onClick={() => {
                            add();
                          }}
                          type="dashed"
                          icon={<PlusOutlined />}
                        >
                          添加制令单
                        </Button>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </Form.List>
          </Form>
        </Drawer>
        <WrapperLevelOneDialog
          isModalOpen={warpperLevel1}
          onClose={() => setWarpperLevel1(false)}
        />
        <WrapperLevelTwoDialog
          isModalOpen={warpperLevel2}
          onClose={() => setWarpperLevel2(false)}
        />
      </div>
    </div>
  );
};

export default App;
