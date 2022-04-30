const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const res = require('express/lib/response');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username)

  if (!user) {
    return res.status(400).send({ error: 'User not found!'});
  }

  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const user = users.find((user) => user.username === username);

  if (user) {
    return response.status(400).send({error: 'User already exists!'});
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(newUser);

  return response.json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  return response.status(201).send(request.user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline,
    created_at: new Date
  }
  request.user.todos.push(newTodo);
  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).send({ error: 'TODO not found!'});
  }
  
  todo.title = title;
  todo.deadline = deadline;
  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).send({ error: 'TODO not found!'});
  }
  
  todo.done = true;
  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);
  const todoIdx = user.todos.indexOf(todo);

  if (!todo || todoIdx === -1) {
    return response.status(404).send({ error: 'TODO not found!'});
  }

  user.todos.splice(todoIdx, 1);
  return response.status(204).send();
});

module.exports = app;