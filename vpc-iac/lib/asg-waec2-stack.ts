import {
  Stack,
  StackProps,
  CfnOutput,
  CfnOutputProps,
  Tags,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sgs from "./sc_commons";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ascaling from "aws-cdk-lib/aws-autoscaling";

import {
  InstanceClass,
  SubnetType,
  UserData,
  VpcProps,
} from "aws-cdk-lib/aws-ec2";
import { VpcConfig } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { readFileSync } from "fs";

const USER_DATA_SCRIPT = "./infra_Src_code/webapp_user_data.sh";
const KEY_NAME = "usvirginia_keys";
const DESIRED_CAPACITY = 1;
const MAX_CAPACITY = 4;
const MIN_CAPACITY = 1;

export interface ASGProps extends StackProps {
  vpc: ec2.Vpc;
}

// Create a Web app launch template, fix the script etc for my application, instance types etc.
function buildLaunchTemplate(
  scope: Construct,
  id: string,
  user_data_script: string,
  sg: ec2.SecurityGroup
) {
  const file_data = readFileSync(user_data_script, {
    encoding: "utf-8",
    flag: "r",
  });

  const userData = ec2.UserData.forLinux();
  userData.addCommands(file_data);
  const lt = new ec2.LaunchTemplate(scope, id + "webapp-lt", {
    machineImage: new ec2.AmazonLinuxImage(),
    userData: userData,
    blockDevices: [
      // Block device configuration rest
    ],
    instanceType: ec2.InstanceType.of(
      ec2.InstanceClass.T3,
      ec2.InstanceSize.NANO
    ),
    keyName: KEY_NAME,
  });
  return lt;
}

export class ASGStack extends Construct {
  constructor(scope: Construct, id: string, props: ASGProps) {
    super(scope, id);
    const webAppsg = sgs.createWebAppSecurityGroup(
      this,
      props.vpc,
      id + "-wasg"
    );

    const asgInstance = new ascaling.AutoScalingGroup(this, id + "-asg", {
      vpc: props.vpc,
      desiredCapacity: DESIRED_CAPACITY,
      maxCapacity: MAX_CAPACITY,
      minCapacity: MIN_CAPACITY,
      launchTemplate: buildLaunchTemplate(
        this,
        "webapp-lt",
        USER_DATA_SCRIPT,
        webAppsg.secGroup
      ),
    });

    Tags.of(this).add("apps", "Webapp");

    new CfnOutput(this, "param1", {
      value: asgInstance.autoScalingGroupName,
    } as CfnOutputProps);
  }
}