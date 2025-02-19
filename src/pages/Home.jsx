// Users.jsx
import React, { useEffect } from 'react';
import { Breadcrumb, Row, Col } from 'antd';
import * as echarts from 'echarts';

const Home = () => {
  useEffect(() => {
    // 柱状图 start
    // 在组件挂载时初始化 ECharts 实例
    const chart = echarts.init(document.getElementById('chart-container'));

    // 示例数据
    const data = [
      { name: 'Apple', value: 50 },
      { name: 'Banana', value: 30 },
      { name: 'Orange', value: 20 },
    ];

    // 配置选项
    const options = {
      // title: {
      //   text: 'Fruit Sales',
      // },
      tooltip: {},
      xAxis: {
        data: data.map((item) => item.name),
      },
      yAxis: {},
      series: [
        {
          name: 'Sales',
          type: 'bar',
          data: data.map((item) => item.value),
        },
      ],
    };

    // 绘制图表
    chart.setOption(options);
    // 柱状图 end

    // 环形图 start
    // 在组件挂载时初始化 ECharts 实例
    const chart1 = echarts.init(document.getElementById('chart-container1'));

    // 示例数据
    const data1 = [
      { name: 'Apple', value: 50 },
      { name: 'Banana', value: 30 },
      { name: 'Orange', value: 20 },
    ];

    // 配置选项
    const options1 = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        top: '5%',
        left: 'center'
      },
      series: [
        {
          name: 'Access From',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 40,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 1048, name: 'Search Engine' },
            { value: 735, name: 'Direct' },
            { value: 580, name: 'Email' },
            { value: 484, name: 'Union Ads' },
            { value: 300, name: 'Video Ads' }
          ]
        }
      ]
    };

    // 绘制图表
    chart1.setOption(options1);
    // 环形图 end

    // 在组件卸载时销毁 ECharts 实例
    return () => {
      chart.dispose();
      chart1.dispose();
    };
  }, []);

  return (
    <div className="content-wrapper">
      <Breadcrumb
        className="breadcrumb"
        items={[{
          title: '首页'
        }, {
          title: '数据看板'
        }]}
      ></Breadcrumb>
      <div className="content">
        <Row gutter={24}>
          <Col span={12}>
            <div id="chart-container" style={{ width: '400px', height: '400px' }} />
          </Col>

          <Col span={12}>
            <div id="chart-container1" style={{ width: '400px', height: '400px' }} />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Home;
