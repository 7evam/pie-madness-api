# Database Schema

## Posts
    -**PK**: POST#CONTEST#{contestId}
    -**SK**: POST#{postId}

    *every postId starts with the year IE 2023-{postId}

## Comments
    -**PK**: POST#{postId}
    -**SK**: COMMENT#{commentId}

## Users
    -**PK**: USER#{userId}

