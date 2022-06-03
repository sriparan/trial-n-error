import { Stack, StackProps, CfnOutput, CfnOutputProps } from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as vpc from "aws-cdk-lib/aws-ec2";
import { SubnetType, VpcProps } from "aws-cdk-lib/aws-ec2";
import { VpcConfig } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Ec2IacStack, JumperEc2Props } from "../lib/ec2_iac-stack";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export class VpcIacStack extends Stack {
  publicVpcId: vpc.ISubnet;
  privateSolatedSubnet: vpc.ISubnet;
  privateNatSubnet: vpc.ISubnet;
  myvpc: vpc.Vpc;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.myvpc = new vpc.Vpc(this, "dev-vpc", {
      maxAzs: 1,

      cidr: "10.20.0.0/16",
      subnetConfiguration: [
        { subnetType: SubnetType.PUBLIC, name: "public_subnet" },
        { subnetType: SubnetType.PRIVATE_WITH_NAT, name: "private_nat_subnet" },
        {
          subnetType: SubnetType.PRIVATE_ISOLATED,
          name: "private_isolated_subnet",
        },
      ],
    } as VpcProps);

    new CfnOutput(this, "myvpc", {
      value: this.myvpc.vpcArn,
    } as CfnOutputProps);

    this.myvpc.publicSubnets.forEach((element: vpc.ISubnet) => {
      this.publicVpcId = element;
      new CfnOutput(this, "publicsubnet", {
        value: element.subnetId,
        exportName: "publicsubnet",
      });
    });

    this.myvpc.privateSubnets.forEach((e: vpc.ISubnet) => {
      if (e.internetConnectivityEstablished) {
        this.privateNatSubnet = e;
        new CfnOutput(this, "privateNatSubnet", {
          value: e.subnetId,
          exportName: "privateNatSubnet",
        });
      } else {
        this.privateSolatedSubnet = e;
        new CfnOutput(this, "privateIsolatedSubnet", {
          value: e.subnetId,
          exportName: "privateIsolatedSubnet",
        });
      }
    });
  }
}
