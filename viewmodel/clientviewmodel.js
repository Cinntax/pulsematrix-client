if(Meteor.isClient){
	var timeoutId = 0;
  
	Template.clientview.SourceList = function() {
		return Sources.find({});
	};
	Template.clientview.SinkList = function() {
    return Sinks.find({});
  };
	Template.clientview.SelectedSource = function() {
		return Sources.findOne({name: Session.get("selectedSource")})
	};

	Template.clientsourceview.heightclass = function () {
		if(Sources.find({}).count() < 5)	
			return 'height-rows-' + Sources.find({}).count();
		else
			return 'height-rows-more'
	};
	Template.clientsourceview.widthclass = function () {
		sinkCount = Sinks.find({}).count();
		if(24 % sinkCount == 0)
		{
			return 'pure-u-' + 24 / sinkCount + '-24'
		}
		else if(5 % sinkCount == 0)
		{
			return 'pure-u-' + 5 / sinkCount + '-5'
		}
		else
		{
			return 'pure-u-' + (24 - (24 % sinkCount) ) / sinkCount + '-24'
		}
	};

	Template.clientview.widthclass = function () {
		return Template.clientsourceview.widthclass()
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
		},
		'mousedown button': function(event) {
			Session.set("selectedSource",$(this).attr("sourceName"))

			timeoutId = setTimeout(function() {
				 Custombox.open({
         	target: '#modal',
         	effect: 'contentscale',
         	width: 600
    		 });
			},1000);
		},
		'mouseup button': function(event) {
			clearTimeout(timeoutId);
		},
		'mouseleave button': function(event) {
			clearTimeout(timeoutId);
		}
	});	

	Template.modalview.events({
			'change input[type=range]': function(event){
				Meteor.call('SetSourceVolume',Session.get("selectedSource"), $("input[type=range]").val());
			}
	});
}

if(Meteor.isServer){
	Meteor.methods({
		ActivateRoute: function(sink,source){ActivateRoute(sink,source)},
		DeactivateRoute: function(index){DeactivateRoute(index);},
		SetSourceVolume: function(source,volume){SetSourceVolume(source,volume)}});
}
