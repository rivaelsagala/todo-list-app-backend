"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTodo = exports.deleteTodo = exports.addTodo = exports.getTodos = void 0;
const db_1 = require("../config/db");
const getTodos = async (_req, res) => {
    const [rows] = await db_1.db.query("SELECT * FROM todos ORDER BY id DESC");
    res.json(rows);
};
exports.getTodos = getTodos;
const addTodo = async (req, res) => {
    const { title, location, date } = req.body;
    const [result] = await db_1.db.query("INSERT INTO todos (title, location, date) VALUES (?, ?, ?)", [title, location, date]);
    res.status(201).json({ id: result.insertId, title, location, date });
};
exports.addTodo = addTodo;
const deleteTodo = async (req, res) => {
    const id = req.params.id;
    await db_1.db.query("DELETE FROM todos WHERE id = ?", [id]);
    res.status(204).send();
};
exports.deleteTodo = deleteTodo;
const updateTodo = async (req, res) => {
    const { id } = req.params;
    const { title, location, date } = req.body;
    await db_1.db.query("UPDATE todos SET title = ?, location = ?, date = ? WHERE id = ?", [title, location, date, id]);
    res.json({ id, title, location, date });
};
exports.updateTodo = updateTodo;
