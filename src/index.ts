import { server } from './server';
import { getPort } from './utils';

const PORT = getPort();

server.listen(PORT, (): void => {
  console.log(`Server started on port: ${PORT}`);
});
