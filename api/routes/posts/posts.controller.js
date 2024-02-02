const express = require('express')
const router = express.Router()
const {getPostsByContestId, createPost} = require('./posts.service')
const {authenticateUser, getUserInfo} = require('../users/users.service')
const {validateRequiredPostFields, handleError} =  require('../../utils/requestHelper')

router.get("/posts/contestId/:contestId", async (req, res) => {

    const {contestId} = req.params

    // get posts
    const posts = await getPostsByContestId(contestId)
    
    // create array of users needed to fetch
    const users = []
    for(const post of posts){
        if(!(users.includes(post.user))){
            users.push(post.user)
        }
    }

    // get data for each user
    const userTable = {}
    for(const user of users){
        const userInfo = await getUserInfo(user)
        userTable[user] = userInfo
    }

    // append user info on each post
    posts.forEach(post => {
        post.user = userTable[post.user]
    })

    res.status(200).json(posts)
});

router.post('/posts/contestId/:contestId', async (req, res) => {

    const {contestId} = req.params
    const {body} = req
    
    const validationErrors = validateRequiredPostFields({
        'text': {
            required: true,
            notEmpty: true
        },
        'title':{
            required: true,
            notEmpty: true
        },
        'userId':{
            required: true,
            notEmpty: true
        },
        'secret':{
            required: true,
            notEmpty: true
        }
    }, body)

    if(validationErrors.error){
        res.status(400).json(validationErrors)
        return
    }

    const isValid = await authenticateUser(body.userId, body.secret)
    // TODO
    // await createNotificationSetting()
    
    if(isValid){
        const post = await createPost(contestId, body)
        handleError(res, post)
        res.status(201).json(post)
    } else {
        res.status(401).json({error: 'Unauthorized'})
    }

})

module.exports = router
