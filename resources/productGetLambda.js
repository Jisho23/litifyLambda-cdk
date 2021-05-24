console.log('Loading function');

var AWS = require('aws-sdk');
var dynamo = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.BUCKET;

exports.productGet = function(event, context, callback) {
    var params = {
      TableName : tableName,
      Key: {
        id: event['id']
      }
    }
    dynamo.get(params, function(err, data) {
      if (err) callback(Error(err));
      else callback(null, data);
    });
};
