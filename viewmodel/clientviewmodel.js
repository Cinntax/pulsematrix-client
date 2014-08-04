if(Meteor.isClient){

	var longpress = false, startTime, endTime;

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
		possibleRoutes = Sinks.find({}); 
		possibleRoutes.forEach(function(sink) {
			newRoute = new Route();
			newRoute.sourceName = sourceName
			newRoute.sinkName = sink.sinkName;	
			//For each source, see if we find it in our routes list.
			route = Routes.findOne({sinkName: sink.sinkName, sourceName: sourceName})
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
	
Handlebars.registerHelper('routeedit', function(index) {
	route = Routes.findOne({index: index})
	return route.editmode;
});

	Template.clientrouteview.events({
		'click button': function(event) {
			if(!longPress)
			{
				currentIndex = $(this).attr("index");
				console.log($(this).attr("sink"));	
				if(currentIndex < 0)
					Meteor.call('ActivateRoute',$(this).attr("sinkName"),$(this).attr("sourceName"));
				else
					Meteor.call('DeactivateRoute',currentIndex);
			}
			else
			{
				Routes.update({index: $(this).attr("index")},{$set: {editmode: true}});
			}
		},
		'mousedown button': function(event) {
			startTime = new Date().getTime();
		},
		'mouseup button': function(event) {
			endTime = new Date().getTime();
			longPress = (endTime - startTime) > 1000;
		}
	});	
}

if(Meteor.isServer){
	Meteor.methods({
		ActivateRoute: function(sink,source){ActivateRoute(sink,source)},
		DeactivateRoute: function(index){DeactivateRoute(index);}});
}
