if(Meteor.isClient){
	Template.clientview.SinkList = function() {
		return PASinks.find({type: 'module-remap-sink.c'});
	};
	
	Template.clientsinkview.SourceList = function() {
		return Sources.find({type: 'module-null-sink.c'});
	};
	
}

