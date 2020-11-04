const noflo = require('noflo');
const fs = require('fs');
const path = require('path');
const chai = require('chai');
const baseDir = path.resolve(__dirname, '../');

describe('ParseSource component', function() {
  let c = null;
  let source = null;
  let filename = null;
  let out = null;
  before(function(done) {
    const loader = new noflo.ComponentLoader(baseDir);
    return loader.load('docco/ParseSource', function(err, instance) {
      if (err) { return done(err); }
      c = instance;
      return done();
    });
  });
  beforeEach(function() {
    source = noflo.internalSocket.createSocket();
    filename = noflo.internalSocket.createSocket();
    out = noflo.internalSocket.createSocket();
    c.inPorts.source.attach(source);
    c.inPorts.filename.attach(filename);
    return c.outPorts.out.attach(out);
  });
  afterEach(function() {
    c.inPorts.source.detach(source);
    c.inPorts.filename.detach(filename);
    return c.outPorts.out.detach(out);
  });

  describe('when instantiated', function() {
    it('should have an filename port', () => chai.expect(c.inPorts.filename).to.be.an('object'));
    it('should have an source port', () => chai.expect(c.inPorts.source).to.be.an('object'));
    return it('should have an output port', () => chai.expect(c.outPorts.out).to.be.an('object'));
  });

  return describe('parsing itself', function() {
    let name = null;
    let src = null;
    before(function(done) {
      name = path.resolve(__dirname, '../components/ParseSource.js');
      return fs.readFile(name, 'utf-8', function(err, content) {
        if (err) { return done(err); }
        src = content;
        return done();
      });
    });
    const chunks = [];
    it('should produce chunks', function(done) {
      out.on('ip', function(ip) {
        if (ip.type === 'data') {
          chunks.push(ip.data);
        }
        if (ip.type === 'closeBracket') {
          chai.expect(chunks).not.to.be.empty;
          return done();
        }
      });
      filename.send(name);
      return source.send(src);
    });
    return it('should contain several chunks of code and documentation', () => chai.expect(chunks).to.have.length.above(3));
  });
});
