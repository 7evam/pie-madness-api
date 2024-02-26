# Database Schema

## Posts
    -**PK**: POST#CONTEST#{contestId}
    -**SK**: POST#{postId}
    -**pollTitle**: string
    -**pollOptions**: list
    -**pollVotes**: list

    *every postId starts with the year IE 2023-{postId}

## Comments
    -**PK**: COMMENT#POST#{postId}
    -**SK**: COMMENT#{commentId}

## Users
    -**PK**: USER#{userId}

## Notifications
    -**PK**: NOTIFICATION#USER#{userId}
    -**SK**: NOTIFICATION#{notificationId}
    -**postId**: POST#{postId}
    -**postTitle**: title


notifications: get by userId




to delete poll:
patch request on post
{
    pollTitle: null
    pollOptions: null
    pollVotes: null
}

to add vote:
patch request on post
{
    pollVotes
}

to add poll:
patch request on post
