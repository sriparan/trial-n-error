import express, { Express, Request, Response } from "express";
import http from "http";
import https from "https";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
let port: number = 8080;

if (typeof process.env.PORT == "string") {
  port = parseInt(process.env.PORT);
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/test", (req, res) => {
  res.send("Hello World Test!");
});

const serverinst = http.createServer(app);
serverinst.listen(port, () => {
  console.log(`HTTP server app listening on port ${port}`);
});
