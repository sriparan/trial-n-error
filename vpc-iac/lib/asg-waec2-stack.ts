import {
  Stack,
  StackProps,
  CfnOutput,
  CfnOutputProps,
  Tags,
  cfnTagToCloudFormation,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sgs from "./sc_commons";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ascaling from "aws-cdk-lib/aws-autoscaling";
import { IngressRule, SGIacStack, SGProps } from "./sg_iac-stack";

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
  vpc: ec2.IVpc;
  sg: ec2.SecurityGroup;
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
    securityGroup: sg,
    
  });
  return lt;
}

export class ASGStack extends Construct {
  // secGroup: ec2.SecurityGroup;
  asgInstance: ascaling.AutoScalingGroup;

  constructor(scope: Construct, id: string, props: ASGProps) {
    super(scope, id);

    // const webAppsg = new SGIacStack(this, "sg", {
    //   env: props.env,
    //   vpc: props.vpc,
    // });

    // this.secGroup = props.sg; // webAppsg.secGroup;

    //sgs.createWebAppSecurityGroup(this, props.vpc, id + "-wasg");

    this.asgInstance = new ascaling.AutoScalingGroup(this, id + "-asg", {
      vpc: props.vpc,
      allowAllOutbound: true,
      // associatePublicIpAddress: true,
      desiredCapacity: DESIRED_CAPACITY,
      maxCapacity: MAX_CAPACITY,
      minCapacity: MIN_CAPACITY,
      launchTemplate: buildLaunchTemplate(
        this,
        "webapp-lt",
        USER_DATA_SCRIPT,
        props.sg
      ),
    });

    // Tags.of(this).add("apps", "Webapp");

    // new CfnOutput(this, "param1", {
    //   value: asgInstance.autoScalingGroupName,
    // } as CfnOutputProps);
  }
}
