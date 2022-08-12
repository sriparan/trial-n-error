import express, { Express, Request, Response } from "express";
import http from "http";
import https from "https";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
let port: number = 8080;
let count = 0;

if (typeof process.env.PORT == "string") {
  port = parseInt(process.env.PORT);
}

app.get("/*", (req, res) => {
  const dataobj: object = {
    path: req.url,
    params: req.params,
    headers: req.headers,
    originalURL: req.originalUrl,
  };
  const resp: string = JSON.stringify(dataobj);
  console.log(`received ${count} ${resp}`);
  res.send(`REquest count  ${count} - INPUT-  ${resp}`);
  // res.send(`Path I got is  ${req.url}`);
  // res.send(`params I got are -> ${req.params}`);
  // res.send(`body?  -> ${req.body}`);
  res.end();
  count++;
});

app.get("/test/*", (req, res) => {
  res.send("Hello World Test!");
});

const serverinst = http.createServer(app);
serverinst.keepAliveTimeout = 10;
serverinst.listen(port, () => {
  console.log(`HTTP server app listening on port ${port}`);
});
