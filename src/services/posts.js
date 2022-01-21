const fs              = require('fs');
const request         = require('request');
const { 
  v4: uuidv4 
}                     = require('uuid');

const db              = require('../database/db');

const {
  SERVICE_URL,
  FUNCTION_KEY,
  LIST_PER_PAGE
}                      = require('../config');

const {
  GET_POST, 
  INSERT_COMMENT, 
  INSERT_POST, 
  SELECT_POSTS, 
  UPDATE_POST
}                     = require('../database/queries');

getPosts = (page = 1) => {
  const offset = (page - 1) * Number(LIST_PER_PAGE);
  const data = db.query(SELECT_POSTS, [offset, Number(LIST_PER_PAGE)]);
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
        } else {
          currentPost.comments.push(_parseComment(e));
        }
      }
    }
    posts.push(currentPost);
  }
  return {
    posts, 
    page,
    msg: 'success'
  }
}

createPost = (postObj, image_url) => {
  _validateCreatePost(postObj);
  const {author, content, title} = postObj;
  created_at = Date.now();
  post_id = uuidv4();
  msg = 'failed to create post!';
  try {
    const result = db.run(INSERT_POST, {post_id, title, author, content, image_url, created_at});
    if (result.changes) {
      return {data: {post_id}, msg: 'post created!'};
    }
  } catch (exception) {
    console.log(exception);
      return {msg, data: {detail: exception.message}};
  }
}

createComment = (id, commentObj) => {
  _validateCreateComment(commentObj);
  const {content, author} = commentObj;
  created_at = Date.now();
  comment_id = uuidv4();
  msg = 'failed to add comment!';
  try {
    const post_id = db.query(GET_POST, {postId: id})[0].id;
    const result = db.run(INSERT_COMMENT, {comment_id, content, author, post_id, created_at});
    if (result.changes) {
      return {data: {comment_id}, msg: 'comment added!'};
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
  db.run(UPDATE_POST, {nsfw: _analyse(b).isNSFW, image_url: b.media.uri, postId: id});

});
}

_analyse = (a) => {
  return {'isNSFW': a.nudity.safe < 0.5 || a.weapon > 0.5 || a.alcohol > 0.5 || a.drugs > 0.5 || a.offensive.prob > 0.5 || a.gore.prob > 0.5 == true ? 1 : 0};
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
