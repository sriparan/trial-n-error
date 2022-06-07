#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { VpcIacStack } from "../lib/vpc-iac-stack";
import { Ec2IacStack, JumperEc2Props } from "../lib/ec2_iac-stack";
import { ASGStack, ASGProps } from "../lib/asg-waec2-stack";

import { IngressRule, SGIacStack, SGProps } from "../lib/sg_iac-stack";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import createJumperInstance from "../lib/Ec2JumperAbs";
import createMinikubeInstance from "../lib/Ec2MinikubeJumperAbs";
import createWebappInstance from "../lib/Ec2WebappAbs";

import { RuleScope } from "aws-cdk-lib/aws-config";
import * as sgs from "../lib/sc_commons";

const app = new cdk.App();

const vpcStack = new VpcIacStack(app, "VpcIacStack", {
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  env: { region: "us-east-1" },
});
createJumperInstance(vpcStack, vpcStack.myvpc, "bastion");
createMinikubeInstance(vpcStack, vpcStack.myvpc, "bastion-mk");
createWebappInstance(vpcStack, vpcStack.myvpc, "bastion-wa");
// function createJumperSecurityGroup(vpcStack: Construct): SGIacStack {
//   const params: ec2.SecurityGroupProps = {
//     vpc: vpcStack.myvpc,
//     allowAllOutbound: true,
//   };
//   const rules: IngressRule[] = [
//     { peer: ec2.Peer.anyIpv4(), connection: ec2.Port.allTraffic() },
//   ];
//   const securityGroup = new SGIacStack(app, "jumper-sg", {
//     env: { region: "us-east-1" },
//     sgParams: params,
//     ingressRules: rules,
//   });
//   return securityGroup;
// }

// function createWebappInstance(
//   vpcStack: VpcIacStack,
//   securityGroup: SGIacStack,
//   name: string
// ) {
//   const user_data_script = "./infra_Src_code/webapp_user_data.sh";

//   const instanceProps = {
//     instanceType: new ec2.InstanceType("c5.4xlarge"),
//     instanceName: name,
//     keyName: "usvirginia_keys",
//     machineImage: new ec2.AmazonLinuxImage(),
//     vpc: vpcStack.myvpc,
//     vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
//   };

//   const ec2Jumper = new Ec2IacStack(app, "ec2-webapp" + name, {
//     env: { region: "us-east-1" },
//     ec2Params: instanceProps,
//     user_data_script: user_data_script,
//     sg: securityGroup.secGroup,
//   } as JumperEc2Props);
//   return ec2Jumper;
// }

/** STAND ALONE INSTANCE */
//const inst1 = createWebappInstance(vpcStack, sg, "webapp-inst");

// const inst2 = createJumperInstance(vpcStack, "inst2");
const webAppASG = new ASGStack(vpcStack, "web-asg", {
  vpc: vpcStack.myvpc,
});

/** STACK for S3 Events testing */
//Lets do this if need to test s3 events
import S3EventSampleStack from "../lib/s3-event-sample-stack";
if (true) {
  new S3EventSampleStack(app, "s3-event-test");
}
