const cdk = require('@aws-cdk/core');
const path = require('path');
const service = require( path.resolve( __dirname, "./litifylambda_service.js" ));

class LitifylambdaCdkStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);
    new service.LitifyService(this, 'Products');
  }
}

module.exports = { LitifylambdaCdkStack }
