import {
  CfnParameter,
  Token,
  Stack,
  App,
  StackProps,
  CfnOutput,
  Names,
} from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Code, Function, FunctionProps, Runtime } from "aws-cdk-lib/aws-lambda";
import { HttpMethod } from "aws-cdk-lib/aws-events";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as acm from "aws-cdk-lib/aws-certificatemanager";

export interface RTStackProps extends StackProps {
  apiURL: string;
  path: string;
  type: string;
}
export class Route53Health extends Stack {
  constructor(scope: App, id: string, props: RTStackProps) {
    super(scope, id, props);

    const apiURL = new CfnParameter(this, "fqdn", {
      type: "String",
      description: "fqdn of api execute server.",
      default: "https://www.com/sdfds",
    });
    console.log(apiURL.valueAsString);
    const accessURL = new URL(apiURL.valueAsString);

    new route53.CfnHealthCheck(this, "healthCheck", {
      healthCheckConfig: {
        fullyQualifiedDomainName: accessURL.hostname,
        type: "HTTPS",
        resourcePath: accessURL.pathname + props.path,
      },
      healthCheckTags: [
        {
          key: "Name",
          value: "hc-" + props.env?.region,
        },
      ],
    });

    new CfnOutput(this, "fqdn", {
      value: accessURL.hostname,
    });
    new CfnOutput(this, "pathname", {
      value: accessURL.hostname,
    });
  }
}
