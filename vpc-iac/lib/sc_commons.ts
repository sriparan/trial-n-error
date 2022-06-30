import * as ec2 from "aws-cdk-lib/aws-ec2";
import { IngressRule, SGIacStack, SGProps } from "./sg_iac-stack";
import { Construct } from "constructs";
import { StackProps } from "aws-cdk-lib";

export function createJumperSecurityGroup(
  scope: Construct,
  vpcInst: ec2.Vpc,
  name: string
): SGIacStack {
  const securityGroup = new SGIacStack(scope, name, {
    // env: { region: "us-east-1" },
    vpc: vpcInst,
  });
  return securityGroup;
}

export function createWebAppSecurityGroup(
  scope: Construct,
  vpcInst: ec2.Vpc,
  name: string
): SGIacStack {
  const securityGroup = new SGIacStack(scope, name, {
    // env: { region: "us-east-1" },
    vpc: vpcInst,
  });
  return securityGroup;
}
