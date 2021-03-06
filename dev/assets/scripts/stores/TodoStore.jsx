var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var TodoConstants = require('../constants/TodoConstants');
var assign = require('object-assign');

var CHANGE_EVENT = 'change';

var _todos = storage();

function create(text) {
  var id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
  _todos[id] = {
    id: id,
    complete: false,
    text: text
  };
}
function update(id, updates) {
  _todos[id] = assign({}, _todos[id], updates);
}
function destroy(id) {
  delete _todos[id];
}
function storage() {
  if(!_todos) {
    return JSON.parse(localStorage.getItem('todos')) || {};
  } else {
    localStorage.setItem('todos', JSON.stringify(_todos));
  }
}

var TodoStore = assign({}, EventEmitter.prototype, {
  getAll: function() {
    return _todos;
  },
  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  }
});

AppDispatcher.register(function(payload) {
  console.log(payload);
  var action = payload.action;
  var text;

  switch(action.actionType) {
    case TodoConstants.TODO_CREATE:
      console.log('store');
      text = action.text.trim();
      if (text !== '') create(text);
      break;
    case TodoConstants.TODO_UNDO_COMPLETE:
      console.log('store');
      update(action.id, {complete: false});
      break;
    case TodoConstants.TODO_COMPLETE:
      console.log('store');
      update(action.id, {complete: true});
      break;
    case TodoConstants.TODO_UPDATE_TEXT:
      console.log('store');
      text = action.text.trim();
      if (text !== '') update(action.id, {text: text});
      break;
    case TodoConstants.TODO_DESTROY:
      console.log('store');
      destroy(action.id);
      break;
    default:
      return true;
  }
  storage();
  TodoStore.emitChange();
  return true;
});
module.exports = TodoStore;
