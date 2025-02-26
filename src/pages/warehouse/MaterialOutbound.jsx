import {
  ExclamationCircleFilled,
  FileExcelOutlined,
  PlusOutlined,
  RollbackOutlined,
  SearchOutlined,
  SwapOutlined,
  UploadOutlined,
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
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tooltip,
  Typography,
  Upload,
} from 'antd';
import dayjs from 'dayjs';
import qs from 'qs';
import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../../utils/api';
import { config } from '../../utils/config';
import http from '../../utils/http';
import { downloadCSV, getDictionaryListByCode } from '../../utils/util';
import WmsCount from './WmsCount';
const { TextArea } = Input;

const { confirm } = Modal;
let activeId = -1;
let activeId1 = -1;
const App = () => {
  const [isShowSearch, setIsShowSearch] = useState(false);
  const onSearchChange = (checked) => {
    console.log(`switch to ${checked}`);
    setIsShowSearch(checked);
  };

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
  const [loading, setLoading] = useState(false);
  const [formCreate] = Form.useForm();
  const [formSearch] = Form.useForm();
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([
    {
      title: '出库单',
      dataIndex: 'outboundOrderNumber',
      key: 'outboundOrderNumber',
      width: 100,
    },
    {
      title: '制令单',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text, record) => <span color="blue">{record.prodProductionOrder.orderNumber}</span>,
      width: 130,
    },
    {
      title: '产线',
      dataIndex: 'productionAreaNameProcess',
      key: 'productionAreaNameProcess',
      render: (text, record) => (
        <span color="blue">{record.prodProductionOrder.productionAreaNameProcess}</span>
      ),
      width: 100,
    },
    {
      title: '出库日期',
      dataIndex: 'outboundDate',
      key: 'outboundDate',
      width: 100,
    },
    {
      title: '发料人',
      dataIndex: 'issuer',
      key: 'issuer',
      width: 100,
    },
    {
      title: '领料人',
      dataIndex: 'receiver',
      key: 'receiver',
      width: 100,
    },
    {
      title: '确认人',
      dataIndex: 'approver',
      key: 'approver',
      width: 100,
    },
    {
      title: '创建日期',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (_, record) => {
        return dayjs(_).format('YYYY-MM-DD');
      },
      width: 130,
    },
    {
      title: '出库单状态',
      dataIndex: 'outboundStatus',
      key: 'outboundStatus',
      render: (_, record) => {
        return record.outboundStatus === 0
          ? '新增'
          : record.outboundStatus === 1
          ? '确认'
          : '出库中';
      },
      width: 130,
    },
    {
      title: '出库类型',
      dataIndex: 'outboundType',
      key: 'outboundType',
      render: (_, record) => {
        return record.outboundType === 1
          ? '产线领料'
          : record.outboundType === 2
          ? '维修领料'
          : record.outboundType === 3
          ? '退供应商'
          : '产品制样';
      },
      width: 100,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      fixed: 'right',
      render: (_, record) => {
        return (
          <Space>
            <Typography.Link onClick={() => showCommonModal('create', record)}>
              录入
            </Typography.Link>
            <Typography.Link onClick={() => showModal('update', record)}>修改</Typography.Link>
            <Typography.Link onClick={() => del(record)}>删除</Typography.Link>
            <Typography.Link onClick={() => removeShelf(record)}>下架</Typography.Link>
            <Typography.Link onClick={() => showCommonModal('reissue', record)}>
              补发
            </Typography.Link>
            <Typography.Link onClick={() => showCommonModal('scan', record)}>扫描</Typography.Link>
            <Typography.Link onClick={() => outConfirm(record)}>确认</Typography.Link>
          </Space>
        );
      },
    },
  ]);
  const removeShelf = (record) => {
    confirm({
      title: '下架确认',
      icon: <ExclamationCircleFilled />,
      content: '请确认是否下架?',
      onOk() {
        http
          .del(
            config.API_PREFIX + 'outbound/order/takenOffShelves?outboundOrderId=' + `${record?.id}`,
            {},
          )
          .then((res) => {
            fetchData();
            message.success('下架成功！');
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
  const del = (record) => {
    confirm({
      title: '删除确认',
      icon: <ExclamationCircleFilled />,
      content: '删除后无法恢复，请确认是否删除！',
      onOk() {
        console.log('OK');
        http
          .del(config.API_PREFIX + 'outbound/order' + `/${record?.id}`, {})
          .then((res) => {
            fetchData();
            message.success('删除成功！');
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

  const del2 = (record) => {
    confirm({
      title: '删除确认',
      icon: <ExclamationCircleFilled />,
      content: '删除后无法恢复，请确认是否删除！',
      onOk() {
        console.log('OK');
        http
          .del(config.API_PREFIX + 'outbound/order/detail' + `/${record?.id}`, {})
          .then((res) => {
            fetchData();
            message.success('删除成功！');
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  // 生成单号
  const getAddOrder = () => {
    http
      .get(config.API_PREFIX + 'outbound/order/generateOrderNumber', {})
      .then((res) => {
        formCreate.setFieldValue('outboundOrderNumber', res.bizData || '');
      })
      .catch((err) => {});
  };
  //打开出库单
  const showModal = (action, record, confirm) => {
    if (action === 'update' && record) {
      const {
        id,
        outboundOrderNumber,
        prodProductionOrderId,
        issuer,
        receiver,
        outboundType,
        remark,
      } = record;
      activeId = id;
      formCreate.setFieldsValue({
        outboundStatus: confirm ? 1 : 0, //入库状态(0:新增 1:确认)
        outboundOrderNumber,
        prodProductionOrderId,
        issuer,
        receiver,
        outboundType,
        remark,
      });
    } else {
      activeId = -1;
      formCreate.resetFields();
      //新增窗口打开就去调用生成单号接口， 返回成功并且给了单号就用，没单号就手输入就行
      getAddOrder();
    }
    setIsModalOpen(true);
  };

  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const handlePrint = (action, record) => {
    console.log('recordrecordrecord', record);
    activeId1 = record.id;
    setSelectedDetailRow(record);
    setIsModalOpen1(true);
  };
  //新增/修改出库单保存
  const handleOk = () => {
    formCreate
      .validateFields()
      .then((values) => {
        console.log('values', values);
        setLoadingOk(true);
        const {
          outboundOrderNumber,
          prodProductionOrderId,
          issuer,
          receiver,
          outboundType,
          remark,
        } = values;
        let params = {
          outboundOrderNumber,
          prodProductionOrderId,
          issuer,
          receiver,
          outboundType,
          remark,
          filePath: upLoadUrl || '',
        };
        let action = null;
        let msg = '';
        let apiUrl = '';
        console.log('activeId', activeId);
        if (activeId !== -1) {
          action = http.post;
          apiUrl = `${config.API_PREFIX}outbound/order`;
          params.id = activeId;
          msg = '修改成功！';
        } else {
          action = http.post;
          apiUrl = `${config.API_PREFIX}outbound/order`;
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

  const handleCancel = () => {
    setIsModalOpen(false);
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

  const [tableParams, setTableParams] = useState({ ...paginationInit });

  // 获取制令单列表
  const [prodproductionorder, setProdproductionorder] = useState([]);
  const getProdproductionorder = () => {
    http
      .post(config.API_PREFIX + 'prodproductionorder/page', {
        current: 1,
        size: 10000,
      })
      .then((res) => {
        let data = res?.bizData?.records;
        data = data.map((item) => {
          return {
            label: item.orderNumber,
            value: item.id,
          };
        });
        setProdproductionorder(data);
      })
      .catch((err) => {});
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
    getProdproductionorder();
    getDictBaseFwa();
  }, []);
  useEffect(() => {
    fetchData();
    console.log('JSON.stringify(tableParams)]', JSON.stringify(tableParams));
  }, [
    tableParams.pagination?.current,
    tableParams.pagination?.pageSize,
    tableParams?.columnKey,
    tableParams?.order,
  ]);
  const [WmsCountData, setWmsCountData] = useState();
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
      outboundOrderNumber,
      prodProductionOrderId,
      areaId,
      itemCode,
      MaterialUid,
      receiver,
      issuer,
      outboundType,
      startTime,
      endTime,
    } = formSearch.getFieldsValue();
    if (outboundOrderNumber) {
      params.outboundOrderNumber = outboundOrderNumber;
    }
    if (prodProductionOrderId) {
      params.prodProductionOrderId = prodProductionOrderId;
    }
    if (areaId) {
      params.areaId = areaId;
    }
    if (itemCode) {
      params.childItemCode = itemCode;
    }
    if (MaterialUid) {
      params.childMaterialUid = MaterialUid;
    }
    if (issuer) {
      params.issuer = issuer;
    }
    if (receiver) {
      params.receiver = receiver;
    }
    if (outboundType) {
      params.outboundType = outboundType;
    }
    // if (typeof lotNo === "number") {
    //   params.lotNo = lotNo;
    // }
    if (startTime) {
      params.createTimeStart = startTime.format('YYYY-MM-DD 00:00:00');
    }
    if (endTime) {
      params.createTimeEnd = endTime.format('YYYY-MM-DD 00:00:00');
    }
    setWmsCountData(params);
    http
      .get(config.API_PREFIX + 'outbound/order/page', params)
      .then((res) => {
        console.log('res', res);
        const data = res?.bizData;

        setData(data?.records || []);
        setLoading(false);
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
    console.log('tableParams1', tableParams);

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData([]);
    }
  };
  // 展开的子集
  const expandedRowRender = (record) => {
    console.log('record', record.details);
    const columns1 = [
      {
        title: '料盘UID',
        dataIndex: 'materialUid',
        key: 'materialUid',
      },
      {
        title: '料号',
        dataIndex: 'itemCode',
        key: 'itemCode',
      },
      {
        title: '供应商料号',
        dataIndex: 'supplierItemCode',
        key: 'supplierItemCode',
      },
      {
        title: '物料描述',
        dataIndex: 'materialDescription',
        key: 'materialDescription',
      },
      {
        title: '批次号',
        dataIndex: 'lotNo',
        key: 'lotNo',
      },
      {
        title: '包装数量',
        dataIndex: 'packageQty',
        key: 'packageQty',
      },
      {
        title: '出库数量',
        dataIndex: 'outboundQty',
        key: 'outboundQty',
      },
      {
        title: 'DateCode',
        dataIndex: 'dateCode',
        key: 'dateCode',
      },
      {
        title: '物料类型',
        dataIndex: 'itemCategory',
        key: 'itemCategory',
      },
      {
        title: 'MSL',
        dataIndex: 'msl',
        key: 'msl',
      },
      {
        title: '有效期',
        dataIndex: 'expirationDate',
        key: 'expirationDate',
      },
      {
        title: '库位',
        dataIndex: 'storageLocation',
        key: 'storageLocation',
      },
      {
        title: '创建日期',
        dataIndex: 'createTime',
        key: 'createTime',
      },
      {
        title: '操作员',
        dataIndex: 'updateBy',
        key: 'updateBy',
      },
      {
        title: '发料类别',
        dataIndex: 'issueCategory',
        key: 'issueCategory',
      },
      {
        title: '扫描确认',
        dataIndex: 'scanConfirmed',
        key: 'scanConfirmed',
      },
      {
        title: '操作',
        key: 'operation',
        fixed: 'right',
        render: (_, record) => {
          return (
            <Space>
              <Typography.Link onClick={() => handlePrint('update', record)}>截料</Typography.Link>
              <Typography.Link onClick={() => del2(record)}>删除</Typography.Link>
            </Space>
          );
        },
      },
    ];
    return (
      <Table
        columns={columns1}
        dataSource={record?.details || []}
        pagination={false}
        size="small"
        scroll={{ x: 'max-content' }}
        bordered
        style={{ margin: '10px 10px 10px 0' }}
        className="custom-table"
      />
    );
  };
  // 上传下载相关
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const loadTemplate = () => {
    setLoadingDownload(true);
    http
      .post(config.API_PREFIX + 'outbound/order/downloadTemplate', {})
      .then((res) => {
        downloadCSV(res, '上料表导入模板-CSV文件');
        message.success('下载成功！');
        setLoadingDownload(false);
      })
      .catch((err) => {
        console.log(err);
        message.error('下载失败！');
        setLoadingDownload(false);
      });
  };
  const [upLoadUrl, setUpLoadUrl] = useState('');
  const handleCustomRequest = ({ file, onSuccess, onError }) => {
    setLoadingUpload(true);
    // 创建一个 FormData 对象，用于构建包含文件的请求
    const formData = new FormData();
    formData.append('file', file);

    http
      .post(config.API_PREFIX + 'common/upload/fileCSV', formData)
      .then((res) => {
        setUpLoadUrl(res?.bizData?.url || '');
        message.success('导入成功！');
        onSuccess(); // 通知 Ant Design Upload 组件上传成功
        setLoadingUpload(false);
        fetchData();
      })
      .catch((err) => {
        console.log(err);
        message.error('导入失败！');
        onError();
        setLoadingUpload(false);
      });
  };
  const outConfirm = (record) => {
    confirm({
      title: '确认',
      icon: <ExclamationCircleFilled />,
      content: '是否确认出库单？',
      onOk() {
        http
          .get(
            config.API_PREFIX +
              `outbound/order/confirm` +
              `?${qs.stringify({
                outboundOrderId: record.id,
              })}`,
            {},
          )
          .then((res) => {
            message.success('操作成功');
            fetchData();
          })
          .catch((err) => {});
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  // 弹窗组件
  const [isCommonModal, setIsCommonModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState([]);
  const [selectedAction, setSelectedAction] = useState('');
  const showCommonModal = (action, record, confirm) => {
    console.log(action, record, confirm);
    if (action === 'reissue') {
      if (record.outboundStatus == 2) {
        message.warning('出库中的出库单不允许补发！');
        return;
      }
    }
    if (action === 'create') {
      if (record.outboundStatus == 1) {
        message.warning('确认状态的出库单不允许录入！');
        return;
      }
    }
    setSelectedAction(action);
    setSelectedRow(record);
    setIsCommonModal(true);
  };
  const hideCommonModal = () => {
    setIsCommonModal(false);
  };

  // 截料
  const [selectedDetailRow, setSelectedDetailRow] = useState({});

  // --------------------------------------------------------------------------------------------------------------------
  const { components, resizableColumns, tableWidth, resetColumns } = useAntdResizableHeader({
    columns: useMemo(() => columns, [columns]),
    columnsState: {
      persistenceKey: 'localKeyMaterialInbound',
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
    localStorage.setItem('columnsMaterialOutbound', JSON.stringify(columns.map((col) => col.key)));
  };

  useEffect(() => {
    const savedOrder = localStorage.getItem('columnsMaterialOutbound');
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
    localStorage.removeItem('columnsMaterialOutbound');
    message.success('复原成功！');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  const [isSortableOpen, setIsSortableOpen] = useState(false);
  // --------------------------------------------------------------------------------------------------------------------
  return (
    <div className="content-wrapper  flex flex-col">
      <div className="content h-auto">
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
                <Form.Item label="出库单" name="outboundOrderNumber">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="制令单" name="prodProductionOrderId">
                  <Select
                    placeholder="请选择"
                    allowClear
                    showSearch
                    options={prodproductionorder}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="产线" name="areaId">
                  <Select
                    placeholder="请选择"
                    allowClear
                    options={dictBaseFwa?.area?.map((item) => ({
                      value: item.dictKey,
                      label: item.dictValue,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="料号" name="itemCode">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="原材UID" name="MaterialUid">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="领料人" name="receiver">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="发料人" name="issuer">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="出库类型" name="outboundType">
                  {/* 出库类型（1：产线领料、2：维修领料、3：退供应商、4：产品制样） */}
                  <Select
                    placeholder="请选择"
                    allowClear
                    showSearch
                    options={[
                      {
                        label: '产线领料',
                        value: 1,
                      },
                      {
                        label: '维修领料',
                        value: 2,
                      },
                      {
                        label: '退供应商',
                        value: 3,
                      },
                      {
                        label: '产品制样',
                        value: 4,
                      },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="出库日期（开始）" name="startTime">
                  <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="出库日期（结束）" name="endTime">
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
        <div className="table-wrapper  h-[40vh] overflow-auto">
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                showModal('create');
              }}
            >
              新增出库单
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
            expandable={{
              expandedRowRender,
              defaultExpandedRowKeys: ['0'],
              expandRowByClick: false,
            }}
          />
        </div>

        {/* 汇总方式 */}
        <WmsCount type={2} WmsCountData={WmsCountData} className=" h-[40vh]" />
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
        {/* 新增/修改出库单 */}
        <Modal
          title="新增/修改出库单"
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
              label="出库单"
              name="outboundOrderNumber"
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
              label="制令单"
              name="prodProductionOrderId"
              rules={[
                {
                  required: true,
                  message: '请输入',
                },
              ]}
            >
              <Select placeholder="请选择" allowClear showSearch options={prodproductionorder} />
            </Form.Item>

            <Form.Item
              label="发料人"
              name="issuer"
              rules={[
                {
                  required: false,
                  message: '请输入',
                },
              ]}
            >
              <Select
                placeholder="请选择"
                allowClear
                showSearch
                optionFilterProp="label"
                filterSort={(optionA, optionB) =>
                  (optionA?.label ?? '')
                    .toLowerCase()
                    .localeCompare((optionB?.label ?? '').toLowerCase())
                }
                options={getDictionaryListByCode('发料人')}
              />
            </Form.Item>

            <Form.Item
              label="领料人"
              name="receiver"
              rules={[
                {
                  required: false,
                  message: '请输入',
                },
              ]}
            >
              <Select
                placeholder="请选择"
                allowClear
                showSearch
                optionFilterProp="label"
                filterSort={(optionA, optionB) =>
                  (optionA?.label ?? '')
                    .toLowerCase()
                    .localeCompare((optionB?.label ?? '').toLowerCase())
                }
                options={getDictionaryListByCode('领料人')}
              />
            </Form.Item>

            <Form.Item label="上料表" name="quantity">
              <Space size="small">
                <Button
                  loading={loadingDownload}
                  onClick={loadTemplate}
                  type="dashed"
                  htmlType="button"
                  icon={<FileExcelOutlined />}
                >
                  下载模板
                </Button>
                <Upload
                  maxCount={1}
                  customRequest={handleCustomRequest} // 自定义上传逻辑
                  showUploadList={false} // 隐藏默认的文件列表
                >
                  <Button
                    loading={loadingUpload}
                    type="dashed"
                    htmlType="button"
                    icon={<UploadOutlined />}
                  >
                    导入
                  </Button>
                </Upload>
              </Space>
            </Form.Item>
            <Form.Item
              label="出库类型"
              name="outboundType"
              rules={[
                {
                  required: true,
                  message: '请选择',
                },
              ]}
            >
              {/* 出库类型（1：产线领料、2：维修领料、3：退供应商、4：产品制样） */}
              <Select
                placeholder="请选择"
                allowClear
                showSearch
                options={[
                  {
                    label: '产线领料',
                    value: 1,
                  },
                  {
                    label: '维修领料',
                    value: 2,
                  },
                  {
                    label: '退供应商',
                    value: 3,
                  },
                  {
                    label: '产品制样',
                    value: 4,
                  },
                ]}
              />
            </Form.Item>
            <Form.Item
              label="备注"
              name="remark"
              rules={[
                {
                  required: false,
                  message: '请输入',
                },
              ]}
            >
              <TextArea allowClear placeholder="请输入" />
            </Form.Item>
          </Form>
        </Modal>
        {/* 条码打印弹窗 */}
        <UIDprint
          isModalOpen1={isModalOpen1}
          selectedDetailRow={selectedDetailRow}
          onChange={() => {
            setIsModalOpen1(false);
          }}
        />
        {/* 录入 下架 补发 扫描 */}
        <CommonModal
          isCommonModal={isCommonModal}
          selectedRow={selectedRow}
          selectedAction={selectedAction}
          onClose={() => {
            hideCommonModal();
          }}
        />
      </div>
    </div>
  );
};

// 条码打印
const UIDprint = (props) => {
  const { isModalOpen1, onChange, selectedDetailRow } = props;
  const [loadingOk1, setLoadingOk1] = useState(false);
  const [formCreate1] = Form.useForm();
  const QTYRef = useRef(null);
  const [nowData, setNowData] = useState({});
  const [supplierlList, setSupplierlList] = useState([]);
  useEffect(() => {
    formCreate1.setFieldsValue({
      materialUid: selectedDetailRow?.materialUid,
      itemCode: selectedDetailRow?.itemCode,
      supplier: selectedDetailRow?.supplier,
      supplierItemCode: selectedDetailRow?.supplierItemCode,
      packageQty: selectedDetailRow?.outboundQty,
      qty: '', // 截取数量
      msl: selectedDetailRow?.msl,
      shelfLife: selectedDetailRow?.shelfLife,
      productionDate: dayjs(selectedDetailRow?.productionDate),
      expirationDate: dayjs(selectedDetailRow?.expirationDate),
      lotNo: selectedDetailRow?.lotNo,
      dateCode: selectedDetailRow?.dateCode,
      generateQty: selectedDetailRow?.generateQty,
    });
    fetchData2();
  }, [selectedDetailRow]);
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
          resove(res1);
        })
        .catch((err) => {
          setLoadingOk1(false);
          console.log(err);
          reject(err);
        });
    });
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
  // 截料后拿到数据-打印
  const handleOk1 = () => {
    formCreate1
      .validateFields()
      .then((values) => {
        console.log('values', values);
        values.productionDate = dayjs(values.productionDate).format('YYYY-MM-DD HH:mm:ss');
        values.expirationDate = dayjs(values.expirationDate).format('YYYY-MM-DD HH:mm:ss');
        setLoadingOk1(true);
        const {
          itemCode,
          supplierItemCode,
          qty,
          productionDate,
          expirationDate,
          lotNo,
          dateCode,
          generateQty,
          msl,
          packageQty,
        } = values;
        console.log('productionDate', productionDate);
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
          generateQty,
        };
        // 截料接口
        http
          .post(
            `${config.API_PREFIX}outbound/order/cutOff` +
              `?${qs.stringify({
                outboundOrderMaterialDetailsId: selectedDetailRow.id,
                cutOffQty: formCreate1.getFieldValue('qty'),
              })}`,
            {},
          )
          .then(async (res) => {
            console.log('bizData', res?.bizData);
            // let bizData = res?.bizData.split("/");
            let bizData = [res?.bizData];
            if (bizData.length) {
              for (let i = 0; i < bizData.length; i++) {
                try {
                  const printData = await getPrintData(bizData[i], params);

                  myDesign(printData.bizData);

                  // @luck 我感觉还是调用两次比较好，中间间隔3s或者5s
                  await new Promise((resolve) => setTimeout(resolve, 5000));
                } catch (err) {
                  console.error(err, '生成打印数据或打印异常！');
                  // message.error("生成打印数据或打印异常！");
                }
              }
              formCreate1.resetFields();
              formCreate1.setFieldsValue({ generateQty: 1 });
              formCreate1.setFieldsValue({ productionDate: dayjs() });
              setLoadingOk1(false);
              message.success('操作成功！');
              onChange();
              setTimeout(() => {
                QTYRef.current.focus();
              }, 500);
            }
          })
          .catch((err) => {
            setLoadingOk1(false);
            console.log(err);
          });
      })
      .catch((error) => {
        console.log('Form validation error:', error);
      });
  };
  const handleCancel1 = () => {
    onChange();
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
    let month = (1 + date.getMonth()).toString().padStart(2, '0'); // 月份从0开始，所以需要+1
    let day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  // 这里不用扫描了，直接调用拿打印模板id
  const fetchData2 = () => {
    let itemCode = formCreate1.getFieldValue('itemCode');
    let supplierItemCode = formCreate1.getFieldValue('supplierItemCode');
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
          // formCreate1.setFieldsValue({
          //   itemCode: item.itemCode,
          //   supplierItemCode: item.supplierItemCode,
          //   supplier: item.supplier,
          //   packageQty: item.packageQty,
          //   msl: item.msl,
          //   shelfLife: item.shelfLife,
          // });

          // handleProductionDateChange();
        }
        // setTimeout(() => {
        //   QTYRef.current.focus();
        // }, 500);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  //选择供应商填充数据
  const fillInOtherFields = (record) => {
    console.log('record', record);
    supplierlList.forEach((item) => {
      console.log('item.itemCode', item.itemCode);
      if (item.supplier == record) {
        console.log('item.itemCode', item.itemCode);
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
  // 处理生产日期的变化获取结束日期
  const handleProductionDateChange = () => {
    // 处理生产日期的逻辑
    try {
      let data1 = formCreate1.getFieldValue('productionDate');
      data1 = new Date(data1.format('YYYY-MM-DD'));
      let data2 = formCreate1.getFieldValue('shelfLife');
      if (data1 && data2) {
        let endDate = addDaysToDate(data1, Number(data2));
        formCreate1.setFieldValue('expirationDate', dayjs(endDate));
        console.log(dayjs(endDate));
      }
    } catch (error) {}
  };
  return (
    <Modal
      title="UID截料"
      open={isModalOpen1}
      onOk={handleOk1}
      onCancel={handleCancel1}
      confirmLoading={loadingOk1}
      okText="截料"
    >
      <Form
        labelCol={{ span: 6 }}
        form={formCreate1}
        style={{ padding: 16, maxHeight: '60vh', overflow: 'scroll' }}
      >
        <Form.Item
          label="原材UID"
          name="materialUid"
          rules={[
            {
              required: false,
              message: '请输入',
            },
          ]}
        >
          <Input allowClear onPressEnter={fetchData2} placeholder="请输入" disabled />
        </Form.Item>
        <Form.Item
          label="料号"
          name="itemCode"
          rules={[
            {
              required: false,
              message: '请输入',
            },
          ]}
        >
          <Input allowClear onPressEnter={fetchData2} placeholder="请输入" disabled />
        </Form.Item>

        <Form.Item
          label="供应商"
          name="supplier"
          rules={[
            {
              required: false,
              message: '请输入',
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
            disabled
          />
        </Form.Item>

        <Form.Item
          label="供应商料号"
          name="supplierItemCode"
          rules={[
            {
              required: false,
              message: '请输入',
            },
          ]}
        >
          <Input allowClear onPressEnter={fetchData2} placeholder="请输入" disabled />
        </Form.Item>

        <Form.Item
          label="原始数量"
          name="packageQty"
          rules={[
            {
              required: false,
              message: '请输入',
            },
          ]}
        >
          <Input allowClear placeholder="" disabled />
        </Form.Item>

        <Form.Item
          label="截取数量"
          name="qty"
          rules={[
            {
              required: true,
              message: '请输入',
            },
          ]}
        >
          <InputNumber
            ref={QTYRef}
            style={{ width: '100%' }}
            allowClear
            placeholder="请输入"
            onPressEnter={handleOk1}
          />
        </Form.Item>

        <Form.Item
          label="MSL"
          name="msl"
          rules={[
            {
              required: false,
              message: '请输入',
            },
          ]}
        >
          <Input allowClear placeholder="" disabled />
        </Form.Item>

        <Form.Item
          label="有效期"
          name="shelfLife"
          rules={[
            {
              required: false,
              message: '请输入',
            },
          ]}
        >
          <Input allowClear onBlur={handleProductionDateChange} placeholder="" disabled />
        </Form.Item>

        <Form.Item
          label="生产日期"
          name="productionDate"
          rules={[
            {
              required: false,
              message: '请输入',
            },
          ]}
        >
          {/* <Input allowClear placeholder="请输入" /> */}
          <DatePicker
            format="YYYY-MM-DD"
            onChange={handleProductionDateChange}
            style={{ width: '100%' }}
            disabled
          />
        </Form.Item>

        <Form.Item
          label="过期日期"
          name="expirationDate"
          rules={[
            {
              required: false,
              message: '请输入',
            },
          ]}
        >
          {/* <Input allowClear placeholder="请输入" /> */}
          <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} disabled />
        </Form.Item>

        <Form.Item
          label="批次号"
          name="lotNo"
          rules={[
            {
              required: false,
              message: '请输入',
            },
          ]}
        >
          <Input allowClear placeholder="请输入" disabled />
        </Form.Item>

        <Form.Item
          label="DateCode"
          name="dateCode"
          rules={[
            {
              required: false,
              message: '请输入',
            },
          ]}
        >
          <Input allowClear placeholder="请输入" disabled />
        </Form.Item>

        <Form.Item
          label="份数"
          name="generateQty"
          rules={[
            {
              required: false,
              message: '请输入',
            },
          ]}
        >
          <InputNumber style={{ width: '100%' }} allowClear placeholder="请输入" disabled />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// 录入
const CommonModal = (props) => {
  //selectedAction create 录入   reissue补发 scan扫描
  const { isCommonModal, selectedAction, selectedRow, onClose } = props;
  const [form] = Form.useForm();
  const options = {
    create: '录入',
    reissue: '补发',
    scan: '扫描',
  };
  const onCancel = () => {
    onClose();
  };
  const onFinish = () => {
    form
      .validateFields()
      .then((values) => {
        console.log(values);
        if (selectedAction === 'create' || selectedAction === 'scan') {
          let url = '';
          if (selectedAction === 'create') {
            url = `outbound/order/write`;
            //确认状态的出库单可以执行“补发”。不允许录入
            if (selectedRow.outboundStatus === 1) {
              message.warning('出库单已确认不允许录入');
              return;
            }
          } else if (selectedAction === 'scan') {
            url = `outbound/order/scan`;
          }

          http
            .get(
              config.API_PREFIX +
                url +
                `?${qs.stringify({
                  uid: form.getFieldValue('materialsUID'),
                  outboundOrderId: selectedRow.id,
                })}`,
              {},
            )
            .then((res) => {
              form.resetFields();
              message.success('操作成功');
              setTimeout(() => {
                materialsUIDRef.current.focus();
              }, 1000);
            })
            .catch((err) => {});
        }
        if (selectedAction === 'reissue') {
          http
            .get(
              config.API_PREFIX +
                `outbound/order/reissue` +
                `?${qs.stringify({
                  uid: selectedRow.id,
                  outboundOrderId: form.getFieldValue('materialsUID'),
                  qty: form.getFieldValue('qty'),
                  itemCode: form.getFieldValue('itemCode'),
                })}`,
              {},
            )
            .then((res) => {
              form.resetFields();
              message.success('操作成功');
            })
            .catch((err) => {});
        }
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };
  const materialsUIDRef = useRef(null);
  return (
    <Modal
      open={isCommonModal}
      title={options[selectedAction]}
      okText="确认"
      cancelText="取消"
      onCancel={() => {
        onCancel();
      }}
      onOk={() => {
        onFinish();
      }}
    >
      <Form
        form={form}
        layout="vertical"
        labelCol={{ span: 6 }}
        style={{ padding: 16, maxHeight: '60vh', overflow: 'scroll' }}
        autoComplete="off"
      >
        {selectedAction == 'reissue' && (
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: '1',
                label: '原材UID',
                children: (
                  <Form.Item
                    label="原材UID"
                    name="materialsUID"
                    rules={[
                      {
                        required: true,
                        message: '请输入',
                      },
                    ]}
                  >
                    <Input allowClear placeholder="请输入" />
                  </Form.Item>
                ),
              },
              {
                key: '2',
                label: '原材料号',
                children: (
                  <>
                    <Form.Item
                      label="原材料号"
                      name="itemCode"
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
                      label="原材数量"
                      name="qty"
                      rules={[
                        {
                          required: true,
                          message: '请输入',
                        },
                      ]}
                    >
                      <Input allowClear placeholder="请输入" />
                    </Form.Item>
                  </>
                ),
              },
            ]}
          />
        )}
        {(selectedAction === 'create' ||
          selectedAction === 'scan' ||
          selectedAction === 'confirm') && (
          <Form.Item
            label="原材UID"
            name="materialsUID"
            rules={[
              {
                required: true,
                message: '请输入',
              },
            ]}
          >
            <Input
              ref={materialsUIDRef}
              allowClear
              placeholder="请输入"
              onPressEnter={() => onFinish()}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};
export default App;
