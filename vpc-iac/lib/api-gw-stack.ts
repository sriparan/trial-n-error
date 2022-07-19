import { Stack, App, StackProps, CfnOutput } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Integration } from "aws-cdk-lib/aws-apigateway";
import { Code, Function, FunctionProps, Runtime } from "aws-cdk-lib/aws-lambda";

export class MyAPIGateway extends Stack {
  constructor(scope?: App, id?: string, props?: StackProps) {
    super(scope, id, props);

    const api = new apigateway.RestApi(this, "test-rest-ep", {
      restApiName: "test-rest-ep",
      description: "This service to test EvErYtHiNg",
    });
    let echoResources = api.root.addResource("echos");

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
    echoResources.addMethod("GET", echoLambdaIntegration, {
      authorizationType: apigateway.AuthorizationType.NONE,
    });

    new CfnOutput(this, "lambdaEcho", { value: lambdaFunction.functionArn });
    new CfnOutput(this, "apiEndpoint", { value: api.url });
  }
}
