if(Meteor.isClient){
	Template.clientview.SinkList = function() {
		return PASinks.find({type: 'module-remap-sink.c'});
	};
	
	Template.clientsinkview.SourceList = function() {
		return PASources.find({type: 'module-null-sink.c'});
	};

	Handlebars.registerHelper('routemap', function(sinkName) {
		routemap = new Array();
		possibleRoutes = PASources.find({type: 'module-null-sink.c'}); 
		possibleRoutes.forEach(function(source) {
			newRouteVM = new RouteViewModel();
			if(source.friendlyName)
				newRouteVM.friendlyName = source.friendlyName;
			else
				newRouteVM.friendlyName = source.name;
	
			newRouteVM.source = source.name;
			newRouteVM.sink = sinkName;	
			//For each source, see if we find it in our routes list.
			route = PARoutes.findOne({sink: sinkName, source: source.name})
			if(route)
			{
				newRouteVM.active = 1;
				newRouteVM.index = route.index;
			}
			routemap.push(newRouteVM);

  	});
		return routemap;
	});

	Handlebars.registerHelper('routestyle', function(index) {
		if(index > 0)
			return 'active';
		else
			return 'inactive';	
	});

	Template.clientrouteview.events({
		'click button': function(event) {
			currentIndex = $(this).attr("index");
			if(currentIndex < 0)
				Meteor.call('ActivateRoute',$(this).attr("sink"),$(this).attr("source"));
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
