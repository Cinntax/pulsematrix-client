if(Meteor.isClient){
	Template.clientview.SinkList = function() {
		return Sinks.find({});
	};
	
}
