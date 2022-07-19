import {
  Stack,
  StackProps,
  CfnOutput,
  CfnOutputProps,
  Tags,
  cfnTagToCloudFormation,
} from "aws-cdk-lib";
// import cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sgs from "./sc_commons";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ec2 from "aws-cdk-lib/aws-ec2";

import * as elb from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as elbtargets from "aws-cdk-lib/aws-elasticloadbalancingv2-targets";
import * as elbactions from "aws-cdk-lib/aws-elasticloadbalancingv2-actions";
import { ASGStack, ASGProps } from "../lib/asg-waec2-stack";

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
  publicSubnets: ec2.ISubnet[];
  privateIsolatedSubnet: ec2.ISubnet[];
  privateNatSubnet: ec2.ISubnet[];

  // sg: ec2.SecurityGroup;
  // asg: ascaling.AutoScalingGroup;
}

/*
 security group , ALB - listern - targetgroup, and Auto scaling group mapped to target group.
*/
export class ALBStack extends Stack {
  constructor(scope: Construct, id: string, props: ALBStackProps) {
    super(scope, id, props);

    const webAppsg = new SGIacStack(this, "sg", {
      env: props.env,
      vpc: props.vpc,
    });

    const webAppASG = new ASGStack(this, "web-asg", {
      env: props.env,
      vpc: props.vpc,
      sg: webAppsg.secGroup,
    });

    const myALB = new elb.ApplicationLoadBalancer(this, id, {
      vpc: props.vpc,
      internetFacing: true,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC } as ec2.SubnetSelection,
      // securityGroup: webAppASG.secGroup,
    });

    myALB.addSecurityGroup(webAppsg.secGroup);
    const httpListener = myALB.addListener("http80", { port: 80 });
    httpListener.addTargets("default-target", {
      protocol: elb.ApplicationProtocol.HTTP,
      targets: [webAppASG.asgInstance],
      // healthCheck: {
      //   path: "/",
      //   unhealthyThresholdCount: 2,
      //   healthyThresholdCount: 5,
      //   interval: cdk.Duration.seconds(30),
      // },
    });

    new CfnOutput(this, "alburl", { value: myALB.loadBalancerDnsName });
  }
}
