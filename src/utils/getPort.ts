import 'dotenv/config';
import { DEFAULT_PORT } from '../constants';

export const getPort = (): number => {
  const PORT: string | undefined = process.env.PORT;

  if (!PORT) {
    console.log(`
    .env doesn't have PORT constant.
    PORT switched to deafult value (4000).
    `);
    return DEFAULT_PORT;
  }

  return Number(PORT);
};
