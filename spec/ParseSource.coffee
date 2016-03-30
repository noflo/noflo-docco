noflo = require 'noflo'
fs = require 'fs'
path = require 'path'
chai = require 'chai' unless chai
baseDir = path.resolve __dirname, '../'

describe 'ParseSource component', ->
  c = null
  source = null
  filename = null
  out = null
  before (done) ->
    loader = new noflo.ComponentLoader baseDir
    loader.load 'docco/ParseSource', (err, instance) ->
      return done err if err
      c = instance
      done()
  beforeEach ->
    source = noflo.internalSocket.createSocket()
    filename = noflo.internalSocket.createSocket()
    out = noflo.internalSocket.createSocket()
    c.inPorts.source.attach source
    c.inPorts.filename.attach filename
    c.outPorts.out.attach out
  afterEach ->
    c.inPorts.source.detach source
    c.inPorts.filename.detach filename
    c.outPorts.out.detach out

  describe 'when instantiated', ->
    it 'should have an filename port', ->
      chai.expect(c.inPorts.filename).to.be.an 'object'
    it 'should have an source port', ->
      chai.expect(c.inPorts.source).to.be.an 'object'
    it 'should have an output port', ->
      chai.expect(c.outPorts.out).to.be.an 'object'

  describe 'parsing itself', ->
    name = null
    src = null
    before (done) ->
      name = path.resolve __dirname, '../components/ParseSource.coffee'
      fs.readFile name, 'utf-8', (err, content) ->
        return done err if err
        src = content
        done()
    chunks = []
    it 'should produce chunks', (done) ->
      out.on 'data', (ip) ->
        if ip.type is 'data'
          chunks.push ip.data
        if ip.type is 'closeBracket'
          chai.expect(chunks).not.to.be.empty
          done()
      filename.post name
      source.post src
    it 'should contain several chunks of code and documentation', ->
      chai.expect(chunks).to.have.length.above 3
