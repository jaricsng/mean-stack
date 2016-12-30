[{
    "_id": "586655b8bc51d19a8e8676fc",
    "title": "test",
    "link": "http://test.com",
    "__v": 0,
    "comments": [],
    "upvotes": 3
}, {
    "_id": "586656d9bc51d19a8e8676fd",
    "title": "test",
    "link": "http://test.com",
    "__v": 0,
    "comments": [],
    "upvotes": 0
}, {
    "_id": "58665d13ba14a09d05a6a92a",
    "title": "asdf",
    "__v": 0,
    "comments": [],
    "upvotes": 1
}, {
    "_id": "5866670e87524fa2f7f75381",
    "title": "new post",
    "__v": 2,
    "comments": ["5866671b87524fa2f7f75382", "586670e75b1d65a4ae54f8b2"],
    "upvotes": 0
}]

// get specific post
curl GET http: //localhost:3000/posts/5866670e87524fa2f7f75381

    // get comments of a post
    curl GET http: //localhost:3000/posts/5866670e87524fa2f7f75381/comments/

    // get a comment
    curl GET http: //localhost:3000/comments/5866671b87524fa2f7f75382


    curl X PUT http: //localhost:3000/posts/5866670e87524fa2f7f75381/comments/5866671b87524fa2f7f75382/upvote
