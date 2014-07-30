if(Meteor.isClient){
	Template.clientview.SinkList = function() {
		return Sinks.find({});
	};

  //This method will calculate a list of possible routes for the sink given, and will also determine if any of them are active or not.	
	Handlebars.registerHelper('routemap', function(sinkName) {
		routemap = new Array();
		possibleRoutes = Sources.find({}); 
		possibleRoutes.forEach(function(source) {
			newRoute = new Route();
			//newRouteVM.friendlyName = source.name;
			newRoute.sourceName = source.sourceName
			newRoute.sinkName = sinkName;	
			//For each source, see if we find it in our routes list.
			route = Routes.findOne({sinkName: sinkName, sourceName: source.sourceName})
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
