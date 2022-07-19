import {
  Stack,
  StackProps,
  CfnOutput,
  CfnOutputProps,
  Tags,
  cfnTagToCloudFormation,
  aws_certificatemanager,
  aws_acmpca,
} from "aws-cdk-lib";
// import cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sgs from "./sc_commons";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ec2 from "aws-cdk-lib/aws-ec2";

import * as awspca from "aws-cdk-lib/aws-acmpca";

import {
  InstanceClass,
  SubnetType,
  UserData,
  VpcProps,
} from "aws-cdk-lib/aws-ec2";
import { VpcConfig } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { readFileSync } from "fs";

export interface PrivateCAStackProps extends StackProps {}

export class PrivateCA extends Stack {
  constructor(scope: Construct, id: string, props: PrivateCAStackProps) {
    super(scope, id, props);
    let private_ca = new awspca.CfnCertificateAuthority(this, "myprivate-CA", {
      type: "ROOT",
      keyAlgorithm: "RSA_2048",
      signingAlgorithm: "SHA256WITHRSA",
      subject: {
        country: "US",
        organization: "testorg",
        organizationalUnit: "testorg-ou",
        distinguishedNameQualifier: "string",
        state: "ca",
        commonName: "demo.testorg",
        serialNumber: "string",
        locality: "string",
        title: "Title-tbd",
        surname: "surname-tbd",
        givenName: "givenname-tbd",
        initials: "DG",
        pseudonym: "string",
        generationQualifier: "DBG",
      },
    });
    const root_cert = new awspca.CfnCertificate(this, "ca-cert", {
      certificateAuthorityArn: private_ca.attrArn,
      validity: { type: "DAYS", value: 1365 },
      certificateSigningRequest: private_ca.attrCertificateSigningRequest,
      signingAlgorithm: "SHA256WITHRSA",
      templateArn: "arn:aws:acm-pca:::template/RootCACertificate/V1",
    });

    const roo_ca_activation = new awspca.CfnCertificateAuthorityActivation(
      this,
      "cert-acti",
      {
        certificate: root_cert.attrCertificate,
        certificateAuthorityArn: private_ca.attrArn,
      }
    );

    const root_ca_permission = new awspca.CfnPermission(this, "ca_root_per", {
      actions: ["IssueCertificate", "GetCertificate", "ListPermissions"],
      principal: "acm.amazonaws.com",
      certificateAuthorityArn: private_ca.attrArn,
    });
    /** my app related CA */
    let private_subca = new awspca.CfnCertificateAuthority(
      this,
      "myprivate-subCA",
      {
        type: "SUBORDINATE",
        keyAlgorithm: "RSA_2048",
        signingAlgorithm: "SHA256WITHRSA",
        subject: {
          country: "US",
          organization: "testorg",
          organizationalUnit: "testorg-ou-sub",
          distinguishedNameQualifier: "string",
          state: "ca",
          commonName: "sub.demo.testorg",
          serialNumber: "string",
          locality: "string",
          title: "string",
          surname: "string",
          givenName: "string",
          initials: "DG",
          pseudonym: "string",
          generationQualifier: "DBG",
        },
      }
    );

    const root_subcert = new awspca.CfnCertificate(this, "ca-subcert", {
      certificateAuthorityArn: private_ca.attrArn,
      validity: { type: "DAYS", value: 1200 },
      certificateSigningRequest: private_subca.attrCertificateSigningRequest,
      signingAlgorithm: "SHA256WITHRSA",
      templateArn:
        "arn:aws:acm-pca:::template/SubordinateCACertificate_PathLen3/V1",
    });

    const sub_activation = new awspca.CfnCertificateAuthorityActivation(
      this,
      "subcert-acti",
      {
        certificate: root_subcert.attrCertificate,
        certificateAuthorityArn: private_subca.attrArn,
        certificateChain: roo_ca_activation.attrCompleteCertificateChain,
        status: "ACTIVE",
      }
    );

    const root_subca_permission = new awspca.CfnPermission(
      this,
      "subca_root_per",
      {
        actions: ["IssueCertificate", "GetCertificate", "ListPermissions"],
        principal: "acm.amazonaws.com",
        certificateAuthorityArn: private_subca.attrArn,
      }
    );

    /** Lets create the end entity certificate :) */

    //   new awspca.CfnCertificate(this, "my-node-cert", {certificateAuthorityArn: private_subca.attrArn,
    // } as aws_acmpca.CfnCertificateProps)
    /*

    const entity_certificate = new aws_certificatemanager.PrivateCertificate(
      this,
      "entity-certificate",
      {
        certificateAuthority:
          awspca.CertificateAuthority.fromCertificateAuthorityArn(
            this,
            "my-signing-ca",
            private_subca.attrArn
          ),
        domainName: "test-node.tesorg.com",
        // subjectAlternativeNames: ["cool.example.com", "test.example.net"], // optional
      }
    );
*/
    new CfnOutput(this, "my-private-root-ca", {
      value: private_ca.attrArn,
    });
  }
}
