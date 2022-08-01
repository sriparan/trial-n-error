import { Stack, StackProps, CfnOutput, CfnOutputProps } from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ec2 from "aws-cdk-lib/aws-ec2";

import {
  InstanceClass,
  SubnetType,
  UserData,
  VpcProps,
} from "aws-cdk-lib/aws-ec2";
import { VpcConfig } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { readFileSync } from "fs";

export interface IngressRule {
  peer: ec2.IPeer;
  connection: ec2.Port;
}

export interface SGProps extends StackProps {
  vpc: ec2.IVpc;
}

export class SGIacStack extends Construct {
  secGroup: ec2.SecurityGroup;
  constructor(scope: Construct, id: string, props: SGProps) {
    super(scope, id);

    const GROUP_NAME = id + "sg";
    const params: ec2.SecurityGroupProps = {
      vpc: props.vpc,
      allowAllOutbound: true,
    };
    const rules: IngressRule[] = [
      { peer: ec2.Peer.anyIpv4(), connection: ec2.Port.allTraffic() },
    ];
    const egressRules: IngressRule[] = [
      { peer: ec2.Peer.anyIpv4(), connection: ec2.Port.allTraffic() },
    ];

    this.secGroup = new ec2.SecurityGroup(this, "security-group", params);
    rules.forEach((c: IngressRule) => {
      this.secGroup.addIngressRule(c.peer, c.connection);
    });

    egressRules.forEach((c: IngressRule) => {
      this.secGroup.addEgressRule(c.peer, c.connection);
    });

    new CfnOutput(this, id, {
      value: this.secGroup.securityGroupId,
    } as CfnOutputProps);
  }
}
