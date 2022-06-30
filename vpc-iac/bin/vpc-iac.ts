#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { VpcIAcStackProps, VpcIacStack } from "../lib/vpc-iac-stack";
import { ALBStack, ALBStackProps } from "../lib/alb-stack";
import { USWest2VpcIacStack, ExtraAz } from "../lib/us-west-2-vpc-iac-stack";
import { Ec2IacStack, JumperEc2Props } from "../lib/ec2_iac-stack";
import { ASGStack, ASGProps } from "../lib/asg-waec2-stack";

import { IngressRule, SGIacStack, SGProps } from "../lib/sg_iac-stack";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import createJumperInstance from "../lib/Ec2JumperAbs";
import createMinikubeInstance from "../lib/Ec2MinikubeJumperAbs";
import createWebappInstance from "../lib/Ec2WebappAbs";

import { RuleScope } from "aws-cdk-lib/aws-config";
import * as sgs from "../lib/sc_commons";
import S3EventSampleStack from "../lib/s3-event-sample-stack";
import { StackProps } from "aws-cdk-lib";

let inDevMode = true;

const app = new cdk.App();

if (inDevMode) {
  // const vpcStack = new USWest2VpcIacStack(app, "DevVPCStack", {
  //   env: { region: "us-west-2" },
  // });
  const vpcStack = new VpcIacStack(app, "VpcIacStack", {
    env: { region: "us-west-2" },
    azs: ["us-west-2a", "us-west-2b"],
  } as VpcIAcStackProps);

  const localZoneAZ = new ExtraAz(app, "extraAZ", {
    env: { region: "us-west-2" },
    parentVPCId: cdk.Fn.importValue("mainvpc"), //vpcStack.myvpc.vpcId,
    routeTableId: cdk.Fn.importValue("privatesubnetrt-0"),
  });

  const webAppASG = new ASGStack(app, "web-asg", {
    env: { region: "us-west-2" },
    vpc: vpcStack.myvpc,
  });

  const myALB = new ALBStack(app, "web-alb", {
    env: { region: "us-west-2" },
    vpc: vpcStack.myvpc,
    sg: webAppASG.secGroup,
  });

  // createJumperInstance(app, vpcStack.myvpc, "bastion");

  new S3EventSampleStack(app, "s3-event-test");
  // new RDSStack(app, "RDSstack");
} else {
  // const vpcStack = new VpcIacStack(app, "VpcIacStack", {
  //   env: { region: "us-east-1" },
  //   azs: ["us-east-1a", "us-east-1b"],
  // } as VpcIAcStackProps);
  // createJumperInstance(vpcStack, vpcStack.myvpc, "bastion");
  // createMinikubeInstance(vpcStack, vpcStack.myvpc, "bastion-mk");
  // createWebappInstance(vpcStack, vpcStack.myvpc, "bastion-wa");
  // const webAppASG = new ASGStack(vpcStack, "web-asg", {
  //   vpc: vpcStack.myvpc,
  // });
  /** STACK for S3 Events testing */
  //Lets do this if need to test s3 events
}
