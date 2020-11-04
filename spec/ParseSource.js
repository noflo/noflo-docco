const noflo = require('noflo');
const fs = require('fs');
const path = require('path');
const chai = require('chai');

const baseDir = path.resolve(__dirname, '../');

describe('ParseSource component', () => {
  let c = null;
  let source = null;
  let filename = null;
  let out = null;
  before((done) => {
    const loader = new noflo.ComponentLoader(baseDir);
    loader.load('docco/ParseSource', (err, instance) => {
      if (err) {
        done(err);
        return;
      }
      c = instance;
      done();
    });
  });
  beforeEach(() => {
    source = noflo.internalSocket.createSocket();
    filename = noflo.internalSocket.createSocket();
    out = noflo.internalSocket.createSocket();
    c.inPorts.source.attach(source);
    c.inPorts.filename.attach(filename);
    c.outPorts.out.attach(out);
  });
  afterEach(() => {
    c.inPorts.source.detach(source);
    c.inPorts.filename.detach(filename);
    c.outPorts.out.detach(out);
  });

  describe('when instantiated', () => {
    it('should have an filename port', () => chai.expect(c.inPorts.filename).to.be.an('object'));
    it('should have an source port', () => chai.expect(c.inPorts.source).to.be.an('object'));
    it('should have an output port', () => chai.expect(c.outPorts.out).to.be.an('object'));
  });

  describe('parsing itself', () => {
    let name = null;
    let src = null;
    before((done) => {
      name = path.resolve(__dirname, '../components/ParseSource.js');
      fs.readFile(name, 'utf-8', (err, content) => {
        if (err) {
          done(err);
          return;
        }
        src = content;
        done();
      });
    });
    const chunks = [];
    it('should produce chunks', (done) => {
      out.on('ip', (ip) => {
        if (ip.type === 'data') {
          chunks.push(ip.data);
        }
        if (ip.type === 'closeBracket') {
          chai.expect(chunks).to.not.eql([]);
          done();
        }
      });
      filename.send(name);
      source.send(src);
    });
    it('should contain several chunks of code and documentation', () => {
      chai.expect(chunks).to.have.length.above(3);
    });
  });
});
