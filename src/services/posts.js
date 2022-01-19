const db = require('./db');
const config = require('../config');


function getMultiple(page = 1) {
  const offset = (page - 1) * config.listPerPage;
  const data = db.query(` SELECT * 
                          FROM post p
                          LEFT JOIN (
                            SELECT
                              id, 
                              post_id,
                              author,
                              content 
                            FROM comment 
                            ORDER BY created_at DESC
                            LIMIT 2
                          ) c 
                           ON p.id = c.post_id WHERE p.nsfw = 0 LIMIT ?,?`, [offset, config.listPerPage]);
  const meta = {page};

  return {
    data,
    meta
  }
}

function _validateCreatePost(post) {
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

  if (!post.image_url) {
    messages.push('Image url is empty');
  }
  
  if (messages.length) {
    let error = new Error(messages.join());
    error.statusCode = 400;

    throw error;
  }
}

function _validateCreateComment(comment) {
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

function create(postObj) {
  _validateCreatePost(postObj);
  const {author, content, title,  image_url} = postObj;
  created_at = Date.now();
  const result = db.run('INSERT INTO post (title, author, content, image_url, created_at) VALUES (@title, @author, @content, @image_url, @created_at)', {title, author, content, image_url, created_at});
  
  let message = 'Error in creating post';
  if (result.changes) {
    message = 'Post created successfully';
  }

  return {message};
}

function createComment(post_id, commentObj) {
  _validateCreateComment(commentObj);
  const {content, author} = commentObj;
  created_at = Date.now();
  const result = db.run('INSERT INTO comment (content, author, post_id, created_at) VALUES (@content, @author, @post_id, @created_at)', {content, author, post_id, created_at});
  
  let message = 'Error in creating comment';
  if (result.changes) {
    message = 'Comment created successfully';
  }

  return {message};
}

module.exports = {
  getMultiple,
  create,
  createComment
}
