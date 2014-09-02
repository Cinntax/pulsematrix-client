if(Meteor.isClient){

	Template.clientview.SourceList = function() {
		return Sources.find({});
	};
	Template.clientview.SinkList = function() {
    return Sinks.find({});
  };
	Template.clientsourceview.heightclass = function () {
		return 'height-rows-' + Sources.find({}).count();
	};
  //This method will calculate a list of possible routes for the source given, and will also determine if any of them are active or not.	
	Handlebars.registerHelper('routemap', function(sourceName) {
		routemap = new Array();
		sourceObj = Sources.findOne({name: sourceName})
		console.log(sourceObj);
		possibleRoutes = Sinks.find({}); 
		possibleRoutes.forEach(function(sink) {
			newRoute = new Route();
			newRoute.sourceName = sourceName;
			newRoute.sinkName = sink.name;
			newRoute.sourceDisplayName = sourceObj.displayName;	

			//For each source, see if we find it in our routes list.
			route = Routes.findOne({sinkName: sink.name, sourceName: sourceName})
			if(route)
				newRoute.index = route.index;
		
			routemap.push(newRoute);

  	});
		return routemap;
	});

	Handlebars.registerHelper('routestyle', function(index) {
		if (index > 0)
			return 'active';
		else
			return 'inactive';
	});
	
	Template.clientrouteview.events({
		'click button': function(event) {
				currentIndex = $(this).attr("index");
				console.log($(this).attr("sink"));	
				if(currentIndex < 0)
					Meteor.call('ActivateRoute',$(this).attr("sinkName"),$(this).attr("sourceName"));
				else
					Meteor.call('DeactivateRoute',currentIndex);
		}
	});	
}

if(Meteor.isServer){
	Meteor.methods({
		ActivateRoute: function(sink,source){ActivateRoute(sink,source)},
		DeactivateRoute: function(index){DeactivateRoute(index);}});
}
