import { Button, Col, Form, Input, message, Row, Select, Switch, Tabs, Tree } from 'antd';
import qs from 'qs';
import React, { useEffect, useState } from 'react';
import SwitchNumber from '../components/SwitchNumber';
import api from '../utils/api';
import { config } from '../utils/config';
import http from '../utils/http';
import { getDictionaryListByCode } from '../utils/util';
const App = () => {
  const onChange = (key) => {
    console.log(key);
  };

  const items = [
    {
      key: 'StorageLocation',
      label: '储存位置',
      children: <StorageLocation />,
    },
    {
      key: 'PutIn',
      label: '入库',
      children: <PutIn />,
    },
    {
      key: 'PutOut',
      label: '出库',
      children: <PutOut />,
    },
    {
      key: 'IntelligentShelves',
      label: '智能货架',
      children: <IntelligentShelves />,
    },
  ];

  return (
    <div className="content">
      <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
    </div>
  );
};
// 储存位置
const StorageLocation = () => {
  const [StorageLocationFrom] = Form.useForm();
  const [treeList, setTreeList] = React.useState([]);
  const [shelvesList, setShelvesList] = React.useState([]);
  const getTreeList = () => {
    http
      .post(config.API_PREFIX + 'storage/location/list/tree', {})
      .then((res) => {
        // let res1 = {
        //   bizData: {
        //     id: -1,
        //     children: [
        //       {
        //         id: 1,
        //         parentId: -1,
        //         weight: null,
        //         name: "A1",
        //         isValidated: 1,
        //         code: "A1",
        //         rackType: "YLZGYHJ",
        //         children: [
        //           {
        //             id: 2,
        //             parentId: 1,
        //             weight: null,
        //             name: "A2",
        //             isValidated: 1,
        //             code: "A2",
        //             rackType: "YLZGYHJ",
        //             children: [
        //               {
        //                 id: 3,
        //                 parentId: 2,
        //                 weight: null,
        //                 name: "A3",
        //                 isValidated: 1,
        //                 code: "A3",
        //                 rackType: "YLZGYHJ",
        //               },
        //             ],
        //           },
        //         ],
        //       },
        //     ],
        //     name: "库位",
        //     parentId: -1,
        //     weight: 0,
        //   },
        //   respCode: "200",
        //   respMsg: "成功",
        // };
        console.log(res?.bizData);
        setTreeList(res?.bizData?.children || []);
      })
      .catch((err) => {});
  };
  useEffect(() => {
    getTreeList();
    StorageLocationFrom.setFieldsValue({
      code: '',
      rackType: '普通货架',
      locations: '',
      storageType: '良品仓',
      isValidated: false,
    });

    // 获取货架列表
    http
      .post(config.API_PREFIX + 'dict/intelligent/shelves', {})
      .then((res) => {
        setShelvesList(
          res?.bizData?.map((item) => {
            return {
              label: item.fieldName,
              value: item.fieldName,
            };
          }) || [],
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  const [selectNode, setSelectNode] = useState(null);
  const onSelect = (selectedKeys, info) => {
    console.log('selected', selectedKeys, info);

    setSelectNode(info.node);
    StorageLocationFrom.setFieldValue('rackType', info.node.rackType);
    StorageLocationFrom.setFieldValue('code', info.node.code);
    StorageLocationFrom.setFieldValue('locations', '');
    if (info.node.isValidated == 0) {
      StorageLocationFrom.setFieldValue('isValidated', false);
    } else {
      StorageLocationFrom.setFieldValue('isValidated', true);
    }
  };
  const onCheck = (checkedKeys, info) => {
    console.log('onCheck', checkedKeys, info);
  };
  const onFinish = (values) => {
    console.log('Success:', values);
  };
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  const addTree = (type) => {
    StorageLocationFrom.validateFields()
      .then((values) => {
        // console.log("values", values);
        // console.log("selectNode", selectNode);
        // console.log(StorageLocationFrom.getFieldsValue());
        let {
          code,
          rackType,
          locations,
          storageType,
          isValidated = 0,
        } = StorageLocationFrom.getFieldsValue();
        if (!isValidated) {
          isValidated = 0;
        } else {
          isValidated = 1;
        }
        let params = {};

        //1 添加同级节点
        if (type == 1) {
          params = {
            id: selectNode?.id,
            parentId: selectNode?.parentId || -1, //如果是添加同级节点，则传父节点id
            // locations: undefined,  //如果是添加 接口别传locations
            isValidated: isValidated,
            rackType: rackType,
            code: locations, //code,
            storageType: storageType,
            localOrChild: 1,
          };
        }
        //2 添加子节点
        if (type == 2) {
          params = {
            parentId: selectNode?.id, //如果是添加同级节点，则传父节点id
            locations: locations, //添加子项传locations
            isValidated: isValidated,
            rackType: rackType,
            code: code,
            storageType: storageType,
            localOrChild: 2,
          };
        }
        // 3 编辑
        if (type == 3) {
          params = {
            Id: selectNode?.id,
            locations: locations,
            isValidated: isValidated,
            rackType: rackType,
            code: code,
            storageType: storageType,
            localOrChild: 1,
          };
        }
        console.log('params', params);
        http
          .post(config.API_PREFIX + 'storage/location', params)
          .then((res) => {
            getTreeList();
          })
          .catch((err) => {});
      })
      .catch((err) => {
        console.log('err', err);
      });
  };
  const delTree = () => {
    http
      .del(config.API_PREFIX + `storage/location/${selectNode.id}`, {})
      .then((res) => {
        getTreeList();
      })
      .catch((err) => {});
  };
  const moveTree = (type) => {
    http
      .get(
        config.API_PREFIX +
          `storage/location/upDown` +
          `?${qs.stringify({
            id: selectNode?.id,
            upDown: type, //上移 1 下移 2
          })}`,
        {},
      )
      .then((res) => {
        getTreeList();
      })
      .catch((err) => {});
  };
  // 设置默认值为 true，即开关默认打开
  const [checked, setChecked] = useState(false);

  const onCheckedChange = (checked) => {
    setChecked(checked);
  };
  return (
    <div className="flex">
      <div className="w-[20%] border border-[#ccc] p-2">
        {/* checkable */}
        <Tree
          autoExpandParent={true}
          onSelect={onSelect}
          onCheck={onCheck}
          treeData={treeList}
          fieldNames={{ title: 'name', key: 'id', children: 'children' }}
        />
      </div>
      <div className="w-[68%]">
        <Form
          form={StorageLocationFrom}
          name="basic"
          labelCol={{
            span: 6,
          }}
          wrapperCol={{
            span: 18,
          }}
          style={{
            maxWidth: 600,
          }}
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Row>
            <Col span={12}>
              <Form.Item
                label="仓库类型"
                name="storageType"
                rules={[
                  {
                    required: false,
                    message: '请选择仓库类型!',
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
                  options={getDictionaryListByCode('仓库类型')}
                />
                {/* <Select
                  options={[
                    {
                      value: "良品仓",
                      label: "良品仓",
                    },
                    {
                      value: "不良仓",
                      label: "不良仓",
                    },
                    {
                      value: "报废仓",
                      label: "报废仓",
                    },
                    {
                      value: "成品仓",
                      label: "成品仓",
                    },
                    {
                      value: "治具仓",
                      label: "治具仓",
                    },
                    {
                      value: "线边仓",
                      label: "线边仓",
                    },
                  ]}
                /> */}
              </Form.Item>
              <Form.Item
                label="库位前缀"
                name="code"
                rules={[
                  {
                    required: false,
                    message: '',
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="货架型号"
                name="rackType"
                rules={[
                  {
                    required: false,
                    message: '请选择货架型号',
                  },
                ]}
              >
                <Select options={shelvesList} />
              </Form.Item>
              <Form.Item
                label="检验占用"
                name="isValidated"
                rules={[
                  {
                    required: false,
                    message: '',
                  },
                ]}
              >
                <Switch checked={checked} onChange={onCheckedChange} />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12} className="mr-2">
              <Form.Item
                label=""
                name="locations"
                labelCol={{
                  span: 0,
                }}
                rules={[
                  {
                    required: false,
                    message: '请添加库位',
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={3}>
              <Button type="primary" size="mini" onClick={() => addTree(1)}>
                添加
              </Button>
            </Col>
            <Col span={3}>
              <Button type="primary" size="mini" onClick={() => addTree(2)}>
                添加子项
              </Button>
            </Col>
          </Row>
          <Row className="mt-5">
            <Col span={3}>
              <Button type="primary" size="mini" onClick={() => addTree(3)}>
                保存
              </Button>
            </Col>
            <Col span={3} onClick={delTree}>
              <Button type="primary" size="mini">
                删除
              </Button>
            </Col>
            <Col span={3} onClick={() => moveTree(1)}>
              <Button type="primary" size="mini">
                上移
              </Button>
            </Col>
            <Col span={3} onClick={() => moveTree(2)}>
              <Button type="primary" size="mini">
                下移
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};

// 入库
const PutIn = () => {
  const [form] = Form.useForm();
  const [param, setParam] = useState([]);
  const [barCodeList, setBarCodeList] = useState([]);

  useEffect(() => {
    http
      .post(
        config.API_PREFIX +
          api.paramConfigAll +
          `?${qs.stringify({
            factoryId: 1,
            workshopId: 1,
            areaId: 1,
          })}`,
        {},
      )
      .then((res) => {
        // console.log('paramConfigAll: ', res)
        setParam(res?.bizData);
        form.setFieldsValue({
          uid: res?.bizData?.warehouseConfig?.inboundMaterialUid?.configValue,
          ruleId: res?.bizData?.warehouseConfig?.inboundRuleId?.configValue,
        });
      })
      .catch((err) => {
        console.log(err);
      });
    // 获取原材UID规则
    http
      .get(config.API_PREFIX + api.barcodegenrulePage, {
        ruleType: 'wmsItemUniqueCode',
      })
      .then((res) => {
        const data = res?.bizData?.records.map((item) => {
          return {
            value: item.id.toString(),
            label: item.ruleCode,
          };
        });
        setBarCodeList(data || []);
      });
  }, []);
  const onFinish = (values) => {
    console.log('Success:', values);
  };
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  const handelInbound = () => {
    console.log('inbound', form.getFieldsValue());
    let data = param;
    data.warehouseConfig.inboundMaterialUid.configValue = form.getFieldsValue().uid;
    data.warehouseConfig.inboundRuleId.configValue = form.getFieldsValue().ruleId;
    http
      .post(config.API_PREFIX + api.paramConfigSaveOrUpdate, data)
      .then((res) => {
        console.log(res);
        message.success('保存成功！');
      })
      .catch((err) => {
        console.error(err);
      });
  };
  return (
    <div>
      <Form
        form={form}
        name="basic"
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 16,
        }}
        style={{
          maxWidth: 600,
        }}
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Row>
          <Col span={12}>
            <Form.Item
              label="原材UID"
              name="uid"
              rules={[
                {
                  required: true,
                  message: '请选择原材UID',
                },
              ]}
            >
              <Select
                options={[
                  {
                    value: '1',
                    label: '自动打印',
                  },
                  {
                    value: '2',
                    label: '第三方UID',
                  },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="原材UID规则"
              name="ruleId"
              rules={[
                {
                  required: true,
                  message: '请选择原材UID规则',
                },
              ]}
            >
              <Select options={barCodeList} />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={3}>
            <Button type="primary" size="mini" onClick={() => handelInbound()}>
              保存
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

// 出库
const PutOut = () => {
  const [value, setValue] = useState(1);
  const [form] = Form.useForm();
  const [param, setParam] = useState([]);
  useEffect(() => {
    http
      .post(
        config.API_PREFIX +
          api.paramConfigAll +
          `?${qs.stringify({
            factoryId: 1,
            workshopId: 1,
            areaId: 1,
          })}`,
        {},
      )
      .then((res) => {
        // console.log('paramConfigAll: ', res)
        setParam(res?.bizData);
        form.setFieldsValue({
          switch1: Number(res?.bizData?.warehouseConfig?.outboundFifo?.configValue) || 0,
          fifoRlue: res?.bizData?.warehouseConfig?.outboundFifoRule?.configValue || '1',
          switch2:
            Number(res?.bizData?.warehouseConfig?.outboundWorkOrderGeneration?.configValue) || 0,
          switch3:
            Number(res?.bizData?.warehouseConfig?.outboundHalfTrayPriority?.configValue) || 0,
          switch4: Number(res?.bizData?.warehouseConfig?.outboundScanEnabled?.configValue) || 0,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  const handelOutbound = () => {
    console.log('出库', form.getFieldsValue());
    let data = param;
    data.warehouseConfig.outboundFifo.configValue = form.getFieldsValue().switch1;
    data.warehouseConfig.outboundFifoRule.configValue = form.getFieldsValue().fifoRlue;
    data.warehouseConfig.outboundWorkOrderGeneration.configValue = form.getFieldsValue().switch2;
    data.warehouseConfig.outboundHalfTrayPriority.configValue = form.getFieldsValue().switch3;
    data.warehouseConfig.outboundScanEnabled.configValue = form.getFieldsValue().switch4;
    http
      .post(config.API_PREFIX + api.paramConfigSaveOrUpdate, data)
      .then((res) => {
        console.log(res);
        message.success('保存成功！');
      })
      .catch((err) => {
        console.error(err);
      });
  };
  return (
    <div>
      <Form
        form={form}
        name="basic"
        style={{
          maxWidth: 600,
        }}
        initialValues={{
          remember: true,
        }}
        autoComplete="off"
      >
        <Row>
          <Col span={6}>
            <Form.Item label="FIFO" name="switch1" valuePropName="checked">
              <SwitchNumber />
            </Form.Item>
          </Col>
          {value === 1 && (
            <Col span={12}>
              <Form.Item label="FIFO规则" name="fifoRlue">
                <Select
                  className="w-full"
                  defaultValue="入库日期"
                  options={[
                    {
                      value: '1',
                      label: '入库日期',
                    },
                    {
                      value: '2',
                      label: '生产日期',
                    },
                    {
                      value: '3',
                      label: 'Datacode',
                    },
                    {
                      value: '4',
                      label: '时效时长',
                    },
                  ]}
                />
              </Form.Item>
            </Col>
          )}

          <Col span={24}>
            <Form.Item label="自动生成出库明细" name="switch2" valuePropName="checked">
              <SwitchNumber />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="扫描后允许出库" name="switch3" valuePropName="checked">
              <SwitchNumber />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="半盘优先" name="switch4" valuePropName="checked">
              <SwitchNumber />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={3}>
            <Button
              type="primary"
              size="mini"
              onClick={() => {
                handelOutbound();
              }}
            >
              保存
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

// 智能货架
const IntelligentShelves = () => {
  const [value, setValue] = useState(1);
  const [form] = Form.useForm();
  const [param, setParam] = useState([]);
  const [shelvesList, setShelvesList] = useState([]);
  const [shelvesData, setShelvesData] = useState([]);
  useEffect(() => {
    http
      .post(
        config.API_PREFIX +
          api.paramConfigAll +
          `?${qs.stringify({
            factoryId: 1,
            workshopId: 1,
            areaId: 1,
          })}`,
        {},
      )
      .then((res) => {
        // console.log('paramConfigAll: ', res)
        setParam(res?.bizData);
        form.setFieldsValue({
          rackType: res?.bizData?.warehouseConfig?.rackType?.configValue,
          address: res?.bizData?.warehouseConfig?.smartRackAddress?.configValue,
          storageLocation: res?.bizData?.warehouseConfig?.smartRackPosition?.configValue,
          color: res?.bizData?.warehouseConfig?.smartRackColor_value?.configValue || '0',
        });
      })
      .catch((err) => {
        console.log(err);
      });
    // 获取货架列表
    http
      .post(config.API_PREFIX + 'dict/intelligent/shelves', {})
      .then((res) => {
        setShelvesData(res?.bizData || []);
        setShelvesList(
          res?.bizData?.map((item) => {
            return {
              label: item.fieldName,
              value: item.fieldName,
            };
          }) || [],
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  useEffect(() => {
    handleShelvesChange(form.getFieldsValue().rackType);
  }, [param]);
  const handelShelves = () => {
    console.log('智能货架', form.getFieldsValue());
    let data = param;
    data.warehouseConfig.rackType.configValue = form.getFieldsValue().rackType;
    data.warehouseConfig.smartRackAddress.configValue = form.getFieldsValue().address;
    data.warehouseConfig.smartRackPosition.configValue = form.getFieldsValue().storageLocation;
    data.warehouseConfig.smartRackColor_value.configValue = form.getFieldsValue().color;
    http
      .post(config.API_PREFIX + api.paramConfigSaveOrUpdate, data)
      .then((res) => {
        console.log(res);
        message.success('保存成功！');
      })
      .catch((err) => {
        console.error(err);
      });
  };
  // status 1:亮灯 2：灭灯
  const linght = (status) => {
    http
      .post(
        config.API_PREFIX +
          'iot/wms/light/Up' +
          `?${qs.stringify({
            type: 1,
            storageLocation: form.getFieldValue('storageLocation'),
            color: status == 2 ? 0 : form.getFieldValue('color'), // 0:灭灯 >0：亮灯
            address: form.getFieldValue('address'),
          })}`,
        {},
      )
      .then((res) => {
        console.log(res);
        message.success('操作成功！');
      })
      .catch((err) => {
        console.error(err);
      });
  };
  // const colorOptions = [
  //   {
  //     value: "1",
  //     label: "红色",
  //   },
  //   {
  //     value: "2",
  //     label: "绿色",
  //   },
  //   {
  //     value: "3",
  //     label: "蓝色",
  //   },
  //   {
  //     value: "4",
  //     label: "黄色",
  //   },
  //   {
  //     value: "5",
  //     label: "洋红",
  //   },
  //   {
  //     value: "6",
  //     label: "青色",
  //   },
  //   {
  //     value: "7",
  //     label: "白色",
  //   },
  //   {
  //     value: "8",
  //     label: "红闪",
  //   },
  //   { value: "9", label: "绿闪" },
  //   {
  //     value: "10",
  //     label: "蓝闪",
  //   },
  //   {
  //     value: "11",
  //     label: "黄闪",
  //   },
  //   {
  //     value: "12",
  //     label: "洋闪",
  //   },
  //   {
  //     value: "13",
  //     label: "青闪",
  //   },
  //   {
  //     value: "14",
  //     label: "白闪",
  //   },
  // ];
  const [colorOptions, setColorOptions] = useState([]);
  const handleShelvesChange = (value) => {
    shelvesData.find((item) => {
      if (item.fieldName === value) {
        setColorOptions(
          Object.keys(item.colors).map((key) => ({
            label: item.colors[key],
            value: key,
          })),
        );
      }
    });
  };
  return (
    <div>
      <Form
        form={form}
        name="basic"
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 16,
        }}
        style={{
          maxWidth: 600,
        }}
        initialValues={{
          remember: true,
        }}
        autoComplete="off"
      >
        <Row>
          <Col span={12}>
            <Form.Item
              label="地址端口"
              name="address"
              rules={[
                {
                  required: true,
                  message: '请输入地址端口',
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="货架/储位"
              name="storageLocation"
              rules={[
                {
                  required: true,
                  message: '请输入货架/储位',
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            {' '}
            <Form.Item
              label="货架型号"
              name="rackType"
              rules={[
                {
                  required: false,
                  message: '请选择货架型号',
                },
              ]}
            >
              <Select options={shelvesList} onChange={handleShelvesChange} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="颜色"
              name="color"
              rules={[
                {
                  required: true,
                  message: '请选择颜色',
                },
              ]}
            >
              <Select options={colorOptions} />
            </Form.Item>
          </Col>
        </Row>
        <Row className="mt-5">
          <Col span={3}>
            <Button type="primary" size="mini" onClick={() => handelShelves()}>
              保存
            </Button>
          </Col>
          <Col span={3}>
            <Button type="primary" size="mini" onClick={() => linght(1)}>
              亮灯
            </Button>
          </Col>
          <Col span={3}>
            <Button type="primary" size="mini" onClick={() => linght(2)}>
              灭灯
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default App;
