import React, { useState, useEffect } from 'react';
import { Switch, Space, Button, Divider, message, Form, Row, Col, Select, Input } from 'antd';
import { MinusOutlined } from '@ant-design/icons';
import http from '../../utils/http'
import {config} from '../../utils/config'
import api from '../../utils/api'

const App = (props) => {
  const { param } = props;
  const [form] = Form.useForm();

  useEffect(() => {
    console.log('props', props)
    const stopConfig = param?.stopConfig
    let fields = {
      downtimeConditions: stopConfig?.downtimeConditions?.configValue ? stopConfig?.downtimeConditions?.configValue?.split(',') : ['1', '3'],
      modeOfShutdown: stopConfig?.modeOfShutdown?.configValue || '停机模块',
      moduleConnection: stopConfig?.moduleConnection?.configValue || '192.168.1.80:502',
      moduleCommunicationFrequency: stopConfig?.moduleCommunicationFrequency?.configValue || '5000',
      deviceCommunicationFrequency: stopConfig?.deviceCommunicationFrequency?.configValue || '200',
    }
    console.log('fields', fields)
    form.setFieldsValue(fields)
  }, [param])

  const onFinish = (values) => {
    console.log(values)
    const obj = {
      factoryId: param?.factoryId,
      workshopId: param?.workshopId,
      areaId: param?.areaId,

      configType: '3',
    }
    const { stopConfig } = param
    let params = {
      ...obj,
      stopConfig: {
        downtimeConditions: {
          ...obj,
          id: stopConfig?.downtimeConditions?.id || null,
          configKey: 'Downtime_conditions',
          configName: '停机条件',
          configValue: values?.downtimeConditions?.join(',') || '',
        },
        modeOfShutdown: {
          ...obj,
          id: stopConfig?.modeOfShutdown?.id || null,
          configKey: 'Mode_of_shutdown',
          configName: '停机方式',
          configValue: values?.modeOfShutdown,
        },
        moduleConnection: {
          ...obj,
          id: stopConfig?.moduleConnection?.id || null,
          configKey: 'Module_connection',
          configName: '模块连接',
          configValue: values?.moduleConnection,
        },
        moduleCommunicationFrequency: {
          ...obj,
          id: stopConfig?.moduleCommunicationFrequency?.id || null,
          configKey: 'Module_communication_frequency',
          configName: '模块通讯频率(ms)',
          configValue: values?.moduleCommunicationFrequency,
        },
        deviceCommunicationFrequency: {
          ...obj,
          id: stopConfig?.deviceCommunicationFrequency?.id || null,
          configKey: 'Device_communication_frequency',
          configName: '设备通讯频率(ms)',
          configValue: values?.deviceCommunicationFrequency,
        },
      }
    }
    console.log('params', params)
    // return
    http.post(config.API_PREFIX + api.paramConfigSaveOrUpdate, params).then(res => {
      console.log(res)
      message.success('保存成功！')
    }).catch(err => {
      console.error(err)
      message.error('保存失败，请重试！')
    })
  }
  return (
    <Form
      form={form}
      onFinish={onFinish}
    >
      <Row>
        <Col span={12}>
          <Form.Item
            label="停机条件"
            name="downtimeConditions"
            labelCol={{ span: 7 }}
          >
            {/* 停机条件 1.待核；3.错料；4.缺料；102.异常NG 多个逗号分隔 */}
            <Select
              mode="multiple"
              placeholder="请选择"
              allowClear
              
              options={[{
                value: '1',
                label: '待核'
              }, {
                value: '3',
                label: '错料'
              }, {
                value: '4',
                label: '缺料'
              }, {
                value: '102',
                label: '异常NG'
              }]}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="停机方式"
            name="modeOfShutdown"
            labelCol={{ span: 7 }}
          >
            <Select
              placeholder="请选择"
              allowClear
              
              options={[{
                value: '停机模块',
                label: '停机模块'
              }, {
                value: '设备接口',
                label: '设备接口'
              }]}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="模块连接"
            name="moduleConnection"
            labelCol={{ span: 7 }}
          >
            <Input placeholder="请输入" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="模块通讯频率(ms)"
            name="moduleCommunicationFrequency"
            labelCol={{ span: 7 }}
          >
            <Input placeholder="请输入" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="设备通讯频率(ms)"
            name="deviceCommunicationFrequency"
            labelCol={{ span: 7 }}
          >
            <Input placeholder="请输入" />
          </Form.Item>
        </Col>
      </Row>
      <Divider />
      <div style={{textAlign: 'center'}}>
        <Space>
          <Button style={{width: 200}} type="primary" htmlType="submit">保存</Button>
        </Space>
      </div>
    </Form>
  );
};

export default App;

