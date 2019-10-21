const chaiHttp = require("chai-http")
const chai = require("chai")
const server = require("../server")
const { expect, assert } = chai
const mongoose = require("mongoose")
const { MONGO_PASSWORD, MONGO_USER } = process.env
mongoose.connect(
  `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@ds137008.mlab.com:37008/stock-checker`,
  { useNewUrlParser: true }
)
const Board = require("./../models/board")
chai.use(chaiHttp)

suite("Functional Tests", function() {
  const board = "test"
  const delete_password = "aze"
  before(function(done) {
    Board.remove({ board }).then(() => done())
  })
  suite("API ROUTING FOR /api/threads/:board", function() {
    suite("POST", function() {
      test("Test POST /api/threads/:board with board params", function(done) {
        chai
          .request(server)
          .post(`/api/threads/${board}`)
          .query({ board })
          .send({ delete_password: "aze", text: "a sample text" })
          .end(function(err, res) {
            expect(res).to.redirect
            assert.isTrue(
              res.redirects[0].split("//")[1].indexOf("/b/test/") >= 0
            )
            done()
          })
      })
    })

    suite("GET", function() {
      test("Test GET /api/threads/:board with board params", function(done) {
        chai
          .request(server)
          .get(`/api/threads/${board}`)
          .query({ board })
          .end(function(err, res) {
            assert.equal(res.body.length, 1)
            assert.equal(res.body[0].text, "a sample text")
            assert.property(res.body[0], "password")
            assert.isFalse(res.body[0].reported)
            done()
          })
      })
    })

    suite("PUT", function() {
      test("Test PUT /api/threads/:board with board params", function(done) {
        chai
          .request(server)
          .get(`/api/threads/${board}`)
          .query({ board })
          .end(function(err, res) {
            const { _id: report_id } = res.body[0]
            console.log(report_id)
            chai
              .request(server)
              .put(`/api/threads/${board}`)
              .send({ report_id })
              .end(function(err, res) {
                assert.equal(res.body, "Success!")
                done()
              })
          })
      })
    })

    suite("DELETE", function() {
      test("Test DELETE /api/threads/:board with board params", function(done) {
        chai
          .request(server)
          .get(`/api/threads/${board}`)
          .query({ board })
          .end(function(err, res) {
            const { _id: thread_id } = res.body[0]
            chai
              .request(server)
              .delete(`/api/threads/${board}`)
              .send({ thread_id, delete_password })
              .end(function(err, res) {
                assert.equal(res.body, "Success!")
                done()
              })
          })
      })
    })
  })

  suite("API ROUTING FOR /api/replies/:board", function() {
    suite("POST", function() {})

    suite("GET", function() {})

    suite("PUT", function() {})

    suite("DELETE", function() {})
  })
})
