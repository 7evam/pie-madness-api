const express = require('express')
const router = express.Router()
const { validateRequiredPostFields, handleError } = require('../../utils/requestHelper')
const { createUser, getUserInfo } = require('./users.service')

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
        console.log('here is resposne')
        console.log(response)
        res.status(201).json(response)

    } catch (e) {
        next(e)
    }
})

router.get('/users/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params
        console.log('in get user')
        console.log(userId)
        const user = await getUserInfo(userId)

        res.status(200).json(user)

    } catch (e) {
        next(e)
    }
})

module.exports = router
