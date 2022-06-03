#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { VpcIacStack } from "../lib/vpc-iac-stack";
import { Ec2IacStack, JumperEc2Props } from "../lib/ec2_iac-stack";
import { IngressRule, SGIacStack, SGProps } from "../lib/sg_iac-stack";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { RuleScope } from "aws-cdk-lib/aws-config";

const app = new cdk.App();

const vpcStack = new VpcIacStack(app, "VpcIacStack", {
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  env: { region: "us-east-1" },
});

function createJumperSecurityGroup(vpcStack: VpcIacStack): SGIacStack {
  const params: ec2.SecurityGroupProps = {
    vpc: vpcStack.myvpc,
    allowAllOutbound: true,
  };
  const rules: IngressRule[] = [
    { peer: ec2.Peer.anyIpv4(), connection: ec2.Port.allTraffic() },
  ];
  const securityGroup = new SGIacStack(app, "jumper-sg", {
    env: { region: "us-east-1" },
    sgParams: params,
    ingressRules: rules,
  });
  return securityGroup;
}

function createJumperInstance(
  vpcStack: VpcIacStack,
  securityGroup: SGIacStack,
  name: string
) {
  const user_data_script = "./infra_Src_code/jumper_user_data.sh";

  const instanceProps = {
    instanceType: new ec2.InstanceType("c5.4xlarge"),
    instanceName: name,
    keyName: "usvirginia_keys",
    machineImage: new ec2.AmazonLinuxImage(),
    vpc: vpcStack.myvpc,
    vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
  };

  const ec2Jumper = new Ec2IacStack(app, "ec2-jumper" + name, {
    env: { region: "us-east-1" },
    ec2Params: instanceProps,
    user_data_script: user_data_script,
    sg: securityGroup.secGroup,
  } as JumperEc2Props);
  return ec2Jumper;
}

function createMinikubeInstance(
  vpcStack: VpcIacStack,
  securityGroup: SGIacStack,
  name: string
) {
  const user_data_script = "./infra_Src_code/minikube_user_data.sh";

  const instanceProps = {
    instanceType: new ec2.InstanceType("c5.4xlarge"),
    instanceName: name,
    keyName: "usvirginia_keys",
    machineImage: new ec2.AmazonLinuxImage(),
    vpc: vpcStack.myvpc,
    vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
  };

  const ec2Jumper = new Ec2IacStack(app, "ec2-minikube" + name, {
    env: { region: "us-east-1" },
    ec2Params: instanceProps,
    user_data_script: user_data_script,
    sg: securityGroup.secGroup,
  } as JumperEc2Props);
  return ec2Jumper;
}

function createWebappInstance(
  vpcStack: VpcIacStack,
  securityGroup: SGIacStack,
  name: string
) {
  const user_data_script = "./infra_Src_code/webapp_user_data.sh";

  const instanceProps = {
    instanceType: new ec2.InstanceType("c5.4xlarge"),
    instanceName: name,
    keyName: "usvirginia_keys",
    machineImage: new ec2.AmazonLinuxImage(),
    vpc: vpcStack.myvpc,
    vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
  };

  const ec2Jumper = new Ec2IacStack(app, "ec2-webapp" + name, {
    env: { region: "us-east-1" },
    ec2Params: instanceProps,
    user_data_script: user_data_script,
    sg: securityGroup.secGroup,
  } as JumperEc2Props);
  return ec2Jumper;
}

const sg = createJumperSecurityGroup(vpcStack);
const inst1 = createWebappInstance(vpcStack, sg, "webapp-inst");
// const inst2 = createJumperInstance(vpcStack, sg, "inst2");
