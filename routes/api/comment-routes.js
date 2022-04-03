const router = require('express').Router();
const { 
  addComment, 
  removeComment, 
  addReply, 
  removeReply 
} = require('../../controllers/comment-controller');


// post a new comment to a pizza by id /api/comments/<pizzaId>
router.route('/:pizzaId').post(addComment);


// update a comment by id on a pizza by id by adding a reply /api/comments/<pizzaId>/<commentsId>
router
  .route('/:pizzaId/:commentId')
  .put(addReply)
  .delete(removeComment)

// delete a reply by updating a comment by id on a specific pizza by id /api/comments/<pizzaId>/<commentsId>
router.route('/:pizzaId/:commentId/:replyId').delete(removeReply);

module.exports = router;