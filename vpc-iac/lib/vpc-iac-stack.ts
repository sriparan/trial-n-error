import { Stack, StackProps, CfnOutput, CfnOutputProps } from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as vpc from "aws-cdk-lib/aws-ec2";
import { SubnetType, VpcProps } from "aws-cdk-lib/aws-ec2";
import { VpcConfig } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Ec2IacStack, JumperEc2Props } from "../lib/ec2_iac-stack";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export interface VpcIAcStackProps extends StackProps {
  azs: string[];
}
export class VpcIacStack extends Stack {
  publicsubnets: vpc.ISubnet[] = [];
  privateIsolatedSubnet: vpc.ISubnet[] = [];
  privateNatSubnet: vpc.ISubnet[] = [];
  myvpc: vpc.Vpc;

  constructor(scope: Construct, id: string, props?: VpcIAcStackProps) {
    super(scope, id, props);

    this.myvpc = new vpc.Vpc(this, "dev-vpc", {
      availabilityZones: props ? props.azs : [],
      cidr: "10.20.0.0/16",
      subnetConfiguration: [
        {
          subnetType: SubnetType.PUBLIC,
          name: "public_subnet",
          cidrMask: 24,
        },
        {
          subnetType: SubnetType.PRIVATE_WITH_NAT,
          name: "private_nat_subnet",
          cidrMask: 24,
        },
        {
          subnetType: SubnetType.PRIVATE_ISOLATED,
          name: "private_isolated_subnet",
          cidrMask: 24,
        },
      ],
    } as VpcProps);

    new CfnOutput(this, "myvpc", {
      value: this.myvpc.vpcId,
      exportName: `mainvpc`,
    } as CfnOutputProps);

    let count = 0;
    this.myvpc.publicSubnets.forEach((element: vpc.ISubnet) => {
      this.publicsubnets.push(element);

      new CfnOutput(this, `publicsubnet-${count}`, {
        value: element.subnetId,
        exportName: `publicsubnet-${count}`,
      });

      new CfnOutput(this, `publicsubnetrt-${count}`, {
        value: element.routeTable.routeTableId,
        exportName: `publicsubnetrt-${count}`,
      });

      count++;
    });

    let privCount = 0;
    this.myvpc.privateSubnets.forEach((e: vpc.ISubnet) => {
      this.privateNatSubnet.push(e);
      new CfnOutput(this, `privatesubnet-${privCount}`, {
        value: e.subnetId,
        exportName: `privatesubnet-${privCount}`,
      });
      new CfnOutput(this, `privatesubnetrt-${privCount}`, {
        value: e.routeTable.routeTableId,
        exportName: `privatesubnetrt-${privCount}`,
      });
      privCount++;
    });

    let isoCount = 0;
    this.myvpc.isolatedSubnets.forEach((e: vpc.ISubnet) => {
      this.privateIsolatedSubnet.push(e);
      new CfnOutput(this, `privateisosubnet-${isoCount}`, {
        value: e.subnetId,
        exportName: `privateisosubnet-${isoCount}`,
      });
      new CfnOutput(this, `privateisosubnetrt-${isoCount}`, {
        value: e.routeTable.routeTableId,
        exportName: `privateisosubnetrt-${isoCount}`,
      });
      isoCount++;
    });
  }
}
