import React from 'react';
import { Breadcrumb } from 'antd';

const App = () => {
  return (
    <div className="content-wrapper">
      <Breadcrumb
        className="breadcrumb"
        items={[{
          title: '首页'
        }, {
          title: 'App'
        }]}
      ></Breadcrumb>
      <div className="content">App Page</div>
    </div>
  );
};

export default App;
