const app = require('chai')
const should = require('chai').should()
const chaihttp = require('chai-http');
const server = require('../server')
const data = require('./test.json')
let token;
app.use(chaihttp)
app.use(require('chai-json-schema'))
/**
 * @desc Testing Login api ,with right details,empty details,Wrong details
 */
describe('API testing Login', () => {
    it.only('with right details', (done) => {
        app.request(server)
            .post('/login')
            .send(data.login)
            .end((err, res) => {
                res.should.have.status(200)
                exports.logToken = res.body.data.token
                done()
            })
    })
    it('with wrong details', (done) => {
        app.request(server)
            .post('/login')
            .send(data.loginerr)
            .end((err, res) => {
                res.should.have.status(422)
                done()
            })
    })
    it('with  null details', (done) => {
        app.request(server)
            .post('/login')
            .send({})
            .end((err, res) => {
                res.should.have.status(422)
                done()
            })
    })
})
/**
 * @desc Testing register api ,with right details,empty details,Wrong details
 */
describe('API testing register', () => {
    it('with user data exist details', (done) => {
        app.request(server)
            .post('/register')
            .send(data.register)
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
    it('with right  details', (done) => {
        app.request(server)
            .post('/register')
            .send(data.registerRight)
            .end((err, res) => {
                res.should.have.status(200)
                done()
            })
    })
    it('with wrong details', (done) => {
        app.request(server)
            .post('/register')
            .send(data.registererr)
            .end((err, res) => {

                res.should.have.status(422)
                done()
            })
    })
})

/**
 * @desc Testing forgotPassword api ,with right details,empty details,Wrong details
 */
describe('API testing forgotpassword', () => {
    it('with Email exist in database details', (done) => {
        app.request(server)
            .post('/forgotPassword')
            .send(data.forgotPassword)
            .end((err, res) => {
                token = res.body.data.token
                res.should.have.status(200)
                done()
            })
    })
    it('with wrong details', (done) => {
        app.request(server)
            .post('/forgotPassword')
            .send(data.forgotPassworderr)
            .end((err, res) => {

                res.should.have.status(404)
                done()
            })
    })
})

/**
 * @desc Testing resetPassword api ,with right details,empty details,Wrong details
 */
describe('API testing resetPassword', () => {
    it('with token generated', (done) => {

        app.request(server)
            .post(`/resetPassword/${token}`)
            .send(data.resetPassword)
            .end((err, res) => {
                res.should.have.status(200)
                done()
            })
    })

    it('with wrong details', (done) => {
        app.request(server)
            .post(`/resetPassword/`)
            .send(data.resetPassworderr)
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
})

