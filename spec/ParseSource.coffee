noflo = require 'noflo'
fs = require 'fs'
path = require 'path'
chai = require 'chai' unless chai
ParseSource = require '../components/ParseSource.coffee'

describe 'ParseSource component', ->
  c = null
  source = null
  filename = null
  out = null
  beforeEach ->
    c = ParseSource.getComponent()
    source = noflo.internalSocket.createSocket()
    filename = noflo.internalSocket.createSocket()
    out = noflo.internalSocket.createSocket()
    c.inPorts.source.attach source
    c.inPorts.filename.attach filename
    c.outPorts.out.attach out

  describe 'when instantiated', ->
    it 'should have an filename port', ->
      chai.expect(c.inPorts.filename).to.be.an 'object'
    it 'should have an source port', ->
      chai.expect(c.inPorts.source).to.be.an 'object'
    it 'should have an output port', ->
      chai.expect(c.outPorts.out).to.be.an 'object'

  describe 'parsing itself', ->
    name = path.resolve __dirname, '../components/ParseSource.coffee'
    src = fs.readFileSync name, 'utf-8'
    chunks = []
    it 'should produce chunks', (done) ->
      out.on 'data', (data) ->
        chunks.push data
      out.once 'disconnect', ->
        chai.expect(chunks).not.to.be.empty
        done()
      filename.send name
      source.send src
    it 'should contain several chunks of code and documentation', ->
      chai.expect(chunks).to.have.length.above 3
