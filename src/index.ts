import { server } from './app';
import * as dotenv from 'dotenv';

dotenv.config();

const PORT: number = Number(process.env.PORT) || 5000;

server.listen(PORT, () => {
  console.log(`server started on port: ${PORT}`);
});
