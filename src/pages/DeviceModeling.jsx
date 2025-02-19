import React from 'react';
import { Breadcrumb } from 'antd';

const App = () => {
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
      <div className="content">App Page</div>
    </div>
  );
};

export default App;
