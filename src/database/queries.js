const INSERT_POST     = `INSERT INTO post (post_id, title, author, content, image_url, created_at) VALUES (@postId, @title, @author, @content, @imageUrl, @createdAt)`

const INSERT_COMMENT  = `INSERT INTO comment (comment_id, content, author, post_id, created_at) VALUES (@commentId, @content, @author, @post_Id, @createdAt)`

const SELECT_POSTS    = `SELECT  
                              p.id, 
                              p.post_id as post_id, 
                              p.title as post_title, 
                              p.author as post_author, 
                              p.image_url as url, 
                              p.created_at as post_created_at,
                              c.comment_id as comment_id,
                              c.author as comment_author,
                              c.content as comment_content,
                              c.created_at as comment_created_at
                          FROM post p 
                          LEFT JOIN ( 
                              SELECT 
                                comment_id, 
                                post_id, 
                                author, 
                                content,
                                created_at  
                              FROM comment  
                              ORDER BY created_at DESC 
                              LIMIT 2 ) c  
                          ON p.id = c.post_id 
                          WHERE p.nsfw = 0 AND p.processed = 1 
                          LIMIT ?,?`;

const GET_POST        = `SELECT id, image_url FROM post WHERE post_id = @postId`;

const UPDATE_POST     = `UPDATE post SET nsfw = @nsfw, processed = 1, image_url = @imageUrl WHERE post_id = @postId;`;

module.exports = {
    GET_POST,
    UPDATE_POST,
    INSERT_COMMENT,
    INSERT_POST,
    SELECT_POSTS,
    UPDATE_POST
}