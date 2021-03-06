// import {ADD_item, DELETE_item, EDIT_item, COMPLETE_item, COMPLETE_ALL, CLEAR_COMPLETED} from 'constants/ActionTypes';
import {createAction} from 'redux-actions';
import * as Api from 'api';

const ADD = 'shoppinglist/ADD';
const FETCH = 'shoppinglist/FETCH';
const ADD_LOCAL_ITEM = 'shoppinglist/ADD_LOCAL_ITEM';
const ADD_LOCAL_ITEMS = 'shoppinglist/ADD_LOCAL_ITEM';
const SET_DONE_LOCAL = 'shoppinglist/SET_DONE_LOCAL';
const SET_ALL_DONE_LOCAL = 'shoppinglist/SET_ALL_DONE_LOCAL';
const DELETE_ALL_DONE_LOCAL = 'shoppinglist/DELETE_ALL_DONE_LOCAL';

import {max as _max} from 'lodash';

const addLocalItem = createAction(ADD_LOCAL_ITEM);
const addLocalItems = createAction(ADD_LOCAL_ITEMS);
const setDoneLocalItem = createAction(SET_DONE_LOCAL);
const setAllDoneLocal = createAction(SET_ALL_DONE_LOCAL);
const deleteAllDoneLocal = createAction(DELETE_ALL_DONE_LOCAL);

/**
 * - execute an optimistic update,
 * - then make an api call,
 * - then replace temporary app state
 */
function optimistically(optimisticActionCreator, apiCall) {
  return (dispatch) => {
    dispatch(optimisticActionCreator);
    if (apiCall) apiCall.then(() => dispatch(fetchItems()));
  }
}

export const fetchItems = createAction(FETCH, Api.fetchAll);
export const addItem = payload => optimistically(addLocalItem(payload), Api.save(payload));
export const addItems = payload => optimistically(addLocalItem(payload), Api.saveAll(payload));
export const setDoneItem = payload => optimistically(setDoneLocalItem(payload), Api.setDone(payload));
export const setAllDone = payload => optimistically(setAllDoneLocal(payload), Api.setAllDone(payload));
export const deleteAllDone = payload => optimistically(deleteAllDoneLocal(payload), Api.deleteAllDone(payload));

export default function reducer(state=[], action) {
  const {payload} = action;
  switch (action.type) {

  case ADD_LOCAL_ITEM: {
    return [{
      name: payload.name,
      temporary: true,
      done: false,
    }, ...state];
  }

  case ADD_LOCAL_ITEMS: {
    const items = payload.names(text => ({
      name: text,
      temporary: true,
      done: false,
    }));

    return [...items, ...state];
  }

  case SET_DONE_LOCAL: {
    const {item: itemClicked, done} = payload; // item is a Parse item
    const itemPlain = itemClicked.toPlainObject();

    return state.map(item => item.id === itemClicked.id ?
        {...itemPlain, temporary: true, done} : item);
  }

  case SET_ALL_DONE_LOCAL: {
    const {done} = payload; // item is a Parse item
    return state.map(item => ({name: item.get('name'), temporary: true, done}));
  }

  case DELETE_ALL_DONE_LOCAL: {
    return state.filter(item => !item.get('done'));
  }

  case FETCH: {
    return payload;
  }

  default:
    return state;
  }
}

