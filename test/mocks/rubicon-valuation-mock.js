window.oz_insight = sinon.stub(function (){
  var oz_globals = {};
  for (var property in window) {
      if (window.hasOwnProperty(property) && /^oz_/.test(property)) {
          oz_globals[property] = window.property();
      }
  }
  var results = {
    estimates: {
      tier: 123
    }
  };
  oz_globals.oz_callback(results);
  return oz_globals;
});
