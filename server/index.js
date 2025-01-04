require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const router = require('./router/index');
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use('/api', router);

const start = async () => {
  try {
    await prisma.$disconnect();
    app.listen(PORT, () => console.log(`Server's been started on the ${PORT} port`));
  } catch (e) {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }
}

start();
