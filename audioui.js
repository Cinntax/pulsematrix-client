//Once we move these collections into pulseaudio,
//it will have to have one route per sink/source.

Sinks = new Meteor.Collection("sinks");
Routes = new Meteor.Collection("routes");

if (Meteor.isClient) {
	Handlebars.registerHelper('routes', function(sinkName) {
		return Routes.find({sinkname: sinkName});
	});

//  Template.hello.greeting = function () {
//    return "Welcome to test.";
//  };

//  Template.hello.events({
//    'click input': function () {
      // template data, if any, is available in 'this'
//      if (typeof console !== 'undefined')
//        console.log("You pressed the button");
//    }
//  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
//		var test1 = new Sink();
//		test1.name = "sink number 2";
//		Sinks.insert(test1);
//var test2 = new Route();
//	test2.sinkname = "sink number 1";
//	Routes.insert(test2);
  });
}
