const mongoose = require("mongoose")

module.exports = mongoose.model(
  "board",
  new mongoose.Schema({
    text: String,
    board: String,
    created_on: String,
    bumped_on: String,
    reported: Boolean,
    password: String,
    replies: [
      {
        reply_id: String,
        text: String,
        delete_password: String,
        reported: Boolean
      }
    ],
    replycount: Number
  })
)
