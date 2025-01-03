require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

const start = async () => {
  try {
    await ;
    app.listen(PORT, () => console.log(`Server's been started on the ${PORT} port`));
  } catch (e) {
    console.error(e);
  }
}

start();
