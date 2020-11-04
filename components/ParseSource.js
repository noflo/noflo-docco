/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require('noflo');
const docco = require('docco');

exports.getComponent = function() {

  // Initialize the component and ports
  const c = new noflo.Component;
  c.description = 'Parse a source file into documentation chunks';
  c.icon = 'code';
  c.inPorts.add('filename', {
    description: 'Original file name, used for determining syntax',
    datatype: 'string'
  }
  );
  c.inPorts.add('source', {
    description: 'Source code',
    datatype: 'string'
  }
  );
  c.outPorts.add('out', {
    description: 'Produced documentation chunks',
    datatype: 'object'
  }
  );

  return c.process(function(input, output) {
    // We need a filename for correct source code detection based on language
    if (!input.has('filename', 'source')) { return; }
    const [fileName, source] = Array.from(input.getData('filename', 'source'));

    // Parse the source code using Docco and forward the chunks
    const chunks = docco.parse(fileName, source);

    output.send({
      out: new noflo.IP('openBracket', fileName)});

    for (let chunk of Array.from(chunks)) {
      output.send({
        out: chunk});
    }

    output.send({
      out: new noflo.IP('closeBracket', fileName)});

    return output.done();
  });
};
