const core = require("@aws-cdk/core");
const apigateway = require("@aws-cdk/aws-apigateway");
const lambda = require("@aws-cdk/aws-lambda");
const s3 = require("@aws-cdk/aws-s3");
const iam = require("@aws-cdk/aws-iam")

class LitifyService extends core.Construct {
  constructor(scope, id) {
    super(scope, id);

    const bucket = new s3.Bucket(this, "LitifyStore");

    //Role
    const role = new iam.Role(this, 'LitifyCDKLambdaRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com')   // required
    });
    role.addToPolicy(new iam.PolicyStatement({
        resources: ['*'],
        actions: [
          "dynamodb:DeleteItem",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:UpdateItem"
      ],
      effect: "Allow"
    }));
    
    // lambdaHandlers
    const getHandler = new lambda.Function(this, "LitifyLambdaGetHandler", {
      runtime: lambda.Runtime.NODEJS_10_X, // So we can use async in widget.js
      code: lambda.Code.fromAsset("resources"),
      handler: "productGetLambda.productGet",
      environment: {
        BUCKET: bucket.bucketName
      },
      role: role
    });

    const searchHandler = new lambda.Function(this, "LitifyLambdaSearchHandler", {
      runtime: lambda.Runtime.NODEJS_10_X, // So we can use async in widget.js
      code: lambda.Code.fromAsset("resources"),
      handler: "productSearchLambda.productSearch",
      environment: {
        BUCKET: bucket.bucketName
      },
      role: role
    });

    const createHandler = new lambda.Function(this, "LitifyLambdaCreateHandler", {
      runtime: lambda.Runtime.NODEJS_10_X, // So we can use async in widget.js
      code: lambda.Code.fromAsset("resources"),
      handler: "productCreateLambda.productCreate",
      environment: {
        BUCKET: bucket.bucketName
      },
      role: role
    });

    bucket.grantReadWrite(getHandler); 
    bucket.grantReadWrite(searchHandler); 
    bucket.grantReadWrite(createHandler); 

    // API Gate
    const api = new apigateway.RestApi(this, "litify-products-api", {
      restApiName: "Litify Products Service",
      description: "This service serves litify products."
    });

    const createProductsIntegration = new apigateway.LambdaIntegration(createHandler, {
      requestTemplates: { "application/json": '{ "statusCode": "201" }' }
    });
    api.root.addMethod("POST", createProductsIntegration); // POST /

    var get = api.root.addResource('{id}')
    const getProductsIntegration = new apigateway.LambdaIntegration(getHandler, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });
    get.addMethod("GET", getProductsIntegration); // GET /

    var search = api.root.addResource("search")
    const searchProductsIntegration = new apigateway.LambdaIntegration(searchHandler, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });
    search.addMethod("GET", searchProductsIntegration); // GET /
  }
}

module.exports = { LitifyService }