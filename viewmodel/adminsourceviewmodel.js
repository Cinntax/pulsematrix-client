if(Meteor.isClient){
	Template.adminsourceview.SourceList = function() {
		return PASources.find({type: 'module-null-sink.c'});
	};
	
	Template.adminsourceview.EditSourceRawName = function() {
		if(PASources.findOne({_id: Session.get('adminSelectedSource')}))
			return PASources.findOne({_id: Session.get('adminSelectedSource')}).name;	
		else
			return '';
	};
	
	Template.adminsourceview.EditSourceFriendlyName = function() {
		if(PASources.findOne({_id: Session.get('adminSelectedSource')}))
			return PASources.findOne({_id: Session.get('adminSelectedSource')}).friendlyName;
		else
			return '';
	}

	Template.adminsourceview.events({
		'click #sourceSave': function(event) {

			PASources.update({_id: Session.get('adminSelectedSource')}, {$set: {friendlyName: $('#sourceFriendlyName').val()}});
		},
		'click li': function(event) {
			Session.set('adminSelectedSource', this._id);
		}
	});	
}

if(Meteor.isServer){
}
