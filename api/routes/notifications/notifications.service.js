
const { dynamodb, TableName } = require('../../services/db')
const error = require('../../services/error')
const { QueryCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require('@aws-sdk/util-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand, UpdateCommand, PutCommand } = require('@aws-sdk/lib-dynamodb')
const crypto = require("crypto");

// ## Notifications
//     -**PK**: NOTIFICATION#USER#{userId}
//     -**SK**: NOTIFICATION#{notificationId}
//     -**postId**: POST#{postId}
//     -**postTitle**: title

exports.createNotification = async (postId, postTitle, userId) => {
    const notificationId = crypto.randomUUID()
    const newPost = {
        TableName,
        Item: {
            PK: `NOTIFICATION#USER#${userId}`,
            SK: `NOTIFICATION#${notificationId}`,
            postId,
            postTitle
        }
    }
    const result = await this.putToDatabase(newPost)
    return result
}

exports.getNotificationsByUserId = async (userId) => {
    const params = {
        TableName,
        KeyConditionExpression: 'PK = :UserId',
        ExpressionAttributeValues: {
            ':UserId': { S: `NOTIFICATION#USER#${userId}` },
        }
    }
    const notifications = await this.getFromDatabase(params)
    return notifications
}

exports.deleteNotificationById = async (userId, notificationId) => {
    const params = {
        TableName,
        Key: {
            PK: `NOTIFICATION#USER#${userId}`,
            SK: `NOTIFICATION#${notificationId}`
        }
    }
    const response = await this.deleteFromDatabase(params)
    return response
}

exports.getNotificationById = async (userId, notificationId) => {
    const params = {
        TableName,
        KeyConditionExpression: 'PK = :UserId AND SK = :NotificationId',
        ExpressionAttributeValues: {
            ':UserId': { S: `NOTIFICATION#USER#${userId}` },
            ':NotificationId': { S: `NOTIFICATION#${notificationId}` },
        }
    }
    const notification = await this.getFromDatabase(params)
    if (notification.length < 1) throw new error.NotFound('Notification not found')
    return notification
}

// Database functions

exports.deleteFromDatabase = async (params) => {
    try {
        const command = new DeleteCommand(params)
        const docClient = DynamoDBDocumentClient.from(dynamodb)
        const response = await docClient.send(command)
        return response
    } catch (e) {
        console.error(e)
        throw new error.ServerError('unable to delete post from database')
    }
}

exports.putToDatabase = async (params) => {
    try {
        const docClient = DynamoDBDocumentClient.from(dynamodb)
        const query = new PutCommand(params)
        const res = await docClient.send(query)
        return res
    } catch (e) {
        console.error(e)
        throw new error.ServerError('failed to put to database')
    }
}

exports.getFromDatabase = async (params) => {
    try {
        const query = new QueryCommand(params)
        const result = await dynamodb.send(query)
        return result.Items?.map(item => unmarshall(item))
    } catch (err) {
        console.error('failed to get data from database')
        console.error(err)
        throw new error.ServerError('unable to fetch from database')
    }
}