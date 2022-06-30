import * as ec2 from "aws-cdk-lib/aws-ec2";
import { IngressRule, SGIacStack, SGProps } from "./sg_iac-stack";
import { Construct } from "constructs";
import { Stack, StackProps, aws_rds } from "aws-cdk-lib";

export class RDSStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    new aws_rds.DatabaseInstanceEngine();
  }
}
