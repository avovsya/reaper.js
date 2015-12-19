// Each *rule* contains at least one *object*.
// Each object consists of fields.
// Each field can be either another object or *selector*.
// *Selector* does actual extraction of the content from a page.
// Extracted content would be associated with a object's field name in a resulting object
// Both Object and Selector can be arrays in that case resulting field would be and array of values
// extracted using that selector/object
//
// E.g.
// var rule = {
//   ctx: 'html',
//   fields: {
//     title: {
//       selector: 'title'
//     },
//     list: [{
//       selector: 'ul.test li'
//     }]
//   }
// };
//
// var result = {
//   title: 'Foo',
//   list: ['Bar', 'Baz']
// };

(function () {
  var utils = {
    isArray: Array.isArray,
    forOwn: function(obj, iter) {
      for(var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          iter(obj[prop], prop);
        }
      }
    }
  };
  var reaper = (function() {
    var $;

    function _getFieldType(entity) {
      if (utils.isArray(entity)) {
        entity = entity[0];
      }
      return entity.fields ? 'object' : 'selector';
    }

    function extractObject(object, parentContext) {
      var result = {};

      parentContext = parentContext || $('html');

      if (utils.isArray(object)) {
        var results = [];
        object = object[0];

        $(object.ctx, parentContext).each(function (i, context) {
          results.push(extractObjectFromElement(object, $(context)));
        });

        return results;
      } else {
        return extractObjectFromElement(object, $(parentContext));
      }
    }

    function extractObjectFromElement(object, element) {
      var result = {};
      utils.forOwn(object.fields, function (field, fieldName) {
        var fieldResult;
        if (_getFieldType(field) === 'object') {
          fieldResult = extractObject(field, element);
        } else {
          fieldResult = extractSelector(field, element);
        }
        result[fieldName] = fieldResult;
      });
      return result;
    }

    function extractSelector(selector, context) {
      if (utils.isArray(selector)) {
        var result = [];

        selector = selector[0];
        $(selector.selector, context).each(function (i, element) {
          result.push(extractSelectorFromElement(selector, $(element)));
        });

        return result;
      }

      var element;
      if (selector.selector === '.') {
        element = context;
      } else {
        element = $(selector.selector, context);
      }
      return extractSelectorFromElement(selector, element);
    }

    function extractSelectorFromElement(selector, element) {
      var value;
      if (selector.attribute) {
        value = element.attr(selector.attribute);
      } else if (selector.css) {
        value = element.css(selector.css);
      } else {
        value = element.html();
      }
      return value;
    }

    function extract(rule, document) {
      $ = document;
      return extractObject(rule);
    }

    return {
      extract: extract
    };
  })();

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = reaper;
  } else {
    window.reaper = reaper;
  }
})();
