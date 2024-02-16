const AWS = require("aws-sdk");

if (process.env.AWS_SAM_LOCAL && process.env.AWS_SAM_LOCAL === 'true') {
  AWS.config.update({
    region: 'local',
    endpoint: process.env.TESTING_ENV === 'true'
      ? 'http://127.0.0.1:8000'
      : 'http://docker.for.mac.localhost:8000'
  });
}

exports.dynamodb = new AWS.DynamoDB.DocumentClient();
exports.TableName = process.env.AWS_SAM_LOCAL === 'true' ? 'pie_madness_local' : 'PieMadness'