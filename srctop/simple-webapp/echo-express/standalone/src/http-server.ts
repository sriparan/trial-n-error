import express, { Express, Request, Response } from "express";
import http from "http";
import https from "https";
import dotenv from "dotenv";
import fs from "fs";
import {
  STSClient,
  GetCallerIdentityCommand,
  GetCallerIdentityCommandInput,
  GetCallerIdentityCommandOutput,
} from "@aws-sdk/client-sts";
// import { AWSError } from "aws-sdk";

import { KMSClient, DescribeKeyCommand } from "@aws-sdk/client-kms"; // ES Modules import

import { GetBucketMetricsConfigurationOutputFilterSensitiveLog } from "@aws-sdk/client-s3";

dotenv.config();

const app = express();
let port: number = 8080;
let count = 0;

if (typeof process.env.PORT == "string") {
  port = parseInt(process.env.PORT);
}

async function getCallerId() {
  var dataobj = { callerId: {} };
  const mysts = new STSClient({});
  const callerIdentityCommand = new GetCallerIdentityCommand({});

  try {
    const data = await mysts.send(callerIdentityCommand);
    console.log(`This is data = ${data.Account}`);
    console.log(`This is data = ${data.Arn}`);
    console.log(`This is data = ${data.UserId}`);
    dataobj["callerId"] = {
      account: data.Account,
      arn: data.Arn,
      userId: data.UserId,
    };
  } catch (err) {
    console.log(`This is err = ${err}`);
    // dataobj.err = err;
  } finally {
    console.log("All done with the sts properties");
  }
  console.log("The function response => ");
  console.log(JSON.stringify(dataobj));
  return dataobj;
}

async function getKMSINfo() {
  // const { KMSClient, DescribeKeyCommand } = require("@aws-sdk/client-kms"); // CommonJS import
  const client = new KMSClient({});
  const command = new DescribeKeyCommand({
    KeyId: "38bf9a03-cffe-4ac8-a574-1dc057e71f9c",
  });
  const response = await client.send(command);
  console.log(response.KeyMetadata?.Enabled);
  return response;
}

app.get("/*", (req, res) => {
  var dataobj = {
    path: req.url,
    params: req.params,
    headers: req.headers,
    originalURL: req.originalUrl,
    callerId: getCallerId(),
    kmsInfo: getKMSINfo(),
    err: "",
  };

  // await callerIdentity.send(
  //   (err: AWSError, data: STS.Types.GetCallerIdentityResponse) => {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       dataobj.callerId = data;
  //     }
  //   }
  // );

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
