const express = require('express');
const multer = require('multer');

const router = express.Router();
const posts = require('../services/posts');

const FILE_SIZE_LIMIT = 10 ** 8;


// SET STORAGE
const storage = multer.diskStorage({
  destination: 'uploads',
  filename: function (req, file, cb) {
    
    cb(null, req.body.title + '-' + Date.now() + '.' + file.originalname.split('.').pop());
  }
})

const upload = multer({ 
  storage: storage,
  limits: {fileSize: FILE_SIZE_LIMIT},
  fileFilter: function(_, file, cb) {
    if (!['image/jpeg', 'image/png', 'image/bmp'].includes(file.mimetype)) {
      cb(new Error('filetype is not accesptable'));
    }
    cb(null, true);
  }
});


/* GET posts listing. */
router.get('/', function(req, res) {
  try {
    res.json(posts.getPosts(req.query.page));
  } catch(err) {
    console.error(`Error while getting posts `, err.message);
    res.json({msg: 'failed', data: {detail: err.message}});
  }
});

/* POST post */
router.post('/', upload.single('image'), 
(req, res, next) => {
  try {
    const result = posts.createPost(req.body, req.file.path);
    res.json(result);
    if (result.data && result.data.post_id) {
      req.post_id = result.data.post_id;
    }      
    next();
  } catch (err) {
    console.error(`Error while creating a post `, err.message);
    res.json({msg: 'failed', data: {detail: err.message}});
  }
}, (req) => {
  if (req.post_id) {
    console.log(`processing image for post ${req.post_id}`);
    posts.processPost(req.post_id);
  }
});

/* POST comment */
router.post('/:post_id/comment', (req, res) => {
  try {
    res.json(posts.createComment(req.params.post_id, req.body));
  } catch(err) {
    console.error(`Error while adding comment `, err.message);
    res.json({msg: 'failed', data: {detail: err.message}});
  }
});

module.exports = router;
