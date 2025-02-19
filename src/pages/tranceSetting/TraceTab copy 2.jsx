import React, { useState, useEffect } from 'react';
import { Typography, Switch, Space, Button, Card, Divider, Form, Row, Col, Select, Input, InputNumber, message } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import http from '../../utils/http'
import {config} from '../../utils/config'
import api from '../../utils/api'
const { Title } = Typography;

const App = (props) => {
  const { param } = props;
  const [form] = Form.useForm();

  useEffect(() => {
    console.log('props', props)
    const traceConfig = param?.traceConfig

    traceConfig?.codeReaders?.forEach(innerArray => {
      innerArray.forEach(obj => {
        obj.isValid = obj.isValid === 'Y' ? true : false;
      });
    });

    let fields = {
      boardInformation: traceConfig?.boardInformation?.configValue || null,
      boardBarCodeCategory: traceConfig?.boardBarCodeCategory?.configValue || null,

      boardEntryControl: traceConfig?.boardEntryControl?.configValue === 'Y' ? true : false,
      repeatScanEntryBoardControl: traceConfig?.repeatScanEntryBoardControl?.configValue === 'Y' ? true : false,
      onlyOneCodeEmptyBoardControl: traceConfig?.onlyOneCodeEmptyBoardControl?.configValue === 'Y' ? true : false,
      repeatScanIgnore: traceConfig?.repeatScanIgnore?.configValue === 'Y' ? true : false,

      codeReaders: traceConfig?.codeReaders || []
    }
    console.log('fields', fields)
    form.setFieldsValue(fields)
  }, [param])

  const onFinish = (values) => {
    console.log('values', values)
    const obj = {
      factoryId: param?.factoryId,
      workshopId: param?.workshopId,
      areaId: param?.areaId,

      configType: '4',
    }
    const { traceConfig } = param

    let codeReaders = JSON.parse(JSON.stringify(values?.codeReaders || []))
    for (let i = 0; i < codeReaders.length; i++) {
      for (let j = 0; j < codeReaders[i].length; j++) {
        let item = codeReaders[i][j]
        item.isValid = item?.isValid ? 'Y' : 'N'
      }
    }
    
    let params = {
      ...obj,
      traceConfig: {
        codeReaders,
        boardInformation: {
          ...obj,
          id: traceConfig?.boardInformation?.id || null,
          configKey: 'Board_information',
          configName: '板子信息',
          configValue: values?.boardInformation,
        },
        boardBarCodeCategory: {
          ...obj,
          id: traceConfig?.boardBarCodeCategory?.id || null,
          configKey: 'Board_bar_Code_category',
          configName: '板子条码类别',
          configValue: values?.boardBarCodeCategory,
        },
        boardEntryControl: {
          ...obj,
          id: traceConfig?.boardEntryControl?.id || null,
          configKey: 'Board_entry_control',
          configName: '进板控制',
          configValue: values?.boardEntryControl ? 'Y' : 'N',
        },
        repeatScanEntryBoardControl: {
          ...obj,
          id: traceConfig?.repeatScanEntryBoardControl?.id || null,
          configKey: 'Repeat_scan_entry_board_control',
          configName: '重复扫描进板控制',
          configValue: values?.repeatScanEntryBoardControl ? 'Y' : 'N',
        },
        onlyOneCodeEmptyBoardControl: {
          ...obj,
          id: traceConfig?.onlyOneCodeEmptyBoardControl?.id || null,
          configKey: 'Only_one_code_empty_board_control',
          configName: '唯一码为空进板控制',
          configValue: values?.onlyOneCodeEmptyBoardControl ? 'Y' : 'N',
        },
        repeatScanIgnore: {
          ...obj,
          id: traceConfig?.repeatScanIgnore?.id || null,
          configKey: 'Repeat_scan_Ignore',
          configName: '重复扫描忽略',
          configValue: values?.repeatScanIgnore ? 'Y' : 'N',
        },
      }
    }
    console.log('params', params)
    return
    http.post(config.API_PREFIX + api.paramConfigSaveOrUpdate, params).then(res => {
      console.log('res', res)
      message.success('保存成功！')
    }).catch(err => {
      message.error('保存失败，请重试！')
    })
  }
  return (
    <div>
      <Form
        form={form}
        onFinish={onFinish}
      >
        <Row>
          <Col span={12}>
            <Form.Item
              label="板子信息"
              name="boardInformation"
              labelCol={{ span: 8 }}
            >
              {/* 参数类型 0系统 1基础 2放错 3停机 4追溯 5设备对接 */}
              <Select
                placeholder="请选择"
                allowClear
                options={[{
                  value: '0',
                  label: '系统'
                }, {
                  value: '1',
                  label: '基础'
                }, {
                  value: '2',
                  label: '放错'
                }, {
                  value: '3',
                  label: '停机'
                }, {
                  value: '4',
                  label: '追溯'
                }, {
                  value: '5',
                  label: '设备对接'
                }]}
              />
            </Form.Item>
          </Col>
          {/* 参数类型 0系统 1基础 2放错 3停机 4追溯 5设备对接 */}
          <Col span={12}>
            <Form.Item
              label="板子条码类别"
              name="boardBarCodeCategory"
              labelCol={{ span: 8 }}
            >
              <Select
                placeholder="请选择"
                allowClear
                options={[{
                  value: '0',
                  label: '系统'
                }, {
                  value: '1',
                  label: '基础'
                }, {
                  value: '2',
                  label: '放错'
                }, {
                  value: '3',
                  label: '停机'
                }, {
                  value: '4',
                  label: '追溯'
                }, {
                  value: '5',
                  label: '设备对接'
                }]}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="进板控制"
              name="boardEntryControl"
              labelCol={{ span: 8 }}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="重复扫描进板控制"
              name="repeatScanEntryBoardControl"
              labelCol={{ span: 8 }}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="唯一码为空进板控制"
              name="onlyOneCodeEmptyBoardControl"
              labelCol={{ span: 8 }}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="重复扫描忽略"
              name="repeatScanIgnore"
              labelCol={{ span: 8 }}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Form.List name="codeReaders">
          {(fields, { add, remove }) => (
            <div style={{ display: 'flex', rowGap: 16, flexDirection: 'column' }}>
              {fields.map((field) => (
                <Card
                  size="small"
                  title={`机器 ${field.key + 1}`}
                  key={field.key}
                  extra={
                    <CloseOutlined
                      onClick={() => {
                        remove(field.name);
                      }}
                    />
                  }
                >
                  {/* <Form.Item label="Name" name={[field.name, 'name']}>
                    <Input />
                  </Form.Item> */}

                  {/* Nest Form.List */}
                  <Form.Item>
                    {/* <Form.List name={[field.name, 'list']}> */}
                    <Form.List name={[field.name]}>
                      {(subFields, subOpt) => (
                        <div style={{ display: 'flex', flexDirection: 'column', rowGap: 16 }}>
                          <table className="table-machine">
                            <thead>
                              <tr>
                                <th>启用</th>
                                <th>轨道</th>
                                <th>位置</th>
                                <th>读码器IP</th>
                                <th>端口号</th>
                                {/* <th>LBN端口号</th> */}
                                <th>触发端口</th>
                                <th>报警端口</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                            {subFields.map((subField) => (
                              <tr key={subField.key}>
                                <td>
                                  <Form.Item
                                    name={[subField.name, 'num']}
                                    initialValue={field.key}
                                    style={{ display: 'none' }}
                                  >
                                    <Input />
                                  </Form.Item>
                                  <Form.Item noStyle name={[subField.name, 'isValid']} valuePropName="checked">
                                    <Switch />
                                  </Form.Item>
                                </td>
                                <td>
                                  <Form.Item noStyle name={[subField.name, 'lan']}>
                                    <Select
                                      placeholder="轨道"
                                      allowClear
                                      options={[{
                                        value: 1,
                                        label: '一轨'
                                      }, {
                                        value: 2,
                                        label: '二轨'
                                      }]}
                                    />
                                  </Form.Item>
                                </td>
                                <td>
                                  <Form.Item noStyle name={[subField.name, 'position']}>
                                    <Select
                                      placeholder="位置"
                                      allowClear
                                      options={[{
                                        value: '顶部',
                                        label: '顶部'
                                      }, {
                                        value: '底部',
                                        label: '底部'
                                      }]}
                                    />
                                  </Form.Item>
                                </td>
                                <td>
                                  <Form.Item noStyle name={[subField.name, 'ip']}>
                                    <Input placeholder="读码器IP" />
                                  </Form.Item>
                                </td>
                                <td>
                                  <Form.Item noStyle name={[subField.name, 'port']}>
                                    <InputNumber placeholder="端口号" />
                                  </Form.Item>
                                </td>
                                {/* <td>
                                  <Form.Item noStyle name={[subField.name, 'triggerPort']}>
                                    <Input placeholder="LBN端口号" />
                                  </Form.Item>
                                </td> */}
                                <td>
                                  <Form.Item noStyle name={[subField.name, 'triggerPort']}>
                                    <InputNumber placeholder="触发端口" />
                                  </Form.Item>
                                </td>
                                <td>
                                  <Form.Item noStyle name={[subField.name, 'alarmPort']}>
                                    <InputNumber placeholder="报警端口" />
                                  </Form.Item>
                                </td>
                                <td>
                                  <CloseOutlined
                                    onClick={() => {
                                      subOpt.remove(subField.name);
                                    }}
                                  />
                                </td>
                              </tr>
                            ))}
                            </tbody>
                          </table>
                          <div style={{textAlign: 'center'}}>
                            <Button icon={<PlusOutlined />} type="dashed" onClick={() => subOpt.add()}>添加读码器</Button>
                          </div>
                        </div>
                      )}
                    </Form.List>
                  </Form.Item>
                </Card>
              ))}
              <Form.Item noStyle shouldUpdate>
                {() => (
                  form.getFieldsValue()?.codeReaders?.length ? null : <Divider />
                )}
              </Form.Item>
              <div style={{textAlign: 'center'}}>
                <Space>
                  <Button icon={<PlusOutlined />} onClick={() => add()}>添加机器</Button>
                  <Button style={{width: 200}} type="primary" htmlType="submit">保存</Button>
                </Space>
              </div>
            </div>
          )}
        </Form.List>
      </Form>
    </div>
  );
};

export default App;


