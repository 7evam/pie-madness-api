const express = require('express')
const router = express.Router()
const { updatePost, getPostsByContestId, createPost, getPostById, deletePostById } = require('./posts.service')
const { authenticateUser, getUserInfo } = require('../users/users.service')
const { validateRequiredPostFields, handleError } = require('../../utils/requestHelper')
const { getCommentsByPostId } = require('../comments/comments.service')

// get posts by contest id
router.get("/posts/contestId/:contestId", async (req, res, next) => {
    try {
        const { contestId } = req.params

        // get posts
        const posts = await getPostsByContestId(contestId)

        // create array of users needed to fetch
        const users = []
        for (const post of posts) {
            let user = post.user
            if (user && user.includes('USER#')) user = user.split('#')[1]
            if (!(users.includes(user))) {
                users.push(user)
            }
        }

        // get data for each user
        const userTable = {}
        for (let user of users) {
            userTable[user] = await getUserInfo(user)
        }

        // append user info on each post
        posts.forEach(post => {
            post.user = userTable[post.user]
        })

        res.status(200).json(posts)
    } catch (err) {
        next(err)
    }
});

// get post by id
router.get("/posts/:postId", async (req, res, next) => {
    try {
        const { postId } = req.params

        // if post doesn't have year in id 
        // the post is unable to be retreived
        const year = postId.split('-')[0]
        if (year.length !== 4) {
            res.status(400).json({ error: "Unable to retrieve post without year" })
            return
        }

        // get post
        const post = await getPostById(year, postId)

        // get comments
        const comments = await getCommentsByPostId(postId)

        // create array of users needed to fetch
        // start with user from post
        const users = [post.user]
        for (const comment of comments) {
            if (!(users.includes(comment.user))) {
                users.push(comment.user)
            }
        }

        // get data for each user
        const userTable = {}
        for (let user of users) {
            userTable[user] = await getUserInfo(user)
        }

        // append user info on post and each comment
        post.user = userTable[`USER#${post.user}`]
        comments.forEach(comment => {
            comment.user = userTable[comment.user]
        })
        post.comments = comments
        res.status(200).json(post)
    } catch (err) {
        console.log("in catch in get post")
        next(err)
    }
})

// create post
router.post('/posts/contestId/:contestId', async (req, res, next) => {
    try {
        const { contestId } = req.params
        const { body } = req

        const validationErrors = validateRequiredPostFields({
            'text': {
                required: true,
                notEmpty: true
            },
            'title': {
                required: true,
                notEmpty: true
            },
            'userId': {
                required: true,
                notEmpty: true
            },
            'secret': {
                required: true,
                notEmpty: true
            }
        }, body)

        if (validationErrors.error) {
            res.status(400).json(validationErrors)
            return
        }

        const isValid = await authenticateUser(body.userId, body.secret)
        delete body.secret
        // TODO
        // await createNotificationSetting()

        if (isValid) {
            const post = await createPost(contestId, body)
            handleError(res, post)
            res.status(201).json(post)
        } else {
            res.status(401).json({ error: 'Unauthorized' })
        }
    } catch (e) {
        next(e)
    }
})

// delete post
router.delete('/posts/:postId', async (req, res, next) => {
    const { postId } = req.params;
    const secret = req.headers.authorization
    if (!secret.length) {
        res.status(401).json({ error: "Unauthorized" })
        return
    }

    // if post doesn't have year in id 
    // the post is unable to be retreived
    const year = postId.split('-')[0]
    if (year.length !== 4) {
        res.status(400).json({ error: "Unable to retrieve post without year" })
        return
    }

    const post = await getPostById(year, postId)

    const isValid = await authenticateUser(post.user, secret)

    if (!isValid) {
        res.status(401).json({ error: "Unauthorized" })
        return
    }

    // TODO
    // consider deleting all comments associated with post

    await deletePostById(year, postId)

    res.status(200).json("successfully deleted post")
})

// edit post
router.put('/posts/:postId', async (req, res, next) => {
    try {
        const { body } = req
        const { postId } = req.params

        // if post doesn't have year in id 
        // the post is unable to be retreived
        const year = postId.split('-')[0]
        if (year.length !== 4) {
            res.status(400).json({ error: "Unable to retrieve post without year" })
            return
        }

        const validationErrors = validateRequiredPostFields({
            'text': {
                required: true,
                notEmpty: true
            },
            'title': {
                required: true,
                notEmpty: true
            },
            'userId': {
                required: true,
                notEmpty: true
            },
            'secret': {
                required: true,
                notEmpty: true
            }
        }, body)

        if (validationErrors.error) {
            res.status(400).json(validationErrors)
            return
        }

        const isValid = await authenticateUser(body.userId, body.secret)
        delete body.secret
        // TODO
        // await createNotificationSetting()

        if (isValid) {
            const post = await updatePost(year, body, postId)
            handleError(res, post)
            res.status(201).json(post)
        } else {
            res.status(401).json({ error: 'Unauthorized' })
        }
    } catch (e) {
        next(e)
    }
})

// legacy get post by id
router.get("/posts/:postId/year/:year", async (req, res, next) => {
    try {
        const { postId, year } = req.params

        // get post
        const post = await getPostById(year, postId)

        // get comments
        const comments = await getCommentsByPostId(postId)

        // create array of users needed to fetch
        // start with user from post
        const users = [post.user]
        for (const comment of comments) {
            if (!(users.includes(comment.user))) {
                users.push(comment.user)
            }
        }

        // get data for each user
        const userTable = {}
        for (let user of users) {
            userTable[user] = await getUserInfo(user)
        }

        // append user info on post and each comment
        post.user = userTable[`USER#${post.user}`]
        comments.forEach(comment => {
            comment.user = userTable[comment.user]
        })
        post.comments = comments
        res.status(200).json(post)
    } catch (err) {
        console.log("in catch in get post")
        next(err)
    }
})

// legacy edit post
router.put('/posts/:postId/year/:year', async (req, res, next) => {
    try {
        const { body } = req
        const { postId, year } = req.params

        const validationErrors = validateRequiredPostFields({
            'text': {
                required: true,
                notEmpty: true
            },
            'title': {
                required: true,
                notEmpty: true
            },
            'userId': {
                required: true,
                notEmpty: true
            },
            'secret': {
                required: true,
                notEmpty: true
            }
        }, body)

        if (validationErrors.error) {
            res.status(400).json(validationErrors)
            return
        }

        const isValid = await authenticateUser(body.userId, body.secret)
        delete body.secret
        // TODO
        // await createNotificationSetting()

        if (isValid) {
            const post = await updatePost(year, body, postId)
            handleError(res, post)
            res.status(201).json(post)
        } else {
            res.status(401).json({ error: 'Unauthorized' })
        }
    } catch (e) {
        next(e)
    }
})

module.exports = router
