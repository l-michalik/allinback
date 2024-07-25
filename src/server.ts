import express, { Request, Response } from 'express';

const app = express();

const port: number = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Root is running...');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});