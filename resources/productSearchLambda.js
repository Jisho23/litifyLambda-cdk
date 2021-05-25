console.log('Loading function');

var AWS = require('aws-sdk');
var dynamo = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE;
var tags = 'tags'

function formatTagFilterExpression(tagsArray)
{
    var returnArray = []
    tagsArray.forEach(function(v, i){ returnArray.push(`(tags, :tag${i+1})`)})
    returnArray.join(" OR contains ")
    return "contains " + returnArray
}

function formatExpressionAttrributeValues(tagsArray)
{
    var values = {}
    tagsArray.forEach(function(v, i){
        values[`:tag${i+1}`] = v
    })
    return values
}

function handleResponse(err, data, callback)
{
    if (err){callback(Error(err));} 
    else{    
      var response = {
        "statusCode": 200,
        "body": JSON.stringify({'_reports': data['items']}),
        "isBase64Encoded": false
        }; 
        callback(null, response)
    } 
}

exports.productSearch = function(event, context, callback) {
    console.log('Received event:', JSON.stringify(event, null, 2));
    var tagsArray = event['queryStringParameters']['tags'].split(',');
    var params = {
        TableName : tableName,
        FilterExpression: formatTagFilterExpression(tagsArray),
        ExpressionAttributeValues : formatExpressionAttrributeValues(tagsArray)
    };
    console.log('Searching db with params:', JSON.stringify(params, null, 2))
    dynamo.scan(params, function(err, data) { handleResponse(err, data, callback) });
};
