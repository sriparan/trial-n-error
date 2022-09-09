#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { VpcIAcStackProps, VpcIacStack } from "../lib/vpc-iac-stack";
import { ALBStack, ALBStackProps } from "../lib/alb-stack";
import { USWest2VpcIacStack, ExtraAz } from "../lib/us-west-2-vpc-iac-stack";
import { Ec2IacStack, JumperEc2Props } from "../lib/ec2_iac-stack";
import { ASGStack, ASGProps } from "../lib/asg-waec2-stack";

import { IngressRule, SGIacStack, SGProps } from "../lib/sg_iac-stack";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import JumperInstance from "../lib/Ec2JumperAbs";
import createMinikubeInstance from "../lib/Ec2MinikubeJumperAbs";
import createWebappInstance from "../lib/Ec2WebappAbs";
import { MyAPIGateway } from "../lib/api-gw-stack";
import { Route53Health, RTStackProps } from "../lib/route53_health";

import { RuleScope } from "aws-cdk-lib/aws-config";
import * as sgs from "../lib/sc_commons";
import S3EventSampleStack from "../lib/s3-event-sample-stack";
import { PrivateCA, PrivateCAStackProps } from "../lib/privateca-stack";
import { StackProps } from "aws-cdk-lib";

let inDevMode = true;

const app = new cdk.App();

let AMI_ID = "ami-00370c9cadeff4fc9";

if (inDevMode) {
  const vpcStack = new VpcIacStack(app, "VpcIacStack", {
    env: { region: "us-west-2" },
    azs: ["us-west-2a", "us-west-2b"],
  } as VpcIAcStackProps);

  const localZoneAZ = new ExtraAz(app, "extraAZ", {
    env: { region: "us-west-2" },
    parentVPCId: cdk.Fn.importValue("mainvpc"), //vpcStack.myvpc.vpcId,
    routeTableId: cdk.Fn.importValue("privatesubnetrt-0"),
  });

  const myALB = new ALBStack(app, "web-alb", {
    env: { region: "us-west-2" },
    vpc: vpcStack.myvpc,
    publicSubnets: vpcStack.publicsubnets,
    privateNatSubnet: vpcStack.privateNatSubnet,
    privateIsolatedSubnet: vpcStack.privateIsolatedSubnet,
  });

  new JumperInstance(app, "bastion-node", {
    env: { region: "us-west-2" },
    vpc: vpcStack.myvpc,
    user_data_script: "./infra_Src_code/jumper_user_data.sh",
  });

  new JumperInstance(app, "tmp-bastion-node", {
    env: { region: "us-west-2" },
    vpc: vpcStack.myvpc,
    user_data_script: "./infra_Src_code/jumper_user_data.sh",
  });

  new MyAPIGateway(app, "rest-ep-east1", { env: { region: "us-east-1" } });
  const east2apigw = new MyAPIGateway(app, "rest-ep-east2", {
    env: { region: "us-east-2" },
  });
  // new Route53Health(app, "health-us-east2", {
  //   env: { region: "us-east-2" },
  //   apiURL: "Sdfds",
  //   path: "prod",
  //   type: "HTTPS",
  // });
  new MyAPIGateway(app, "rest-ep-west1", { env: { region: "us-west-1" } });
  new MyAPIGateway(app, "rest-ep-west2", { env: { region: "us-west-2" } });
  new MyAPIGateway(app, "rest-ap-se1", { env: { region: "ap-southeast-1" } });
  new MyAPIGateway(app, "rest-ap-se2", { env: { region: "ap-southeast-2" } });
  new MyAPIGateway(app, "rest-ap-south1", { env: { region: "ap-south-1" } });
  new MyAPIGateway(app, "rest-eu-west1", { env: { region: "eu-west-1" } });

  new S3EventSampleStack(app, "s3-event-test");
  new PrivateCA(app, "private-ca", { env: { region: "us-west-2" } });

  // new RDSStack(app, "RDSstack");
} else {
  // const vpcStack = new VpcIacStack(app, "VpcIacStack", {
  //   env: { region: "us-east-1" },
  //   azs: ["us-east-1a", "us-east-1b"],
  // } as VpcIAcStackProps);
  // createJumperInstance(vpcStack, vpcStack.myvpc, "bastion");
  // createMinikubeInstance(vpcStack, vpcStack.myvpc, "bastion-mk");
  // createWebappInstance(vpcStack, vpcStack.myvpc, "bastion-wa");
  // const webAppASG = new ASGStack(vpcStack, "web-asg", {
  //   vpc: vpcStack.myvpc,
  // });
  /** STACK for S3 Events testing */
  //Lets do this if need to test s3 events
}
