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
  sgParams: ec2.SecurityGroupProps;
  ingressRules: IngressRule[];
}

export class SGIacStack extends Stack {
  secGroup: ec2.SecurityGroup;
  constructor(scope: Construct, id: string, props: SGProps) {
    super(scope, id, props);

    this.secGroup = new ec2.SecurityGroup(
      this,
      "security-group",
      props.sgParams
    );
    props.ingressRules.forEach((c: IngressRule) => {
      this.secGroup.addIngressRule(c.peer, c.connection);
    });

    new CfnOutput(this, id, {
      value: this.secGroup.securityGroupId,
    } as CfnOutputProps);
  }
}
