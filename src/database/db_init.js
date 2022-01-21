const sqlite      = require('better-sqlite3');
const path        = require('path');
const {db}        = require('./db');


const DROP_POSTS_DB     = `DROP TABLE IF EXISTS post`

const DROP_COMMENTS_DB  = `DROP TABLE IF EXISTS comment`

const INIT_POSTS_DB     = `CREATE TABLE post (
                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    post_id TEXT UNIQUE NOT NULL,
                                    author TEXT NOT NULL, 
                                    title TEXT UNIQUE NOT NULL, 
                                    content TEXT,
                                    image_url TEXT,
                                    comment_count INTEGER DEFAULT 0 NOT NULL,
                                    nsfw INTEGER DEFAULT 1 NOT NULL,
                                    processed INTEGER DEFAULT 0 NOT NULL,
                                    created_at INTEGER
)`;

const INIT_COMMENTS_DB  = `CREATE TABLE comment (
                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    comment_id TEXT UNIQUE NOT NULL, 
                                    post_id INTEGER NOT NULL, 
                                    author TEXT NOT NULL,
                                    content TEXT NOT NULL,
                                    created_at INTEGER,
                                    FOREIGN KEY(post_id) REFERENCES post(id)
)`;

(async function run() {
      db.prepare(DROP_COMMENTS_DB).run();
      db.prepare(DROP_POSTS_DB).run();
      db.prepare(INIT_POSTS_DB).run();
      db.prepare(INIT_COMMENTS_DB).run();
}());

