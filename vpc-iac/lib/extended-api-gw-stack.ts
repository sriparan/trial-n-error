import {
  Fn,
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

export class MyAPIGateway extends Stack {
  DOMAIN_NAME: string = "api.sriparan.myinstance.com";
  apipath: string;

  constructor(scope?: App, id?: string, props?: StackProps) {
    super(scope, id, props);

    const clientCert = new apigateway.CfnClientCertificate(
      this,
      "myclientcert",
      {
        description: "myclientCert",
      }
    );

    const myHostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      "HostedZone",
      {
        hostedZoneId: "Z37JQVFZ28MK7I",
        zoneName: "sriparan.myinstance.com",
      }
    );
    const cert = new acm.Certificate(this, "Certificate", {
      domainName: this.DOMAIN_NAME,
      validation: acm.CertificateValidation.fromDns(myHostedZone),
    });

    const domainName = new apigateway.DomainName(this, "domain-name", {
      domainName: this.DOMAIN_NAME,
      certificate: cert,
    });

    const api = new apigateway.RestApi(this, id + "_api", {
      restApiName: id + "_api",
      description: "This service to test REST API",
    });

    let echoResources = api.root.addResource("echo");
    let nlbLink = api.root.addResource("intoVPC");

    domainName.addBasePathMapping(api, {
      stage: api.deploymentStage,
    });

    // echoResources.addMethod("GET", new apigateway.MockIntegration(), {
    //   authorizationType: apigateway.AuthorizationType.NONE,
    // });

    let lambdaFunction = new Function(this, "echo-back", {
      runtime: Runtime.PYTHON_3_9,
      handler: "echoo-all.lambda_handler",
      code: Code.fromAsset("../srctop/echoo-lambda"),
    } as FunctionProps);
    lambdaFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["dynamodb:DescribeTable", "dynamodb:ListTables", "s3:*"],
        resources: ["*"],
      })
    );

    let echoLambdaIntegration = new apigateway.LambdaIntegration(
      lambdaFunction
    );

    echoResources.addMethod("GET", echoLambdaIntegration);

    let httpIntegration = new apigateway.HttpIntegration("https://tomato.com", {
      proxy: false,
      httpMethod: "GET",
      options: {
        passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_MATCH,
      },
    });

    nlbLink.addMethod("POST", echoLambdaIntegration, {
      authorizationType: apigateway.AuthorizationType.NONE,
    });
    nlbLink.addMethod("GET", httpIntegration, {
      authorizationType: apigateway.AuthorizationType.NONE,
    });

    new CfnOutput(this, "lambdaEcho", { value: lambdaFunction.functionArn });

    const api_endpoint = new CfnOutput(this, "apiEndpoint", {
      value: api.url,
      exportName: "apiEndpoint",
    });

    new CfnOutput(this, "endpointDomainName", {
      value: domainName.domainNameAliasDomainName,
    });
    new CfnOutput(this, "clientCert", {
      value: clientCert.attrClientCertificateId,
    });

    new route53.CfnHealthCheck(this, "healthCheck", {
      healthCheckConfig: {
        fullyQualifiedDomainName: domainName.domainName,
        type: "HTTPS",
        resourcePath: "/prod/echo",
      },
      healthCheckTags: [
        {
          key: "Name",
          value: "hc-" + props?.env?.region,
        },
      ],
    });

    this.apipath = Fn.split("/", api.url)[2];

    // new CfnOutput(this, "exportapipath", {
    //   value: this.apipath,
    // });
  }
}
