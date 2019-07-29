import {
  queryRule,
  removeRule,
  addRule,
  updateRule,
  latestStatus,
  liveHistory,
  traingHistory
} from "./service";

export default {
  namespace: "model",

  state: {
    data: {
      list: [],
      pagination: {}
    }
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryRule, payload);
      yield put({
        type: "save",
        payload: response
      });
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(addRule, payload);
      yield put({
        type: "save",
        payload: response
      });
      if (callback) callback();
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(removeRule, payload);
      yield put({
        type: "save",
        payload: response
      });
      if (callback) callback();
    },
    *update({ payload, callback }, { call, put }) {
      const response = yield call(updateRule, payload);
      yield put({
        type: "save",
        payload: response
      });
      if (callback) callback();
    },
    *latestStatus({ payload, callback }, { call, put }) {
      const response = yield call(latestStatus, payload);
      yield put({
        type: "save",
        payload: response
      });
      if (callback) callback();
    },
    *liveHistory({ payload, callback }, { call, put }) {
      const response = yield call(liveHistory, payload);
      yield put({
        type: "save",
        payload: response
      });
      if (callback) callback();
    },
    *traingHistory({ payload, callback }, { call, put }) {
      const response = yield call(traingHistory, payload);
      yield put({
        type: "save",
        payload: response
      });
      if (callback) callback();
    }
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload
      };
    }
  }
};
