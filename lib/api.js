const core = require("@aws-cdk/core");
const apigateway = require("@aws-cdk/aws-apigateway");
const path = require('path');
const template = require( path.resolve( __dirname, "../resources/productsModel.json" ));


class LitifyApi extends core.Construct {
  constructor(scope, id, lambdas) {
    super(scope, id);

    // API Gate
    const api = new apigateway.RestApi(this, "litify-products-api", {
      restApiName: "Litify Products Service",
      description: "This service serves litify products."
    });

    // Integrations
    // Create
    const productsRoute = api.root.addResource('products')
    const createProductsIntegration = new apigateway.LambdaIntegration(lambdas.createHandler, {
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
    const getProductsIntegration = new apigateway.LambdaIntegration(lambdas.getHandler, {
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
    const searchProductsIntegration = new apigateway.LambdaIntegration(lambdas.searchHandler, {
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

module.exports = { LitifyApi }