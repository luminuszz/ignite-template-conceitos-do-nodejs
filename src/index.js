const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const verifyUserExists = users.find((user) => user.username === username);

  if (!verifyUserExists) {
    return response.status(404).send({
      error: "user not found",
    });
  }

  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const verifyUserExists = users.find((user) => user.username === username);

  if (verifyUserExists) {
    return response.status(400).send({
      error: "Users alreadyExists",
    });
  }

  const newUser = { name, username, id: uuidv4(), todos: [] };

  users.push(newUser);

  return response.status(201).send(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  console.log("username", username);

  const { todos } = users.find((user) => user.username === username);

  return response.status(200).send(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;

  const userIndex = users.findIndex((user) => user.username === username);

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline,
    created_at: new Date().toISOString(),
  };

  users[userIndex].todos.push(newTodo);

  return response.status(201).send(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id: todoId } = request.params;
  const data = request.body;

  const userIndex = users.findIndex((user) => user.username === username);

  const todos = users[userIndex].todos;

  const findTodo = todos.find((item) => todoId === item.id);

  if (!findTodo) {
    return response.status(404).send({
      error: "not found todo",
    });
  }

  const updateTodo = { ...findTodo, ...data };

  users[userIndex].todos = todos.map((todo) =>
    todo.id === todoId ? updateTodo : todo
  );

  return response.status(200).send(updateTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id: todoId } = request.params;

  const userIndex = users.findIndex((user) => user.username === username);

  const todos = users[userIndex].todos;

  const findTodo = todos.find((todo) => todo.id === todoId);

  if (!findTodo) {
    return response.status(404).send({
      error: "Todo not found",
    });
  }

  const doneTodo = { ...findTodo, done: true };

  const newListTodo = todos.map((todo) =>
    todo.id === todoId ? doneTodo : todo
  );

  users[userIndex].todos = newListTodo;

  return response.status(200).send(doneTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id: todoId } = request.params;

  const userIndex = users.findIndex((user) => user.username === username);

  const findTodo = users[userIndex].todos.find((todo) => todo.id === todoId);

  if (!findTodo) {
    return response.status(404).send({
      error: "Todo not found",
    });
  }

  const newListTodo = users[userIndex].todos.filter(
    (todo) => todo.id !== todoId
  );

  console.log(newListTodo);

  users[userIndex].todos = newListTodo;

  return response.status(204).send();
});

module.exports = app;
