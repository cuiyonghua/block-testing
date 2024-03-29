import React, { PureComponent, Fragment } from "react";
import { Table, Alert } from "antd";
import styles from "./index.less";

function initTotalList(columns) {
  const totalList = [];
  columns.forEach(column => {
    if (column.needTotal) {
      totalList.push({ ...column, total: 0 });
    }
  });
  return totalList;
}

class StandardTable extends PureComponent {
  constructor(props) {
    super(props);
    const { columns } = props;
    const needTotalList = initTotalList(columns);

    this.state = {
      selectedRowKeys: [],
      needTotalList
    };
  }

  static getDerivedStateFromProps(nextProps) {
    // clean state
    if (nextProps.selectedRows.length === 0) {
      const needTotalList = initTotalList(nextProps.columns);
      return {
        selectedRowKeys: [],
        needTotalList
      };
    }
    return null;
  }

  handleRowSelectChange = (selectedRowKeys, selectedRows) => {
    let { needTotalList } = this.state;
    needTotalList = needTotalList.map(item => ({
      ...item,
      total: selectedRows.reduce(
        (sum, val) => sum + parseFloat(val[item.dataIndex], 10),
        0
      )
    }));
    const { onSelectRow } = this.props;
    if (onSelectRow) {
      onSelectRow(selectedRows);
    }

    this.setState({ selectedRowKeys, needTotalList });
  };

  handleTableChange = (pagination, filters, sorter, agg) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(pagination, filters, sorter, agg);
    }
  };

  cleanSelectedKeys = () => {
    this.handleRowSelectChange([], []);
  };

  render() {
    const { selectedRowKeys, needTotalList } = this.state;
    const { dataRes = {}, rowKey, onDoubleClick, ...rest } = this.props;
    const { data = [], pagination } = dataRes;

    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      ...pagination
    };

    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleRowSelectChange,
      getCheckboxProps: record => ({
        disabled: record.disabled
      })
    };

    return (
      <div className={styles.standardTable}>
        <div className={styles.tableAlert}>
          <Alert
            message={
              <Fragment>
                Total Selected{" "}
                <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a>{" "}
                &nbsp;&nbsp;
                {needTotalList.map(item => (
                  <span style={{ marginLeft: 8 }} key={item.dataIndex}>
                    {item.title}
                    Total&nbsp;
                    <span style={{ fontWeight: 600 }}>
                      {item.render ? item.render(item.total) : item.total}
                    </span>
                  </span>
                ))}
                <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }}>
                  Clear
                </a>
              </Fragment>
            }
            type="info"
            showIcon
          />
        </div>
        <Table
          rowKey={rowKey || "key"}
          rowSelection={rowSelection}
          dataSource={data}
          pagination={paginationProps}
          onChange={this.handleTableChange}
          onRow={record => ({
            onDoubleClick: event => onDoubleClick(event, record),
          })}
          onDoubleClick={onDoubleClick}
          bordered
          {...rest}
          scroll={{ x: 1000 }}
        />
      </div>
    );
  }
}

export default StandardTable;
