const express = require('express')
const router = express.Router()
const { validateRequiredPostFields, handleError } = require('../../utils/requestHelper')
const { createUser, getUserInfo, updateUser, authenticateUser } = require('./users.service')

router.post('/users', async (req, res, next) => {
    try {
        const { body } = req

        const validationErrors = validateRequiredPostFields({
            'name': {
                required: true,
                notEmpty: true
            },
            'favoritePie': {
                required: true
            }
        }, body)

        if (validationErrors.error) {
            res.status(400).json(validationErrors)
            return
        }

        const response = await createUser(body)
        res.status(201).json(response)

    } catch (e) {
        next(e)
    }
})

router.get('/users/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params

        const user = await getUserInfo(userId)

        res.status(200).json(user)

    } catch (e) {
        next(e)
    }
})

router.put('/users/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params
        const { body } = req

        const validationErrors = validateRequiredPostFields({
            'name': {
                required: true,
                notEmpty: true
            },
            'secret': {
                required: true,
                notEmpty: true
            },
            'favoritePie': {
                required: true
            }
        }, body)

        if (validationErrors.error) {
            res.status(400).json(validationErrors)
            return
        }

        const isValid = await authenticateUser(userId, body.secret)

        if (isValid) {
            const user = await updateUser(body)
            res.status(200).json(user)
        } else {
            res.status(401).json({ error: 'Unauthorized' })
        }

        const user = await getUserInfo(userId)

        res.status(200).json(user)

    } catch (e) {
        next(e)
    }
})

module.exports = router
