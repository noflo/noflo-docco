const noflo = require('noflo');
const docco = require('docco');

exports.getComponent = () => {
  // Initialize the component and ports
  const c = new noflo.Component();
  c.description = 'Parse a source file into documentation chunks';
  c.icon = 'code';
  c.inPorts.add('filename', {
    description: 'Original file name, used for determining syntax',
    datatype: 'string',
  });
  c.inPorts.add('source', {
    description: 'Source code',
    datatype: 'string',
  });
  c.outPorts.add('out', {
    description: 'Produced documentation chunks',
    datatype: 'object',
  });

  return c.process((input, output) => {
    // We need a filename for correct source code detection based on language
    if (!input.has('filename', 'source')) { return; }
    const [fileName, source] = Array.from(input.getData('filename', 'source'));

    // Parse the source code using Docco and forward the chunks
    const chunks = docco.parse(fileName, source);

    output.send({ out: new noflo.IP('openBracket', fileName) });

    chunks.forEach((chunk) => {
      output.send({ out: chunk });
    });

    output.send({ out: new noflo.IP('closeBracket', fileName) });

    output.done();
  });
};
