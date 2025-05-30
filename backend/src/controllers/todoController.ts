import { Request, Response } from "express";
import { db } from "../config/db";
import { Todo } from "../models/todo";

export const getTodos = async (_req: Request, res: Response) => {
  const [rows] = await db.query("SELECT * FROM todos ORDER BY id DESC");
  res.json(rows);
};

export const addTodo = async (req: Request, res: Response) => {
  const { title, location, date } = req.body as Todo;
  const [result] = await db.query(
    "INSERT INTO todos (title, location, date) VALUES (?, ?, ?)",
    [title, location, date]
  );
  res.status(201).json({ id: (result as any).insertId, title, location, date });
};

export const deleteTodo = async (req: Request, res: Response) => {
  const id = req.params.id;
  await db.query("DELETE FROM todos WHERE id = ?", [id]);
  res.status(204).send();
};

export const updateTodo = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, location, date } = req.body;

  await db.query(
    "UPDATE todos SET title = ?, location = ?, date = ? WHERE id = ?",
    [title, location, date, id]
  );

  res.json({ id, title, location, date });
};
