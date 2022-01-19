const express = require('express');
const expressOasGenerator = require('express-oas-generator');
const postsRouter = require('./routes/posts');

const port = 3000 || process.env.PORT;

const app = express();
/** place handleResponses as the very first middleware */
expressOasGenerator.handleResponses(app, {});

const bodyParser= require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.json());

app.get('/api/', (req, res) => {
  res.json({message: 'alive'});
});

app.use('/api/posts', postsRouter);

/** place handleRequests as the very last middleware */
expressOasGenerator.handleRequests();
app.listen(port, () => {
  console.log(`Imagegram listening at http://localhost:${port}`);
});
