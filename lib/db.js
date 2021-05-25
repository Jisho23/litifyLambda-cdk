const core = require("@aws-cdk/core");
const apigateway = require("@aws-cdk/aws-apigateway");
const lambda = require("@aws-cdk/aws-lambda");
const s3 = require("@aws-cdk/aws-s3");
const dynamoDb = require("@aws-cdk/aws-dynamodb")
const path = require('path');
const template = require( path.resolve( __dirname, "../resources/productsModel.json" ));


class LitifyDBAndBucket extends core.Construct {
  constructor(scope, id) {
    super(scope, id);

    // Bucket and Tables
    this.bucket = new s3.Bucket(this, "LitifyStore");
    this.table = new dynamoDb.Table(this, 'LitifyProductsTable', {
      partitionKey: { name: 'id', type: dynamoDb.AttributeType.STRING }
    });
    
  }
}

module.exports = { LitifyDBAndBucket }