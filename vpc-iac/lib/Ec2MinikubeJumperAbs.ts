import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as sgs from "./sc_commons";
import { Ec2IacStack, JumperEc2Props } from "./ec2_iac-stack";

export default function createMinikubeInstance(
  scope: Construct,
  vpcInst: ec2.Vpc,
  name: string
) {
  const user_data_script = "./infra_Src_code/minikube_user_data.sh";
  const securityGroup = sgs.createJumperSecurityGroup(scope, vpcInst, name);

  const instanceProps = {
    instanceType: new ec2.InstanceType("c5.xlarge"),
    instanceName: name,
    keyName: "usvirginia_keys",
    machineImage: new ec2.AmazonLinuxImage(),
    vpc: vpcInst,
    vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
  };

  const ec2Jumper = new Ec2IacStack(scope, name + "mini", {
    env: { region: "us-east-1" },
    ec2Params: instanceProps,
    user_data_script: user_data_script,
    sg: securityGroup.secGroup,
  } as JumperEc2Props);
  return ec2Jumper;
}
