const app = require('chai')
const should = require('chai').should()
const chaihttp = require('chai-http');
const server = require('../server')
const data = require('./test.json')
const logToken = require('./test')
app.use(chaihttp)
app.use(require('chai-json-schema'))
let noteid;
describe('testing google api', () => {
    it('register using google api', () => {
        app.request(server)
            .get('auth/google')
            .end((err, res) => {
                //  console.log(res)//res.should.have.status(200)
            })
    })
})


describe("Testing note api", () => {
    it.only("with right details", (done) => {
        app.request(server)
            .post('/note/createNotes')
            .set("token", logToken.logToken)
            .send(data.notecreate)
            .end((err, res) => {
                noteid = {
                    id: res.body.data._id,
                    userId: data.userId
                }
                res.should.have.status(200)
                done()
            })
    })
    it('note can be empty', (done) => {
        app.request(server)
            .post('/note/createNotes')
            .send(data.userId)
            .end((err, res) => {
                res.should.have.status(200)
                done()
            })
    })
    it("with wrong details", (done) => {
        app.request(server)
            .post('/note/createNotes')
            .send()
            .end((err, res) => {
                res.should.have.status(422)
                done()
            })
    })
})

describe('testing elasticSearch create index', () => {
    it('creating an index', () => {
        app.request(server)
            .post('/elastic/createIndex')
            .send(data.createIndex)
            .end((err, res) => {
                res.should.not.have.status(422)
                // console.log(res.text)
            })
    })

})
describe('testing getNotes api  and store in cache and elastic search', () => {
    it('with right details', (done) => {
        app.request(server)
            .get('/note/getNotes')
            .send(data.userId)
            .end((err, res) => {
                res.should.have.status(200)
                // console.log(res)
                done()
            })
    })
    it('with wrong details ', (done) => {
        app.request(server)
            .get('/note/getNotes')
            .send(data.userIderr)
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
})

describe('testing elasticsearch index', () => {
    it('search index ', (done) => {
        app.request(server)
            .get('/elastic/search')
            .send(data.search)
            .end((err, res) => {
                res.should.have.status(200)
                console.log(res.text)
                done()
            })
    })
})

describe("testing delete note api", () => {
    it('deleting api with right details', (done) => {
        console.log(noteid)
        app.request(server)
            .post('/note/deleteNotes')
            .send(noteid)
            .end((err, res) => {
                res.should.have.status(200)
                done()
            })
    })
    it('deleting api with wrong details', (done) => {
        app.request(server)
            .post('/note/deleteNotes')
            .send({})
            .end((err, res) => {
                res.should.have.status(422)
                done()
            })
    })
})

describe("testing update api ", () => {
    it('testing noteUpdate', (done) => {
        app.request(server)
            .post('/note/updateNotes')
            .send(data.updateNotes)
            .end((err, res) => {
                res.should.have.status(200)

                done()
            })
    })
    it('testing noteTrash', (done) => {
        app.request(server)
            .post('/note/noteTrash')
            .send(data.noteTrash)
            .end((err, res) => {
                res.should.have.status(200)

                done()
            })
    })
    it('testing noteArchive', (done) => {
        app.request(server)
            .post('/note/noteArchive')
            .send(data.noteArchive)
            .end((err, res) => {
                res.should.have.status(200)

                done()
            })
    })
    it('testing noteReminder', (done) => {
        app.request(server)
            .post('/note/noteReminder')
            .send(data.noteReminder)
            .end((err, res) => {
                res.should.have.status(200)
                done()
            })
    })
    it('add noteLabel ', (done) => {
        app.request(server)
            .post('/note/noteLabel')
            .send(data.noteLabel)
            .end((err, res) => {
                res.should.have.status(200)
                done()
            })
    })
})


describe('Testing Labels', () => {
    it('creating label ', (done) => {
        app.request(server)
            .post('/note/createLabel')
            .send(data.createLabel)
            .end((err, res) => {
                res.should.have.status(200)
                done()
            })

    })
    it('updating label', (done) => {
        app.request(server)
            .post('/note/updateLabel')
            .send(data.updateLabel)
            .end((err, res) => {
                res.should.have.status(200)
                done()
            })


    })
    it('get all  labels', (done) => {
        app.request(server)
            .get('/note/getLabels')
            .send(data.getLabel)
            .end((err, res) => {
                res.should.have.status(200)
                done()
            })
    })
    it('delete label', (done) => {
        app.request(server)
            .post('/note/deleteLabel')
            .send(data.deleteLabel)
            .end((err, res) => {
                res.should.have.status(200)
                done()
            })


    })
})

describe("collaborating operations", () => {
    it('add collaborate', (done) => {
        app.request(server)
            .post('/note/addCollaborate')
            .send(data.addCollaborate)
            .end((err, res) => {
                res.should.have.status(200)
                console.log(res.text)
                done()
            })
    })
    it('add collaborate with wrong value', (done) => {
        app.request(server)
            .post('/note/addCollaborate')
            .send(data.addCollaborateerr)
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
    it('remove collaborate with wrong value', (done) => {
        app.request(server)
            .post('/note/removeCollaborate')
            .send(data.removeCollaborateerr)
            .end((err, res) => {
                res.should.have.status(422)
                done()
            })
    })
    it('remove collaborate ', (done) => {
        console.log(data.removeCollaborate)
        app.request(server)
            .post('/note/removeCollaborate')
            .send(data.removeCollaborate)
            .end((err, res) => {
                res.should.have.status(200)
                done()
            })
    })

})




