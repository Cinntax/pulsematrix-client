if(Meteor.isClient){

 	Template.mpdsourceeditform.ActiveObject = function () {
		return Sources.findOne({_id: Session.get('adminSelectedObject')._id})
	} 

	Template.mpdsourceeditform.events({
		'click #save': function(event) {
			modifiedObject = Template.mpdsourceeditform.ActiveObject();
			modifiedObject.name = $('#mpdsource_name').val();
			modifiedObject.mpdconf = $('#mpdsource_mpdconf').val();
			modifiedObject.paName = $('#mpdsource_paname').val();
			modifiedObject.enabled = $('#mpdsource_enabled').prop('checked');	
			Sources.update({_id: Session.get('adminSelectedObject')._id}, modifiedObject);
		},
		'click #delete': function(event) {
			Sources.remove({_id: Session.get('adminSelectedObject')._id});
		}
	});	
}

if(Meteor.isServer){
}

