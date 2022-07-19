import {
  Stack,
  StackProps,
  CfnOutput,
  CfnOutputProps,
  Tags,
} from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import {
  InstanceClass,
  SubnetType,
  UserData,
  VpcProps,
} from "aws-cdk-lib/aws-ec2";
import { VpcConfig } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { readFileSync } from "fs";

export interface JumperEc2Props extends StackProps {
  ec2Params: ec2.InstanceProps;
  user_data_script: string;
  sg: ec2.SecurityGroup;
}

export class Ec2IacStack extends Construct {
  constructor(scope: Construct, id: string, props: JumperEc2Props) {
    super(scope, id);

    const jumperEc2 = new ec2.Instance(this, id, props.ec2Params);

    //    new iam.Role(this, "ec2Role", {assumedBy:iam.ServicePrincipal()})
    const file_data = readFileSync(props.user_data_script, "utf-8");
    console.log(file_data);
    jumperEc2.addUserData(file_data);
    jumperEc2.addSecurityGroup(props.sg);
    Tags.of(this).add("node-cat", id);

    jumperEc2.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["dynamodb:DescribeTable", "dynamodb:ListTables", "s3:*"],
        resources: ["*"],
      })
    );
    // IP of the instance
    new CfnOutput(this, "myjumperIp", {
      value: jumperEc2.instancePublicIp,
    } as CfnOutputProps);

    //id of the instance
    new CfnOutput(this, "myjumperInstId", {
      value: jumperEc2.instanceId,
    } as CfnOutputProps);
  }
}
