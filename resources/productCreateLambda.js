console.log('Loading function');

var AWS = require('aws-sdk');
var dynamo = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE;
var invalidBodyRequestString = "Invalid request body"

function ifNull(str)
{
   return str === null || str.match(/^ *$/) !== null;
}

// Generate random string for id
function generateId(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

// The validate request in the api gate should do most of the heavy lifting for
// validating the body from an incoming request, this is one more check as there
// is an observed issue with Invoke-Webrequest via powershell ignoring validate.
function validateEvent(event, callback)
{
    if(ifNull(event.name) || event.price <= 0 || event.tags.some(ifNull))
    {
        callback(Error(invalidBodyRequestString))
    }
}

// Handler
exports.productCreate = function(event, context, callback) {
    console.log('Received event:', JSON.stringify(event, null, 2));
    validateEvent(event, callback)
    event['id'] = generateId(9, '0123456789')
    var newItem = {
        TableName: tableName,
        Item: event
    }
    dynamo.put(newItem, function(err, data) {
      if (err) callback(Error(err));
      else     callback(null, event)
    });
};