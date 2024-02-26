const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const router = express.Router()
const postsRoutes = require('./routes/posts/posts.controller')
const commentsRoutes = require('./routes/comments/comments.controller')
const usersRoutes = require('./routes/users/users.controller')
const notificationsRoutes = require('./routes/notifications/notifications.controller')

const { errorHandler } = require('./services/error')

// const pollsRoutes = require('./routes/polls/polls.controller')
// const commentsRoutes = require('./routes/comments/comments.controller')
// const routes = require('./routes/routes')
// const cors = require('cors')
// router.use(cors())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use((req, res, next) => {
    if (req.body instanceof Buffer) {
        req.body = JSON.parse(req.body.toString())
    }
    next();
})


app.use('/', router)
app.use('/', postsRoutes)
app.use('/', commentsRoutes)
app.use('/', usersRoutes)
app.use('/', notificationsRoutes)
app.use(errorHandler)

// app.use('/', pollsRoutes)

// app.use('/', commentsRoutes)

module.exports = app;