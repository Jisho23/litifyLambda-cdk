console.log('Loading function');

var AWS = require('aws-sdk');
var dynamo = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE;

function handleResponse(err, data, callback)
{
    if (err){callback(Error(err));} 
    else{    
      var response = {
        "statusCode": 200,
        "body": JSON.stringify(data),
        "isBase64Encoded": false
        }; 
        callback(null, response)
    } 
}

exports.productGet = function(event, context, callback) {
    console.log('Received event:', JSON.stringify(event, null, 2));
    var params = {
      TableName : tableName,
      Key: {
        id: event['pathParameters']['id']
      }
    }
    console.log(`Searching for product ${event['id']} in ${tableName} `)
    dynamo.get(params, function(err, data) {
      handleResponse(err, data, callback)
    });
};