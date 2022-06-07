import * as ec2 from "aws-cdk-lib/aws-ec2";
import { IngressRule, SGIacStack, SGProps } from "./sg_iac-stack";
import { Construct } from "constructs";

export function createJumperSecurityGroup(
  scope: Construct,
  vpcInst: ec2.Vpc,
  name: string
): SGIacStack {
  const GROUP_NAME = name + "sg";
  const params: ec2.SecurityGroupProps = {
    vpc: vpcInst,
    allowAllOutbound: true,
  };
  const rules: IngressRule[] = [
    { peer: ec2.Peer.anyIpv4(), connection: ec2.Port.allTraffic() },
  ];
  const securityGroup = new SGIacStack(scope, GROUP_NAME, {
    env: { region: "us-east-1" },
    sgParams: params,
    ingressRules: rules,
  });
  return securityGroup;
}

export function createWebAppSecurityGroup(
  scope: Construct,
  vpcInst: ec2.Vpc,
  name: string
): SGIacStack {
  const GROUP_NAME = name + "sg";
  const params: ec2.SecurityGroupProps = {
    vpc: vpcInst,
    allowAllOutbound: true,
  };
  const rules: IngressRule[] = [
    { peer: ec2.Peer.anyIpv4(), connection: ec2.Port.allTraffic() },
  ];
  const securityGroup = new SGIacStack(scope, GROUP_NAME, {
    env: { region: "us-east-1" },
    sgParams: params,
    ingressRules: rules,
  });
  return securityGroup;
}
