const { dynamodb, TableName } = require('../../services/db')
const error = require('../../services/error')
const { QueryCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require('@aws-sdk/util-dynamodb');
// const {sortByTime} = require('../../utils/functions')
const { PutCommand, DynamoDBDocumentClient, DeleteCommand } = require('@aws-sdk/lib-dynamodb')
const crypto = require("crypto");

exports.createComment = async (postId, params) => {
  const commentId = crypto.randomUUID();
  params.commentId = commentId

  const Item = {
    PK: `POST#${postId}`,
    SK: `COMMENT#${commentId}`,
    text: params.comment,
    timestamp: params.time,
    user: `USER#${params.userId}`,
  }

  const newComment = {
    TableName,
    Item
  };

  await this.putToDatabase(newComment)
  delete params.secret
  return params
};

exports.getCommentById = async (postId, commentId) => {
  const params = {
    TableName,
    KeyConditionExpression: 'PK = :post AND SK = :comment',
    ExpressionAttributeValues: {
      ':post': { S: `POST#${postId}` },
      ':comment': { S: `COMMENT#${commentId}` },
    }
  }
  const comment = await this.getFromDatabase(params)

  if (comment.length > 1) throw new error.ServerError("multiple comments with id found")
  if (comment.length < 1) throw new error.NotFound(`comment with id ${commentId} not found`)

  return comment[0]
}

exports.deleteCommentById = async (postId, commentId) => {
  const params = {
    TableName,
    Key: {
      PK: `POST#${postId}`,
      SK: `COMMENT#${commentId}`
    }
  }
  const response = await this.deleteFromDatabase(params)

  return response
}

exports.getCommentsByPostId = async (postId) => {
  const params = {
    TableName,
    KeyConditionExpression: 'PK = :post',
    ExpressionAttributeValues: {
      ':post': { S: `POST#${postId}` },

    }
  }

  const comments = await this.getFromDatabase(params)

  return comments
}

exports.deleteFromDatabase = async (params) => {
  const command = new DeleteCommand(params)
  const docClient = DynamoDBDocumentClient.from(dynamodb)
  const response = await docClient.send(command)
  return response
}

exports.getFromDatabase = async (params) => {
  try {
    const query = new QueryCommand(params)
    const result = await dynamodb.send(query)
    return result.Items?.map(item => unmarshall(item))
  } catch (err) {
    console.error('failed to get data from database')
    console.error(err)
    throw new error.ServerError('unable to fetch comments from database')
  }
}

exports.putToDatabase = async (params) => {
  try {
    const docClient = DynamoDBDocumentClient.from(dynamodb)
    const command = new PutCommand(params)
    const res = await docClient.send(command)
    return res
  } catch (e) {
    console.error(e)
    throw new error.ServerError('failed to put to database')
  }
}
