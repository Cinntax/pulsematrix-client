if(Meteor.isClient){
	Template.adminsinkview.SinkList = function() {
		return PASinks.find({type: 'module-remap-sink.c'});
	};
	
	Template.adminsinkview.EditSinkRawName = function() {
		if(PASinks.findOne({_id: Session.get('adminSelectedSink')}))
			return PASinks.findOne({_id: Session.get('adminSelectedSink')}).name;	
		else
			return '';
	};
	
	Template.adminsinkview.EditSinkFriendlyName = function() {
		if(PASinks.findOne({_id: Session.get('adminSelectedSink')}))
			return PASinks.findOne({_id: Session.get('adminSelectedSink')}).friendlyName;
		else
			return '';
	}

	Template.adminsinkview.events({
		'click #sinkSave': function(event) {

			console.log('saving sink..');
			PASinks.update({_id: Session.get('adminSelectedSink')}, {$set: {friendlyName: $('#sinkFriendlyName').val()}});
		},
		'click li': function(event) {
			console.log('clicked item:' + this._id);
			Session.set('adminSelectedSink', this._id);
		}
	});	
}

if(Meteor.isServer){
}
