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
  fileFilter: function(req, file, cb) {
    if (!['image/jpeg', 'image/png', 'image/bmp'].includes(file.mimetype)) {
      cb(new Error('filetype is not accesptable'));
    }
    cb(null, true);
  }
});


/* GET quotes listing. */
router.get('/', function(req, res, next) {
  try {
    res.json(posts.getMultiple(req.query.page));
  } catch(err) {
    console.error(`Error while getting posts `, err.message);
    next(err);
  }
});

/* POST post */
router.post('/', upload.single('image'), function(req, res, next) {
  try {
    req.body.image_url = req.file.path;
    res.json(posts.create(req.body));
  } catch(err) {
    console.error(`Error while adding post `, err.message);
    next(err);
  }
});

/* POST comment */
router.post('/:post_id/comment', function(req, res, next) {
  try {
    res.json(posts.createComment(req.params.post_id, req.body));
  } catch(err) {
    console.error(`Error while adding comment `, err.message);
    next(err);
  }
});

module.exports = router;
