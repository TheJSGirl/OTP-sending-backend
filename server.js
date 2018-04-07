const express = require('express');
const port = 4000;
const app = express();
const routes = require('./messages/routes');
const cors = require('cors');

app.use(cors());
app.use('/api', routes);

app.listen(port, () => {
  console.log('listening at port', port);
});
