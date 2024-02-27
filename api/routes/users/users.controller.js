const express = require('express')
const router = express.Router()
const { validateRequiredPostFields, handleError } = require('../../utils/requestHelper')
const { createUser, getUserInfo, updateUser, authenticateUser } = require('./users.service')

// create user
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

// get user
router.get('/users/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params

        const user = await getUserInfo(userId)

        res.status(200).json(user)

    } catch (e) {
        next(e)
    }
})

// edit user
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

// import profile
router.post('/users/import-profile', async (req, res, next) => {
    try {
        const { userId, secret } = req.body

        const validationErrors = validateRequiredPostFields({
            'userId': {
                required: true,
                notEmpty: true
            },
            'secret': {
                required: true,
                notEmpty: true
            }
        }, req.body)

        if (validationErrors.error) {
            res.status(400).json(validationErrors)
            return
        }

        const isValid = await authenticateUser(userId, secret)

        if (!isValid) {
            res.status(401).json({ error: 'Unauthorized' })
            return
        }

        const user = await getUserInfo(userId, true)

        res.status(200).json(user)
    } catch (e) {
        next(e)
    }
})

module.exports = router
