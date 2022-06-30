import {
  Stack,
  NestedStack,
  StackProps,
  CfnOutput,
  CfnOutputProps,
  NestedStackProps,
} from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as vpc from "aws-cdk-lib/aws-ec2";
import {
  CfnRouteTable,
  IRouteTable,
  SubnetType,
  Vpc,
  VpcProps,
} from "aws-cdk-lib/aws-ec2";
import { VpcConfig } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Ec2IacStack, JumperEc2Props } from "../lib/ec2_iac-stack";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { SecretStringValueBeta1 } from "aws-cdk-lib/aws-secretsmanager";

class MySingleAZVPC extends vpc.Vpc {
  publicSubnet: vpc.ISubnet;
  privateSolatedSubnet: vpc.ISubnet;
  privateNatSubnet: vpc.ISubnet;
  privateNatSubnetRouteTable: IRouteTable;

  publicNatSubnetRouteTable: IRouteTable;
  isolatedNatSubnetRouteTable: IRouteTable;

  constructor(scope: Construct, id: string, props?: vpc.VpcProps) {
    super(scope, id, props);
    this.publicSubnets.forEach((element: vpc.ISubnet) => {
      this.publicSubnet = element;
      this.publicNatSubnetRouteTable = this.publicSubnet.routeTable;
    });
    this.privateSubnets.forEach((e: vpc.ISubnet) => {
      this.privateNatSubnet = e;
      this.privateNatSubnetRouteTable = this.privateNatSubnet.routeTable;
    });

    this.isolatedSubnets.forEach((e: vpc.ISubnet) => {
      this.privateSolatedSubnet = e;
      this.isolatedNatSubnetRouteTable = this.privateSolatedSubnet.routeTable;
    });
  }
}
export class USWest2VpcIacStack extends NestedStack {
  myvpc: MySingleAZVPC;

  constructor(scope: Construct, id: string, props?: NestedStackProps) {
    super(scope, id, props);

    this.myvpc = new MySingleAZVPC(this, "dev-vpc", {
      availabilityZones: ["us-west-2b", "us-west-2a"],
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

    // const lzRouteTable = new vpc.CfnRouteTable(this, "lzroutetable", {
    //   vpcId: this.myvpc.vpcId,
    // } as vpc.CfnRouteTableProps);

    // const lzNat = new vpc.CfnNatGateway(this, "lzNAt", {
    //   subnetId: sub1.subnetId,
    // } as vpc.CfnNatGatewayProps);
    // new CfnOutput(this, "myvpc", {
    //   value: this.myvpc.vpcArn,
    // } as CfnOutputProps);

    new CfnOutput(this, "myvpc", {
      value: this.myvpc.vpcArn,
    } as CfnOutputProps);

    new CfnOutput(this, "publicsubnet", {
      value: this.myvpc.publicSubnet.subnetId,
      exportName: "publicsubnet",
    });

    new CfnOutput(this, "privateNatSubnet", {
      value: this.myvpc.privateNatSubnet.subnetId,
      exportName: "privateNatSubnet",
    });

    new CfnOutput(this, "privateIsolatedSubnet", {
      value: this.myvpc.privateSolatedSubnet.subnetId,
      exportName: "privateIsolatedSubnet",
    });

    new CfnOutput(this, "publicSubnetRT", {
      value: this.myvpc.publicSubnet.routeTable.routeTableId,
      exportName: "publicSubnetRT",
    });
    new CfnOutput(this, "privateNatSubnetRT", {
      value: this.myvpc.privateNatSubnet.routeTable.routeTableId,
      exportName: "privateNatSubnetRT",
    });
    new CfnOutput(this, "isolatedSubnetRT", {
      value: this.myvpc.privateSolatedSubnet.routeTable.routeTableId,
      exportName: "isolatedSubnetRT",
    });
  }
}

// export interface ExtraAzProps extends StackProps {
//   vpcParent: MySingleAZVPC;
// }
interface ExtraAzProps extends StackProps {
  parentVPCId: string;
  routeTableId: string;
}
export class ExtraAz extends Stack {
  // readonly rootvpc: Vpc;

  constructor(scope: Construct, id: string, props?: ExtraAzProps) {
    super(scope, id, props);
    if (props) {
      // const { myvpc } = new USWest2VpcIacStack(this, "DevVPCStack", {
      //   env: { region: "us-west-2" },
      // } as NestedStackProps);

      // this.rootvpc = props.parentVPC;
      // this.rootvpc = vpcParent;
      console.log(props.parentVPCId);
      console.log(props.routeTableId);
      let sub1 = new ec2.Subnet(this, "azSubnet1", {
        availabilityZone: "us-west-2-phx-1a",
        cidrBlock: "10.20.100.10/24",
        mapPublicIpOnLaunch: true,
        vpcId: props.parentVPCId,
      } as vpc.SubnetProps);

      const cfnSubnetRouteTableAssociation =
        new ec2.CfnSubnetRouteTableAssociation(
          this,
          "MyCfnSubnetRouteTableAssociation",
          {
            routeTableId: props.routeTableId,
            subnetId: sub1.subnetId,
          }
        );

      new CfnOutput(this, "lzSubnet", {
        value: sub1.subnetId,
        exportName: "lzSubNetId",
      });
      new CfnOutput(this, "lzSubnetRT", {
        value: sub1.routeTable.routeTableId,
        exportName: "lzSubNetRT",
      });
    }
  }
}
