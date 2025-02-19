import React from 'react';
import { Button, Typography, Form, Row, Col, Select, Input, Card, Breadcrumb } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const BarcodeDecoding = () => {
  return (
    <div className="content-wrapper">
      <Breadcrumb
        className="breadcrumb"
        items={[{
          title: '条码规则'
        }, {
          title: '条码解析'
        }]}
      ></Breadcrumb>
      <div className="content">
        <Form>
          <Row>
            <Col span={12}>
              <Form.Item
                label="分隔符"
                labelCol={{ span: 8 }}
              >
                <Select
                  placeholder="请选择"
                  allowClear
                  options={[{
                    value: '1',
                    label: '选择1'
                  }, {
                    value: '2',
                    label: '选择2'
                  }, {
                    value: '3',
                    label: '选择3'
                  }]}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="料盘唯一码位置"
                labelCol={{ span: 8 }}
              >
                <Select
                  placeholder="请选择"
                  allowClear
                  options={[{
                    value: '1',
                    label: '选择1'
                  }, {
                    value: '2',
                    label: '选择2'
                  }, {
                    value: '3',
                    label: '选择3'
                  }]}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="位置1"
                labelCol={{ span: 8 }}
              >
                <Select
                  placeholder="请选择"
                  allowClear
                  options={[{
                    value: '1',
                    label: '选择1'
                  }, {
                    value: '2',
                    label: '选择2'
                  }, {
                    value: '3',
                    label: '选择3'
                  }]}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="位置2"
                labelCol={{ span: 8 }}
              >
                <Select
                  placeholder="请选择"
                  allowClear
                  options={[{
                    value: '1',
                    label: '选择1'
                  }, {
                    value: '2',
                    label: '选择2'
                  }, {
                    value: '3',
                    label: '选择3'
                  }]}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="位置3"
                labelCol={{ span: 8 }}
              >
                <Select
                  placeholder="请选择"
                  allowClear
                  options={[{
                    value: '1',
                    label: '选择1'
                  }, {
                    value: '2',
                    label: '选择2'
                  }, {
                    value: '3',
                    label: '选择3'
                  }]}
                />
              </Form.Item>
            </Col>
          </Row>
          <div style={{textAlign: 'right'}}>
            <Button type="primary" icon={<PlusOutlined />}>添加规则</Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default BarcodeDecoding;
