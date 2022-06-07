import { RemovalPolicy, Stack, StackProps, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3Notifications from "aws-cdk-lib/aws-s3-notifications";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";

import * as path from "path";
import { ManagedPolicy } from "aws-cdk-lib/aws-iam";

export default class S3EventSampleStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const s3target = s3.Bucket.fromBucketArn(
      this,
      "inventorybucket",
      "arn:aws:s3:::s3-server-access-logs-us-east1"
    );

    /** Inventory */
    const inventory: s3.Inventory = {
      destination: {
        bucket: s3target,
        prefix: "my-cdk-created-bucket-inventory",
      },
      enabled: true,
      format: s3.InventoryFormat.CSV,
      frequency: s3.InventoryFrequency.DAILY,
      includeObjectVersions: s3.InventoryObjectVersion.CURRENT,
      inventoryId: "new-inventory",
      objectsPrefix: "obj2",
    };

    /** create a role for the handler function */
    const myCustomPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          actions: ["s3:*"],
          resources: ["*"],
        }),
      ],
    });
    const customManagedPolicy = new iam.ManagedPolicy(this, "managedpolicy", {
      document: myCustomPolicy,
    });

    const myRole = new iam.Role(this, "removeLambdaHandlerRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        customManagedPolicy,
        ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
    });

    const s3bucket = new s3.Bucket(this, "test-bucket", {
      removalPolicy: RemovalPolicy.DESTROY,
      inventories: [inventory],
    });

    const queue = new sqs.Queue(this, "ResourcesQueue", {
      visibilityTimeout: Duration.seconds(300),
    });

    const filepath = path.join(__dirname, "../../srctop/lambda1src");
    console.log(filepath);

    const removeLambdaHandler: lambda.Function = new lambda.Function(
      this,
      "my-handler",
      {
        runtime: lambda.Runtime.PYTHON_3_9,
        handler: "main.handler",
        code: lambda.Code.fromAsset(filepath),
        role: myRole,
      }
    );

    s3bucket.addObjectCreatedNotification(
      new s3Notifications.LambdaDestination(removeLambdaHandler)
    );

    //the above removed the object it was invoked in. the removal is supposed to insert that into queue :)
    s3bucket.addObjectRemovedNotification(
      new s3Notifications.SqsDestination(queue)
    );
  }
}
