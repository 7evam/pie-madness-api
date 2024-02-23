
const { dynamodb, TableName } = require('../../services/db')
const error = require('../../services/error')
const { QueryCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require('@aws-sdk/util-dynamodb');
const crypto = require("crypto");
// const {sortByTime} = require('../../utils/functions')
const { PutCommand, DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb')

exports.getUserInfo = async (userId, forSecret = false) => {
    const params = {
        TableName,
        KeyConditionExpression: 'PK = :UserId',
        ExpressionAttributeValues: {
            ':UserId': { S: `USER#${userId}` }
        }
    }

    let user = await this.getFromDatabase(params)
    if (user.length > 1) throw new error.ServerError('Multiple users with ID found')
    if (user.length < 1) throw new error.NotFound('User not found')
    user = user[0]
    if (forSecret === false && user.secret) {
        delete user.secret
    }
    return user
}

exports.getFromDatabase = async (params) => {
    console.log('params to get from db')
    console.log(params)
    try {
        const query = new QueryCommand(params)
        const result = await dynamodb.send(query)
        return result.Items?.map(item => unmarshall(item))
    } catch (err) {
        console.error('failed to get data from database')
        console.error(err)
        throw new error.ServerError('unable to fetch user from database')
    }
}

exports.authenticateUser = async (userId, secret) => {
    let user
    try {
        user = await this.getUserInfo(userId, true)
    } catch (err) {
        console.error('failed authenticating user')
        console.log(err)
    }
    let isUserAuthenticated = false
    if (user.secret === secret) isUserAuthenticated = true
    return isUserAuthenticated
};

exports.createUser = async (params) => {
    const secret = crypto.randomUUID();
    const userId = crypto.randomUUID();
    params.secret = secret
    params.userId = userId

    const newPost = {
        TableName,
        Item: {
            PK: `USER#${params.userId}`,
            SK: `USER#${params.userId}`,
            secret: params.secret,
            image: params.image,
            user: params.name,
        }
    }
    await this.putToDatabase(newPost)

    return params
}

exports.putToDatabase = async (params) => {
    try {
        const docClient = DynamoDBDocumentClient.from(dynamodb)
        const query = new PutCommand(params)
        const res = await docClient.send(query)
        return res
    } catch (e) {
        console.error(e)
        throw new error.ServerError('failed to put user to database')
    }
}