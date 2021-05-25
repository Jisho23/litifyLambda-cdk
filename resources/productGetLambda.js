console.log('Loading function');

var AWS = require('aws-sdk');
var dynamo = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE;

exports.productGet = function(event, context, callback) {
    var params = {
      TableName : tableName,
      Key: {
        id: event['id']
      }
    }
    console.log(`Searching for product ${event['id']} in ${tableName} `)
    dynamo.get(params, function(err, data) {
      if (err) callback(Error(err));
      else callback(null, data);
    });
};
