const core = require("@aws-cdk/core");
const apigateway = require("@aws-cdk/aws-apigateway");
const lambda = require("@aws-cdk/aws-lambda");
const s3 = require("@aws-cdk/aws-s3");
const dynamoDb = require("@aws-cdk/aws-dynamodb")
const path = require('path');
const template = require( path.resolve( __dirname, "../resources/productsModel.json" ));


class LitifyService extends core.Construct {
  constructor(scope, id) {
    super(scope, id);

    //Tables
    const bucket = new s3.Bucket(this, "LitifyStore");
    const table = new dynamoDb.Table(this, 'LitifyProductsTable', {
      partitionKey: { name: 'id', type: dynamoDb.AttributeType.STRING }
    });
    
    // lambdaHandlers
    const getHandler = new lambda.Function(this, "LitifyLambdaGetHandler", {
      runtime: lambda.Runtime.NODEJS_10_X, // So we can use async in widget.js
      code: lambda.Code.fromAsset("resources"),
      handler: "productGetLambda.productGet",
      environment: {
        BUCKET: bucket.bucketName,
        TABLE: table.tableName
      },
    });

    const searchHandler = new lambda.Function(this, "LitifyLambdaSearchHandler", {
      runtime: lambda.Runtime.NODEJS_10_X, // So we can use async in widget.js
      code: lambda.Code.fromAsset("resources"),
      handler: "productSearchLambda.productSearch",
      environment: {
        BUCKET: bucket.bucketName,
        TABLE: table.tableName
      },
    });

    const createHandler = new lambda.Function(this, "LitifyLambdaCreateHandler", {
      runtime: lambda.Runtime.NODEJS_10_X, // So we can use async in widget.js
      code: lambda.Code.fromAsset("resources"),
      handler: "productCreateLambda.productCreate",
      environment: {
        BUCKET: bucket.bucketName,
        TABLE: table.tableName
      },
    });

    bucket.grantReadWrite(getHandler); 
    bucket.grantReadWrite(searchHandler); 
    bucket.grantReadWrite(createHandler); 

    table.grantReadWriteData(getHandler);
    table.grantReadWriteData(searchHandler);
    table.grantReadWriteData(createHandler)

    // API Gate
    const api = new apigateway.RestApi(this, "litify-products-api", {
      restApiName: "Litify Products Service",
      description: "This service serves litify products."
    });

    // Integrations
    // Create
    const productsRoute = api.root.addResource('products')
    const createProductsIntegration = new apigateway.LambdaIntegration(createHandler, {
      allowTestInvoke: true,
      proxy: false,
      
      integrationResponses: [
        {
          statusCode: "201",
          responseTemplates: {
            'application/json': "Empty"
          }
        }
      ],
      methodResponses: [{ statusCode: '201' }]
    });
    productsRoute.addMethod("POST", createProductsIntegration); // POST /

    // Get
    var get = productsRoute.addResource('{id}')
    const getProductsIntegration = new apigateway.LambdaIntegration(getHandler, {
      allowTestInvoke: true,      
      proxy: false,
      requestTemplates: { "application/json": `{  "id": "$input.params('id')" }` },
      integrationResponses: [
        {
          statusCode: "200",
          responseTemplates: {
            'application/json': "Empty"
          }
        }
      ],
      methodResponses: [{ statusCode: '200' }]
    });
    get.addMethod("GET", getProductsIntegration); // GET /

    // Search
    var search = productsRoute.addResource("search")
    const searchProductsIntegration = new apigateway.LambdaIntegration(searchHandler, {
      allowTestInvoke: true,
      proxy: false,
      requestTemplates: {"application/json": `"tags": "$input.params('tags')"`},
      requestValidatorOptions: {
        requestValidatorName: 'test-search-validator',
        validateRequestParameters: true
      },
      integrationResponses: [
        {
          statusCode: "200",
          responseTemplates: {
            'application/json': "Empty"
          }
        }
      ],
      methodResponses: [{ statusCode: '200' }]
    });
    search.addMethod("GET", searchProductsIntegration); // GET /
  }
}

module.exports = { LitifyService }