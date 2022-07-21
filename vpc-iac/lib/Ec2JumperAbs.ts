import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as sgs from "./sc_commons";
import { Ec2IacStack, JumperEc2Props } from "./ec2_iac-stack";
import { IngressRule, SGIacStack, SGProps } from "./sg_iac-stack";
import { NestedStack, Stack, StackProps } from "aws-cdk-lib";

export interface JumperInstanceProps extends StackProps {
  vpc: ec2.IVpc;
  user_data_script: string;
}

export default class JumperInstance extends Stack {
  constructor(scope: Construct, name: string, props: JumperInstanceProps) {
    super(scope, name, props);

    const securityGroup = new SGIacStack(this, name + "sg", {
      vpc: props.vpc,
    });

    const instanceProps = {
      instanceType: new ec2.InstanceType("t3.xlarge"),
      instanceName: name,
      keyName: "usvirginia_keys",
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      vpc: props.vpc,

      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
    };

    const ec2Jumper = new Ec2IacStack(this, name + "jumper", {
      ec2Params: instanceProps,
      user_data_script: props.user_data_script,
      sg: securityGroup.secGroup,
    } as JumperEc2Props);
  }
}
