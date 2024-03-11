import express, { Express } from 'express';
import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Task } from './src/tasks/tasks.entity';
import { tasksRouter } from './src/tasks/tasks.router';

const app: Express = express();
dotenv.config();

// Parse req body
app.use(bodyParser.json());
//Use cors rules
app.use(cors());

const PORT = process.env.PORT;

//Create Database Connection
export const AppDataSource = new DataSource({
  type: 'mariadb',
  host: 'localhost',
  port: 3306,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  entities: [Task],
  synchronize: true,
});

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `server running http://localhost:${process.env.PORT}`,
      );
    });
    console.log(`Data source has been initialized`);
  })
  .catch((err) => {
    console.log(`Error connecting`, err);
  });

// Routes
app.use('/', tasksRouter);
