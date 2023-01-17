import { server } from './app';
import { getPort } from './utils';

const PORT = getPort();

server.listen(PORT, () => {
  console.log(`server started on port: ${PORT}`);
});
