import { Stack, App, StackProps, CfnOutput } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as apigatewayv2 from "aws-cdk-lib/aws-apigatewayv2";
import { Integration } from "aws-cdk-lib/aws-apigateway";
import { Code, Function, FunctionProps, Runtime } from "aws-cdk-lib/aws-lambda";
import { HttpMethod } from "aws-cdk-lib/aws-events";

export class MyAPIGateway extends Stack {
  constructor(scope?: App, id?: string, props?: StackProps) {
    super(scope, id, props);

    const clientCert = new apigateway.CfnClientCertificate(
      this,
      "myclientcert",
      {
        description: "myclientCert",
      }
    );

    const api = new apigateway.RestApi(this, id + "_api", {
      restApiName: id + "_api",
      description: "This service to test REST API",
    });
    const api2 = new apigateway.SpecRestApi(this, "books-api", {
      apiDefinition: apigateway.ApiDefinition.fromAsset(
        "infra_src_code/backtrack.json"
      ),
    });

    let echoResources = api.root.addResource("echos");
    let nlbLink = api.root.addResource("intoVPC");

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
    new CfnOutput(this, "apiEndpoint", { value: api.url });
    new CfnOutput(this, "clientCert", {
      value: clientCert.attrClientCertificateId,
    });
  }
}
