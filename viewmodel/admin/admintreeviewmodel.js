if(Meteor.isClient){
	Template.admintreeview.LocalSinkList = function() {
		return Sinks.find({minorTypeName: 'local'});
	};


	Template.admintreeview.AirplaySourceList = function() {
    return Sources.find({minorTypeName: 'airplay'});
  };
	
	Template.admintreeview.MPDSourceList = function() {
		return Sources.find({minorTypeName: 'mpd'});
	};
	
	Template.admintreeview.events({
		'click li': function(event) {
			Session.set('adminSelectedObject', this);
		},
		'click #newlocalsink': function(event) {
			newSink = new LocalSink();
			Sinks.insert(newSink);
			Session.set('adminSelectedObject', newSink);
		},
		'click #newairplaysource': function(event) {
			newSource = new AirplaySource();
			Sources.insert(newSource);
			Session.set('adminSelectedObject', newSource);
		},
		'click #newmpdsource': function(event) {
			newSource = new MPDSource();
			Sources.insert(newSource);
			Session.set('adminSelectedObject', newSource);
		}
	});	
}

if(Meteor.isServer){
}
