const fs              = require('fs');
const request         = require('request');
const { 
  v4: uuidv4 
}                     = require('uuid');

const db              = require('../database/db');

const {
  SERVICE_URL,
  FUNCTION_KEY,
  NUDITY,
  WEAPON,
  ALCOHOL,
  DRUGS,
  OFFENSIVE,
  GORE
}                      = require('../config');

const {
  GET_POST, 
  INSERT_COMMENT, 
  INSERT_POST, 
  SELECT_POSTS, 
  UPDATE_POST,
  INCREMENT_COMMENT_COUNT
}                     = require('../database/queries');

getPosts = () => {
  const data = db.query(SELECT_POSTS, {});
  posts = [];
  if (data.length) {
    let currentPost = null;
    for (let i = 0; i < data.length; i++) {
      const e = data[i];
      if (!currentPost) {
        currentPost = _parsePost(e);
      } else {
        if (currentPost.id != e.post_id) {
          posts.push(currentPost);
          currentPost = _parsePost(e);
        } else if (currentPost.comments.length < 2) {
          currentPost.comments.push(_parseComment(e));
        }
      }
    }
    posts.push(currentPost);
  }
  return {
    data: {
            posts
            },
    msg: 'success'
  }
}

createPost = (postObj, imageUrl) => {
  _validateCreatePost(postObj);
  const {author, content, title} = postObj;
  createdAt = Date.now();
  postId = uuidv4();
  msg = 'failed to create post!';
  try {
    const result = db.run(INSERT_POST, {postId, title, author, content, imageUrl, createdAt});
    if (result.changes) {
      return {data: {postId}, msg: 'post created!'};
    }
  } catch (exception) {
    console.log(exception);
      return {msg, data: {detail: exception.message}};
  }
}

createComment = (id, commentObj) => {
  _validateCreateComment(commentObj);
  const {content, author} = commentObj;
  createdAt = Date.now();
  commentId = uuidv4();
  msg = 'failed to add comment!';
  try {
    const post   = db.query(GET_POST, {postId: id})[0];
    const postId = post.id;
    let result = db.run(INSERT_COMMENT, {commentId, content, author, postId, createdAt});
    const count = post.comment_count + 1;
    result = db.run(INCREMENT_COMMENT_COUNT, {count, postId});
    if (result.changes) {
      return {data: {commentId}, msg: 'comment added!'};
    }
  } catch (exception) {
    console.log(exception);
      return {msg, data: {detail: exception.message}};
  }
}

processPost = (id) => {
  const result = db.query(GET_POST, {postId: id})[0];
  const options = {
    url: SERVICE_URL,
    headers: {
      'x-functions-key': FUNCTION_KEY
    },
    formData: {
      'image': fs.createReadStream(result.image_url)
    }
  };

request.post(options, (err, res, body) => {
  if (err) {
    console.error('processing failed:', err);
  }
  console.log('server responded with:', body);
  const b = JSON.parse(body);
  db.run(UPDATE_POST, {nsfw: _analyse(b).isNSFW, imageUrl: b.media.uri, postId: id});

});
}

_analyse = (a) => {
  return {'isNSFW': a.nudity.safe < NUDITY || a.weapon > WEAPON || a.alcohol > ALCOHOL || a.drugs > DRUGS || a.offensive.prob > OFFENSIVE || a.gore.prob > GORE == true ? 1 : 0};
}

_validateCreatePost = (post)  => {
  let messages = [];

  console.log(post);

  if (!post) {
    messages.push('No object is provided');
  }

  if (!post.title) {
    messages.push('Title is empty');
  }

  if (!post.content) {
    messages.push('content is empty');
  }

  if (!post.author) {
    messages.push('Author is empty');
  }

  if (messages.length) {
    let error = new Error(messages.join());
    error.statusCode = 400;

    throw error;
  }
}

_validateCreateComment = (comment) => {
  let messages = [];

  console.log(comment);

  if (!comment) {
    messages.push('Where is the body?');
  }

  if (!comment.content) {
    messages.push('Content is empty');
  }

  if (!comment.author) {
    messages.push('Author is empty');
  }
  
  if (messages.length) {
    let error = new Error(messages.join());
    error.statusCode = 400;

    throw error;
  }
}

_parsePost = (e) => {
  return {
    id: e.post_id, 
    title: e.post_title, 
    author: e.post_author, 
    url: e.url, 
    content: e.post_content,
    created: e.post_created_at,
    comments: [
      _parseComment(e)
    ]
  };
}

_parseComment = (e) => {
  if (e.comment_id)  {
    return {
      id: e.comment_id,
      author: e.comment_author,
      content: e.comment_content,
      created: e.comment_created_at
    };
  }
  return {};
}

module.exports = {
  getPosts,
  createPost,
  createComment,
  processPost
}
