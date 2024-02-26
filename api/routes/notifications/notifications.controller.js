const express = require('express')
const { getNotificationsByUserId, deleteNotificationById, getNotificationById } = require('./notifications.service')
const { getUserInfo } = require('../users/users.service')
const router = express.Router()

// get notifications by user id
router.get('/notifications', async (req, res, next) => {
    try {
        const userId = req.headers.userid

        // if user doesn't exist, this function will handle error
        await getUserInfo(userId)
        const notifications = await getNotificationsByUserId(userId)

        res.status(200).json(notifications)

    } catch (e) {
        next(e)
    }
})

router.delete('/notifications/:notificationId', async (req, res, next) => {
    try {
        const userId = req.headers.userid
        const { notificationId } = req.params

        // these functions will automatically handle errors
        // if user or notification dont exist
        await getUserInfo(userId)
        await getNotificationById(userId, notificationId)

        await deleteNotificationById(userId, notificationId)

        res.status(200).json("successfully deleted notification")

    } catch (e) {
        next(e)
    }
})

module.exports = router