
const { dynamodb, TableName } = require('../../services/db')
// const {sortByTime} = require('../../utils/functions')


exports.getUserInfo = async (userId, forSecret = false) => {
    const params = {
        TableName,
        Key: {
            PK: userId,
            SK: userId
        }
    }
    try {
        var user = await dynamodb.get(params).promise()
    } catch (err) {
        console.error('failed getting user info')
        console.log(err)
    }
    if (forSecret === false && user.Item?.secret) {
        delete user.Item.secret
    }
    return user.Item
}

exports.authenticateUser = async (userId, secret) => {
    let user
    try {
        user = await this.getUserInfo(`USER#${userId}`, true)
    } catch (err) {
        console.error('failed authenticating user')
        console.log(err)
    }
    let isUserAuthenticated = false
    if (user.secret === secret) isUserAuthenticated = true
    return isUserAuthenticated
};