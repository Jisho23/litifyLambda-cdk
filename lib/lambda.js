const core = require("@aws-cdk/core");
const lambda = require("@aws-cdk/aws-lambda");


class LitifyLambdas extends core.Construct {
  constructor(scope, id, dbAndBucket) {
    super(scope, id);
    
    // Lambda handlers
    this.getHandler = new lambda.Function(this, "LitifyLambdaGetHandler", {
      runtime: lambda.Runtime.NODEJS_10_X, // So we can use async in widget.js
      code: lambda.Code.fromAsset("resources"),
      handler: "productGetLambda.productGet",
      environment: {
        TABLE: dbAndBucket.table.tableName
      },
    });

    this.searchHandler = new lambda.Function(this, "LitifyLambdaSearchHandler", {
      runtime: lambda.Runtime.NODEJS_10_X, // So we can use async in widget.js
      code: lambda.Code.fromAsset("resources"),
      handler: "productSearchLambda.productSearch",
      environment: {
        TABLE: dbAndBucket.table.tableName
      },
    });

    this.createHandler = new lambda.Function(this, "LitifyLambdaCreateHandler", {
      runtime: lambda.Runtime.NODEJS_10_X, // So we can use async in widget.js
      code: lambda.Code.fromAsset("resources"),
      handler: "productCreateLambda.productCreate",
      environment: {
        TABLE: dbAndBucket.table.tableName
      },
    });
    
    dbAndBucket.table.grantReadWriteData(this.getHandler);
    dbAndBucket.table.grantReadWriteData(this.searchHandler);
    dbAndBucket.table.grantReadWriteData(this.createHandler)    
  }
}

module.exports = { LitifyLambdas }