const BoardManager = require("./../controllers/boardManager")

const boardManager = new BoardManager()

module.exports = function(app) {
  app
    .route("/api/threads/:board")

    .get(async (req, res) => {
      // an GET an array of the most recent 10 bumped threads on the board
      // with only the most recent 3 replies from /api/threads/{board}.
      // The reported and delete_passwords fields will not be sent.
      const { board } = req.params
      return res.status(201).json(await boardManager.getLastBoards({ board }))
    })

    .post(async (req, res) => {
      // I can POST a thread to a specific message board by passing
      // form data text and delete_password to /api/threads/{board}.
      // (Recomend res.redirect to board page /b/{board})
      // Saved will be _id, text, created_on(date&time), bumped_on(date&time, starts same as created_on),
      // reported(boolean), delete_password, & replies(array).
      const { board } = req.params
      await boardManager.createNewThread(board, req.body)
      return res.redirect(`/b/${board}/`)
    })

    .put(async (req, res) => {
      // I can report a thread and change it's reported value to true by
      // sending a PUT request to /api/threads/{board} and pass along
      // the thread_id. (Text response will be 'Success!')
      res.status(201).json(await boardManager.reportThread(req.body))
    })

    .delete(async (req, res) => {
      // I can delete a thread completely if I send a DELETE request to /api/threads/{board}
      // and pass along the thread_id & delete_password.
      // (Text response will be 'incorrect password' or 'Success!')
      return res.status(201).json(await boardManager.deleteThread(req.body))
    })

  app
    .route("/api/replies/:board")

    .get(async (req, res) => {
      // can GET an entire thread with all it's replies from /api/replies/{board}?thread_id={thread_id}.
      // Also hiding the same fields.
      const { thread_id } = req.query
      return res
        .status(201)
        .json(await boardManager.getThreadById({ thread_id }))
    })

    .post(async (req, res) => {
      // I can POST a reply to a thead on a specific board by passing form data text,
      // delete_password, & thread_id to /api/replies/{board} and it will
      // also update the bumped_on date to the comments date.
      // (Recomend res.redirect to thread page /b/{board}/{thread_id})
      // In the thread's 'replies' array will be saved _id, text, created_on, delete_password, & reported.
      const { board } = req.params
      await boardManager.postComment(req.body)
      return res.redirect(`/b/${board}/${req.body.thread_id}`)
    })

    .put(async (req, res) => {
      // I can report a reply and change it's reported value to true by sending
      // a PUT request to /api/replies/{board} and pass along the thread_id &
      // reply_id. (Text response will be 'Success!')
      res.status(201).json(await boardManager.reportReply(req.body))
    })

    .delete(async (req, res) => {
      // I can delete a post(just changing the text to '[deleted]')
      // if I send a DELETE request to /api/replies/{board} and pass along
      // the thread_id, reply_id, & delete_password.
      // (Text response will be 'incorrect password' or 'Success!')
      return res.status(201).json(await boardManager.deleteReply(req.body))
    })
}
