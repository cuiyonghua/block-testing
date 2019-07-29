import React, { PureComponent, Fragment } from "react";
import { connect } from "dva";
import moment from "moment";
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Icon,
  Button,
  Dropdown,
  Menu,
  InputNumber,
  DatePicker,
  Modal,
  message,
  Badge,
  Divider,
  Steps,
  Radio,
  Affix
} from "antd";
import Link from "umi/link";
import Highlighter from "react-highlight-words";
import StandardTable from "./components/StandardTable";

import styles from "./style.less";
import Column from "antd/lib/table/Column";
import {
  updateUrl,
  getUrlParams,
  deleteParameterFromUrl,
  removeAllParameterExcept
} from "../../utils/updateurl";
const FormItem = Form.Item;
const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;
const RadioGroup = Radio.Group;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(",");
const statusMap = ["default", "processing", "success", "error"];

const allModel = ["latestStatus", "liveHistory", "traingHistory"];
let urlFilter = {};
let searchPropsCount = 0;


/* eslint react/no-multi-comp:0 */
@connect(({ model, loading }) => ({
  model,
  loading: loading.models.rule
}))
@Form.create()
class Model extends PureComponent {
  state = {
    modalVisible: false,
    updateModalVisible: false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
    stepFormValues: {},
    currectModel: allModel[0], //latestStatus, liveHistory, traingHistory
    params: {
      current: 1,
      pageSize: 10,
      filter: {}
    },
    filteredInfo: {},
    editPageVisiable: false,
    selectedRowsRecord: {},
  };

  columns = [];

  componentWillMount() {
    const { dispatch } = this.props;
    const pageUrlParams = getUrlParams();
    const pageUrlParamsCopy = Object.assign({}, pageUrlParams);
    delete pageUrlParamsCopy["model"];
    const params = {
      current: 1,
      pageSize: 10
    };

    if (Object.keys(pageUrlParams).includes("model")) {
      if (!allModel.includes(pageUrlParams.model)) {
        pageUrlParams.model = allModel[0];
        updateUrl("model", pageUrlParams.model);
        updateUrl("current", 1);
        updateUrl("pageSize", 10);
      } else {
        Object.assign(params, pageUrlParamsCopy);
      }
      this.setState({
        currectModel: pageUrlParams.model
      });
    } else {
      Object.assign(params, pageUrlParamsCopy);
    }

    Object.keys(pageUrlParams).map(pKey => {
      const searchValue = {};
      if (pKey.includes("__")) {
        searchValue[pKey] = pageUrlParams;
      }
    });

    urlFilter = Object.keys(pageUrlParams)
      .filter(key => key.includes("__"))
      .reduce((obj, key) => {
        obj[key.split("__")[0]] = pageUrlParams[key];
        return obj;
      }, {});

    this.setState({
      params
    });
   
  }

  componentDidMount() {
    const { dispatch } = this.props;

    dispatch({
      type: "model/" + this.state.currectModel,
      payload: this.state.params
    });

  }

