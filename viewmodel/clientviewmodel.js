if(Meteor.isClient){
	Template.clientview.SinkList = function() {
		return Sinks.find({enabled: true});
	};
	
	Template.clientsinkview.SourceList = function() {
		return Sources.find({enabled: true});
	};
	
	Template.clientview.visible = function() {
		viewmode = Session.get('viewmode');
		if(!viewmode)
		{
			Session.set('viewmode');
			return true;
		}
		else
			return viewmode == 'client';
	}

	Handlebars.registerHelper('routemap', function(sinkName, sinkPAIndex) {
		routemap = new Array();
		possibleRoutes = Sources.find({enabled: true}); 
		possibleRoutes.forEach(function(source) {
			newRouteVM = new RouteViewModel();
			newRouteVM.friendlyName = source.name;
			newRouteVM.notavailable = (source.paIndex == -1) || (sinkPAIndex == -1);	
			console.log(sinkPAIndex);	
			newRouteVM.source = source.paName;
			newRouteVM.sink = sinkName;	
			//For each source, see if we find it in our routes list.
			route = Routes.findOne({sink: sinkName, source: source.paName})
			if(route)
			{
				newRouteVM.active = 1;
				newRouteVM.index = route.index;
			}
			routemap.push(newRouteVM);

  	});
		return routemap;
	});

	Handlebars.registerHelper('routestyle', function(index, notavailable) {
		if(notavailable)
			return 'notavailable';
		else if (index > 0)
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
