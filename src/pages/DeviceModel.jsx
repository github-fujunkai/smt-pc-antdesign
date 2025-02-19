import React, { memo } from 'react';
import { Breadcrumb } from 'antd';

const DeviceModel = () => {
  return (
    <div className="content-wrapper">
      <Breadcrumb
        className="breadcrumb"
        items={[{
          title: '设备管理'
        }, {
          title: '车间建模'
        }]}
      ></Breadcrumb>
      <div className="content">
        <h1>解决方案——react-beautiful-dnd：</h1>
        <div style={{marginTop: 10}}><a target="_blank" href="https://react-beautiful-dnd.netlify.app/?path=/story/virtual-react-window--board">Virtual: react-window→board：模拟流程图拖拉拽</a></div>
        <div style={{marginTop: 10}}><a target="_blank" href="https://react-beautiful-dnd.netlify.app/?path=/story/complex-vertical-list--nested-vertical-lists">nested vertical lists：模拟轨道子级（印刷机）</a></div>
        <div style={{marginTop: 10}}>敬请期待！^_^</div>
      </div>
    </div>
  );
};

export default DeviceModel;