  handleStandardTableChange = (pagination, filtersArg, sorter, agg) => {
    const {
      dispatch,
      model: {
        data: { columns = {} }
      }
    } = this.props;
    const { formValues, currectModel } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      let filter = "";
      columns.map(i => {
        if (i.dataIndex === key) {
          filter = i.filter;
        }
      });
      const newKeys = key + filter;

      if (filtersArg[key].length) {
        newObj[newKeys] = getValue(filtersArg[key]).trim();
      } else {
        deleteParameterFromUrl(newKeys);
      }
      return newObj;
    }, {});

    const params = {
      current: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    updateUrl("current", pagination.current);
    updateUrl("pageSize", pagination.pageSize);

    Object.keys(filters).map(f => {
      updateUrl(f, filters[f]);
    });

    dispatch({
      type: "model/" + currectModel,
      payload: params
    });

    this.setState({ filteredInfo: filters });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {}
    });
    dispatch({
      type: "model/fetch",
      payload: {}
    });
  };

  toggleForm = () => {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm
    });
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows
    });
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag
    });
  };

  handleUpdateModalVisible = (flag, record) => {
    this.setState({
      updateModalVisible: !!flag,
      stepFormValues: record || {}
    });
  };

  modelSwitchHandle = e => {
    removeAllParameterExcept([]);
    console.log(`radio checked:${e.target.value}`, window.location.href);
    const { dispatch } = this.props;
    const modelValue = e.target.value;
    updateUrl("model", modelValue);
    updateUrl("current", 1);
    updateUrl("pageSize", 10);
    const params = {
      current: 1,
      pageSize: 10
    };
    dispatch({
      type: "model/" + modelValue,
      payload: params
    });

    this.setState({
      currectModel: modelValue
    });
  };

  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters
    }) => {
      const {
        model: { data },
      } = this.props;
      searchPropsCount = searchPropsCount + 1;
      if (Object.keys(urlFilter).includes(dataIndex)) {
        setSelectedKeys([urlFilter[dataIndex].trim()]);
        this.setState({ searchText: urlFilter[dataIndex].trim() });
        confirm();
      }
      const columnsFiltered = data.columns.filter(
        col => !Object.keys(col).includes("hidden")
      );
      if (searchPropsCount >= (columnsFiltered.length + 1)) {
        urlFilter = {};
      }

      return (
        <div style={{ padding: 8 }}>
          <Input
            ref={node => {
              this.searchInput = node;
            }}
            placeholder={`Search ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={e =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
          <Button
            type="primary"
            onClick={() => this.handleSearch(selectedKeys, confirm)}
            icon="search"
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
          </Button>
          <Button
            onClick={() => this.handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </div>
      );
    },
    filterIcon: filtered => (
      <Icon type="search" style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    // onFilter: (value, record) =>
    //   record[dataIndex] && record[dataIndex]
    //     .toString()
    //     .toLowerCase()
    //     .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: text => (
      <Highlighter
        highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
        searchWords={[this.state.searchText]}
        autoEscape
        textToHighlight={text != null && text.toString()}
      />
    )
  });

  handleSearch = (selectedKeys, confirm) => {
    confirm();
    if (selectedKeys[0]) {
      this.setState({ searchText: selectedKeys[0].trim() });
    }
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: "" });
  };

  onDoubleClick = (event, record) => {
    // localStorage.setItem('selectHomeTableRow', JSON.stringify(record));
    // router.push('/spec');
    console.log(event, record);
    // window.open((window.location.host + '/#/infer-item?id='+record.id),'_blank');
    this.setState(
      {
        editPageVisiable : true,
        selectedRowsRecord: record,
      }
      );
  };

  hideModal = () => {
    this.setState({
      editPageVisiable: false,
    });
  };

  render() {
    const {
      model: { data },
      loading
    } = this.props;
    const {
      selectedRows,
      modalVisible,
      updateModalVisible,
      stepFormValues,
      currectModel,
      filteredInfo,
      selectedRowsRecord
    } = this.state;

    let columnsNew = [];
    if (Object.keys(data).includes("columns")) {
      columnsNew = data.columns;
      columnsNew = columnsNew.filter(
        col => !Object.keys(col).includes("hidden")
      );
      columnsNew = columnsNew.map(col => {
        return {
          ...col,
          ...(Object.keys(col).includes("filter")
            ? this.getColumnSearchProps(col.dataIndex)
            : {}),
          sorter: Object.keys(col).includes("sortable") && col.sortable,
          agg: col.filter,
          ...(col.dataIndex === "name" || col.dataIndex === "m__name"
            ? {
                render: (text, record, index) => (
                  <Link
                    record={record}
                    index={index}
                    to={"/model/modeldetail?id=" + record.id + '&currectModel=' + currectModel }
                  >
                    {text}
                  </Link>
                )
              }
            : {})
        };
      });
    }

    // if(data && data.data && data.list.length){
    //   const keys = Object.keys(data.list[0]);
    //   columnsNew = keys.map( columnKey => {
    //     return {
    //       title: columnKey,
    //       dataIndex: columnKey
    //     };
    //   } );
    // }

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible
    };
    
    return (
      <Fragment>
        <Affix offsetTop={this.state.top}>
          <Radio.Group
            defaultValue={currectModel}
            buttonStyle="solid"
            onChange={this.modelSwitchHandle}
          >
            <Radio.Button value={allModel[0]}>Status</Radio.Button>
            <Radio.Button value={allModel[1]}>Live History</Radio.Button>
            <Radio.Button value={allModel[2]}>Training History</Radio.Button>
          </Radio.Group>
        </Affix>
        <Card bordered={false}>
          <div className={styles.model}>
            {/* <div className={styles.modelForm}>{this.renderForm()}</div> */}
            <div className={styles.modelOperator}>
              <Button
                disabled
                icon="plus"
                type="primary"
                onClick={() => this.handleModalVisible(true)}
              >
                New
              </Button>
              <Button
                disabled
                icon="edit"
                type="primary"
                style={{ marginLeft: "20px" }}
                onClick={() => this.handleModalVisible(true)}
              >
                Edit
              </Button>
              {/* {selectedRows.length > 0 && (
                <span>
                  <Button>批量操作</Button>
                  <Dropdown overlay={menu}>
                    <Button>
                      更多操作 <Icon type="down" />
                    </Button>
                  </Dropdown>
                </span>
              )} */}
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              dataRes={data}
              columns={columnsNew.length === 0 ? this.columns : columnsNew}
              onSelectRow={this.handleSelectRows}
              onDoubleClick={this.onDoubleClick}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <Modal
          title="Modal"
          visible={this.state.editPageVisiable}
          onOk={this.hideModal}
          onCancel={this.hideModal}
          okText="Save"
          cancelText="Cancel"
        >
          {
            Object.keys(selectedRowsRecord).map( 
              i => {
                return (
                  <Form className="ant-advanced-search-form" onSubmit={this.handleSearch}>
                    <Row gutter={24}>
                      <Col span={8} key={i} style={{ display: 'block' }}>
                        
                        <Form.Item label={i}>
                          {this.props.form.getFieldDecorator(i, {
                            rules: [
                              {
                                required: true,
                                message: 'Input something!',
                              },
                            ],
                          })(<Input value={selectedRowsRecord[i]} />)}
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                );
              }
            )
          }
        </Modal>
      </Fragment>
    );
  }
}

export default Model;
