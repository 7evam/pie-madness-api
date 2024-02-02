const AWS = require("aws-sdk");
if(process.env.AWS_SAM_LOCAL && process.env.AWS_SAM_LOCAL === 'true'){
    AWS.config.update({
        endpoint: "http://docker.for.mac.localhost:8000",
      });
}

exports.dynamodb = new AWS.DynamoDB.DocumentClient();
exports.TableName = process.env.AWS_SAM_LOCAL === 'true' ? 'pie_madness_local' : 'PieMadness'