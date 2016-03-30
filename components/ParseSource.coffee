noflo = require 'noflo'
docco = require 'docco'

exports.getComponent = ->

  # Initialize the component and ports
  c = new noflo.Component
  c.inPorts.add 'filename',
    datatype: 'string'
  c.inPorts.add 'source',
    datatype: 'string'
  c.outPorts.add 'out',
    datatype: 'object'

  c.process (input, output) ->
    # We need a filename for correct source code detection based on language
    return unless input.has 'filename', 'source'
    [fileName, source] = input.getData 'filename', 'source'

    # Parse the source code using Docco and forward the chunks
    chunks = docco.parse fileName, source

    output.send
      out: new noflo.IP 'openBracket', fileName

    for chunk in chunks
      output.send
        out: chunk

    output.send
      out: new noflo.IP 'closeBracket', fileName

    output.done()
