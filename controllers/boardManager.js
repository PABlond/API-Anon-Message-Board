const Board = require("./../models/board")
const bcrypt = require("bcrypt")

module.exports = class BoardManager {
  constructor() {
    this.salt = bcrypt.genSaltSync(10)
  }

  async getLastBoards({ board }) {
    return await Board.find({ board }).limit(10)
  }

  async getThreadById({ thread_id }) {
    return await Board.findById(thread_id)
  }

  hashPassword(password) {
    return bcrypt.hashSync(password, this.salt)
  }

  comparePassword(password, hash) {
    return bcrypt.compareSync(password, hash)
  }

  async createNewThread(board, { delete_password, text }) {
    const password = this.hashPassword(delete_password)
    const now = new Date()
    await new Board({
      password,
      text,
      board,
      reported: false,
      replies: [],
      replycount: 0,
      created_on: now,
      bumped_on: now
    }).save()
  }

  async reportThread({ report_id }) {
    const doc = await Board.findByIdAndUpdate(report_id, {
      $set: { reported: true }
    })
    return doc ? "Success!" : "Failure"
  }

  async deleteThread({ thread_id, delete_password }) {
    const thread = await Board.findById(thread_id)
    if (!thread) return "Sorry, we couldn't find that thread!"
    else if (this.comparePassword(delete_password, thread.password)) {
      await thread.delete()
      return "Success!"
    } else return "incorrect password"
  }

  async postComment({ delete_password, thread_id, text }) {
    const hash = this.hashPassword(delete_password)
    const data = await Board.findOne({ _id: thread_id })
    console.log("data", data)
    if (data) {
      data.replies.push({
        text,
        thread_id,
        delete_password: hash,
        reported: false
      })
      data.replycount += 1
      console.log(data.replies)
      await data.save()
    }
  }

  async reportReply({ thread_id, reply_id }) {
    const thread = await Board.findOne({ _id: thread_id })
    if (!thread) return "Failure"
    thread.replies = thread.replies.map(reply => {
      if (reply_id === reply._id.toString()) reply.reported = true
      return reply
    })
    await thread.save()
    return "Success!"
  }

  async deleteReply({ thread_id, delete_password, reply_id }) {
    const doc = await Board.findOne({ _id: thread_id })
    if (doc) {
      let a = {}
      doc.replies = doc.replies.map(reply => {
        if (
          reply._id.toString() === reply_id &&
          this.comparePassword(delete_password, reply.delete_password)
        )
          return null
        else return reply
      })
      if (doc.replies.indexOf(null) !== -1) {
        doc.replies = doc.replies.filter(Boolean)
        doc.replycount -= 1
        await doc.save()
        return "Success!"
      } else return "incorrect password"
    } else return "Sorry, but we couldn't find that thread!"
  }
}
