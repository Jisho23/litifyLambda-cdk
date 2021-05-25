const core = require("@aws-cdk/core");
const dynamoDb = require("@aws-cdk/aws-dynamodb")


class LitifyDB extends core.Construct {
  constructor(scope, id) {
    super(scope, id);

    //  Tables
    this.table = new dynamoDb.Table(this, 'LitifyProductsTable', {
      partitionKey: { name: 'id', type: dynamoDb.AttributeType.STRING }
    });
    
  }
}

module.exports = { LitifyDB }