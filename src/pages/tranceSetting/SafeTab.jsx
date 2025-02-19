import React, { useState, useEffect } from 'react';
import { Switch, Space, Button, Divider, List, Form, Row, Col, Select, Input, InputNumber, message } from 'antd';
import { MinusOutlined } from '@ant-design/icons';
import http from '../../utils/http'
import {config} from '../../utils/config'
import api from '../../utils/api'

const App = (props) => {
  const { param } = props;
  const [ form ] = Form.useForm()
  useEffect(() => {
    console.log('props', props)
    const preventConfig = param?.preventConfig
    let fields = {
      checkMethod: preventConfig?.checkMethod?.configValue || '料号',
      refillPattern: preventConfig?.refillPattern?.configValue || '接料',
      alternativeClass: preventConfig?.alternativeClass?.configValue || '程序',
      // reviewTime: preventConfig?.reviewTime?.configValue || null,

      presentSpare: preventConfig?.presentSpare?.configValue || '禁上',
      multiStationScanning: preventConfig?.multiStationScanning?.configValue || '禁上',
      emptyTray: preventConfig?.emptyTray?.configValue || '允许',

      scanningFeeder: preventConfig?.scanningFeeder?.configValue === 'Y' ? true : false,
      scanTheOldTray: preventConfig?.scanTheOldTray?.configValue === 'Y' ? true : false,
    }
    if (preventConfig?.reviewTime?.configValue) {
      const reviewTimeConfigValue = preventConfig?.reviewTime?.configValue || ''
      fields.reviewTime = {
        first: reviewTimeConfigValue?.split(',')?.[0] || null,
        last: reviewTimeConfigValue?.split(',')?.[1] || null,
      }
    } else {
      fields.reviewTime = {
        first: 0,
        last: 20,
      }
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

      configType: '2',
    }
    const { preventConfig } = param
    let params = {
      ...obj,
      preventConfig: {
        checkMethod: {
          ...obj,
          id: preventConfig?.checkMethod?.id || null,
          configKey: 'Check_method',
          configName: '核对方式',
          configValue: values?.checkMethod,
        },
        refillPattern: {
          ...obj,
          id: preventConfig?.refillPattern?.id || null,
          configKey: 'Refill_pattern',
          configName: '续料模式',
          configValue: values?.refillPattern,
        },
        alternativeClass: {
          ...obj,
          id: preventConfig?.alternativeClass?.id || null,
          configKey: 'Alternative_class',
          configName: '替代类别',
          configValue: values?.alternativeClass,
        },
        reviewTime: {
          ...obj,
          id: preventConfig?.reviewTime?.id || null,
          configKey: 'Review_time(minutes)',
          configName: '复核时间（分)',
          configValue: Object.values(values?.reviewTime || []).join(','),
        },
        presentSpare: {
          ...obj,
          id: preventConfig?.presentSpare?.id || null,
          configKey: 'Present_spare',
          configName: '存在备用',
          configValue: values?.presentSpare,
        },
        multiStationScanning: {
          ...obj,
          id: preventConfig?.multiStationScanning?.id || null,
          configKey: 'Multi_station_scanning',
          configName: '多站扫描',
          configValue: values?.multiStationScanning,
        },
        emptyTray: {
          ...obj,
          id: preventConfig?.emptyTray?.id || null,
          configKey: 'empty_tray',
          configName: '空物料盘',
          configValue: values?.emptyTray,
        },
        scanningFeeder: {
          ...obj,
          id: preventConfig?.scanningFeeder?.id || null,
          configKey: 'Scanning_Feeder',
          configName: '扫描Feeder',
          configValue: values?.scanningFeeder ? 'Y' : 'N',
        },
        scanTheOldTray: {
          ...obj,
          id: preventConfig?.scanTheOldTray?.id || null,
          configKey: 'Scan_the_old_tray',
          configName: '扫描旧料盘',
          configValue: values?.scanTheOldTray ? 'Y' : 'N',
        },
      }
    }
    console.log('params', params)
    http.post(config.API_PREFIX + api.paramConfigSaveOrUpdate, params).then(res => {
      console.log(res)
      message.success('保存成功！')
    }).catch(err => {
      console.error(err)
      message.error('保存失败，请重试！')
    })
  }
  return (
    <Form form={form} onFinish={onFinish}>
      <Row>
        <Col span={12}>
          <Form.Item
            label="核对方式"
            name="checkMethod"
            labelCol={{ span: 6 }}
          >
            <Select
              placeholder="请选择"
              allowClear
              
              options={[{
                value: '料号',
                label: '料号'
              }, {
                value: '唯一码',
                label: '唯一码'
              }, {
                value: '供应商料号',
                label: '供应商料号'
              }]}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="续料模式"
            name="refillPattern"
            labelCol={{ span: 6 }}
          >
            <Select
              placeholder="请选择"
              allowClear
              
              options={[{
                value: '接料',
                label: '接料'
              }, {
                value: '换料',
                label: '换料'
              }]}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="替代类别"
            name="alternativeClass"
            labelCol={{ span: 6 }}
          >
            <Select
              placeholder="请选择"
              allowClear
              
              options={[{
                value: '程序',
                label: '程序'
              }, {
                value: '工单',
                label: '工单'
              }]}
            />
          </Form.Item>
        </Col>

        <Col
          span={12}
        >
          <Form.Item
            label="复核时间(分)"
            labelCol={{ span: 6 }}
          >
            <div style={{display: 'flex', alignItems: 'baseline'}}>
              <Form.Item
                name={['reviewTime', 'first']}
                style={{flex: 1, marginBottom: 0}}
              >
                <InputNumber placeholder="请输入" style={{width: '100%'}} />
              </Form.Item>
              <MinusOutlined style={{margin: '0 8px'}} />
              <Form.Item
                name={['reviewTime', 'last']}
                style={{flex: 1, marginBottom: 0}}
              >
                <InputNumber placeholder="请输入" style={{width: '100%'}} />
              </Form.Item>
            </div>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="存在备用"
            name="presentSpare"
            labelCol={{ span: 6 }}
          >
            <Select
              placeholder="请选择"
              allowClear
              
              options={[{
                value: '禁上',
                label: '禁上'
              }, {
                value: '替换',
                label: '替换'
              }]}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="多站扫描"
            name="multiStationScanning"
            labelCol={{ span: 6 }}
          >
            <Select
              placeholder="请选择"
              allowClear
              
              options={[{
                value: '禁上',
                label: '禁上'
              }, {
                value: '替换',
                label: '替换'
              }]}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="空物料盘"
            name="emptyTray"
            labelCol={{ span: 6 }}
          >
            <Select
              placeholder="请选择"
              allowClear
              
              options={[{
                value: '允许',
                label: '允许'
              }, {
                value: '禁上',
                label: '禁上'
              }]}
            />
          </Form.Item>
        </Col>        
      </Row>
      <Row>
        <Col span={12}>
          <Form.Item
            label="扫描Feeder"
            name="scanningFeeder"
            valuePropName="checked"
            labelCol={{ span: 6 }}
          >
            <Switch />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="扫描旧料盘"
            name="scanTheOldTray"
            valuePropName="checked"
            labelCol={{ span: 6 }}
          >
            <Switch />
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
