var expect = require('chai').expect;
var cheerio = require('cheerio');
var readFileSync = require('fs').readFileSync;
var path = require('path');

var reaper = require('../lib/reaper');

function loadFixture(name) {
  var content = readFileSync(path.resolve(__dirname + '/fixtures/' + name + '.html'), { encoding: 'utf8' });
  return cheerio.load(content);
}

describe('reaper.js', function() {
  it('should export extract function', function() {
    expect(reaper.extract).to.exist;
  });

  it('should extract simple value', function() {
    var rule = {
      fields: {
        title: {
          selector: '#title'
        }
      }
    };

    var expectedResult = {
      title: 'Test1 Title'
    };

    var document = loadFixture('test1');

    var result = reaper.extract(rule, document);
    expect(result).to.deep.equal(expectedResult);
  });

  it('should extract simple values from different contexts', function() {
    var rule = {
      fields: {
        inContext1: {
          ctx: '#context1',
          fields: {
            testField: {
              selector: '.testField'
            }
          }
        },
        inContext2: {
          ctx: '#context2',
          fields: {
            testField: {
              selector: '.testField'
            }
          }
        }
      }
    };

    var expectedResult = {
      inContext1: {
        testField: 'test value 1'
      },
      inContext2: {
        testField: 'test value 2'
      }
    };

    var document = loadFixture('test1');

    var result = reaper.extract(rule, document);
    expect(result).to.deep.equal(expectedResult);
  });

  it('should extract multiple simple values', function() {
    var rule = {
      fields: {
        testFields: [{
          selector: '.testField'
        }]
      }
    };

    var expectedResult = {
      testFields: ['test value 1', 'test value 2']
    };

    var document = loadFixture('test1');

    var result = reaper.extract(rule, document);
    expect(result).to.deep.equal(expectedResult);
  });

  it('should extract multiple root objects', function() {
    var rule = [{
      ctx: '.object',
      fields: {
        testField: {
          selector: '.testField'
        },
        testField2: {
          selector: '.testField2'
        }
      }
    }];

    var expectedResult = [{
      testField: 'test value 1',
      testField2: 'foo'
    }, {
      testField: 'test value 2',
      testField2: 'bar'
    }];

    var document = loadFixture('test1');

    var result = reaper.extract(rule, document);
    expect(result).to.deep.equal(expectedResult);
  });

  xit('should extract multiple nested objects', function() {
  });

  xit('should extract multiple levels of nested objects', function() {
  });

  xit('should extract value from parent object if field selector set to "."', function() {
  });

  xit('should extract value from parent object if field selector left empty', function() {
  });
});
