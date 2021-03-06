const core = require('@aws-cdk/core');
const path = require('path');
const db = require( path.resolve( __dirname, "./db.js" ));
const lambdas = require( path.resolve( __dirname, "./lambda.js" ));
const api = require( path.resolve( __dirname, "./api.js" ));


class LitifyService extends core.Construct {
  constructor(scope, id) {
    super(scope, id);
    const litifyDb = new db.LitifyDB(this, 'ProductsTableAndBucket');
    const lambdaHandlers = new lambdas.LitifyLambdas(this, 'ProductsLambdas', litifyDb)
    new api.LitifyApi(this, 'ProductsApi', lambdaHandlers)
  }
}

module.exports = { LitifyService }