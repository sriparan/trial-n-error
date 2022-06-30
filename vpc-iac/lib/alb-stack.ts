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
import * as elb from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as elbtargets from "aws-cdk-lib/aws-elasticloadbalancingv2-targets";
import * as elbactions from "aws-cdk-lib/aws-elasticloadbalancingv2-actions";

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

export interface ALBStackProps extends StackProps {
  vpc: ec2.IVpc;
  sg: ec2.SecurityGroup;
}
export class ALBStack extends Stack {
  constructor(scope: Construct, id: string, props: ALBStackProps) {
    super(scope, id, props);
    const myALB = new elb.ApplicationLoadBalancer(this, "web-alb", {
      vpc: props.vpc,
    });

    myALB.addSecurityGroup(props.sg);
    const httpListener = myALB.addListener("http80", { port: 80 });

    //new elb.ApplicationTargetGroup()
  }
}
