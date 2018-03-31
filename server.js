const express = require('express');
const port = 3000;
const app = express();
const routes = require('./messages/routes');

app.use('/api', routes);

app.listen(port, () => {
  console.log('listening at port', port);
});
