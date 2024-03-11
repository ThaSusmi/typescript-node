import { Task } from './tasks.entity';
import { AppDataSource } from '../../index';
import {
  instanceToPlain,
  plainToInstance,
} from 'class-transformer';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { UpdateResult } from 'typeorm';

class TasksController {
  // Method GET all
  public async getAll(
    req: Request,
    res: Response,
  ): Promise<Response> {
    // Hold all tasks
    let allTasks: Task[];
    //fetch all tasks using the repository
    try {
      allTasks = await AppDataSource.getRepository(
        Task,
      ).find({
        order: {
          date: 'ASC',
        },
      });

      // convert the tasks instance to an [] of {}
      allTasks = instanceToPlain(allTasks) as Task[];
      return res.status(200).json(allTasks);
    } catch (_err) {
      return res
        .status(500)
        .json({ error: 'Internal Server Error' });
    }
  }

  // Method for POST task
  public async create(
    req: Request,
    res: Response,
  ): Promise<Response> {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(400)
        .json({ status: 'fail', errors: errors.array() });

    // Create new instance of the Task
    const newTask = new Task();
    // Add the required properties to the Task object
    newTask.title = req.body.title;
    newTask.date = req.body.date;
    newTask.description = req.body.description;
    newTask.priority = req.body.priority;
    newTask.status = req.body.status;
    // Add the new task to the database
    let createdTask: Task;

    try {
      createdTask =
        await AppDataSource.getRepository(Task).save(
          newTask,
        );

      /// convert the created task instance to an object
      createdTask = instanceToPlain(createdTask) as Task;
      return res.status(201).json(createdTask);
    } catch (err) {
      return res
        .status(500)
        .json({ error: 'Internal Server Error' });
    }
  }

  //Method for updating tasks
  public async update(
    req: Request,
    res: Response,
  ): Promise<Response> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: errors.array() });
    }
    /// Find the task with supplied id
    let task: Task | null;
    try {
      task = await AppDataSource.getRepository(
        Task,
      ).findOne({
        where: { id: req.body.id },
      });
    } catch (err) {
      return res
        .status(500)
        .json({ error: 'Internal Server Error' });
    }
    /// Return 400 if task is null
    if (!task)
      return res.status(400).json({
        error: 'Task with the given id does not exist',
      });

    /// Declare a variable to update
    let updatedTask: UpdateResult;
    ///update the task
    try {
      updatedTask = await AppDataSource.getRepository(
        Task,
      ).update(
        req.body.id,
        plainToInstance(Task, { status: req.body.status }),
      );

      // convert instance to plain object
      updatedTask = instanceToPlain(
        updatedTask,
      ) as UpdateResult;
      return res.status(200).json(updatedTask);
    } catch (err) {
      return res
        .status(500)
        .json({ error: 'Internal server error' });
    }
  }
}
export const taskController = new TasksController();
