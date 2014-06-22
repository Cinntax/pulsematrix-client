if(Meteor.isClient){
//this.name = 'noname';
//	this.airplayName = 'noname';
//	this.airplayPassword = '';
//	this.hidden = false;
 	Template.localsinkeditform.ActiveObject = function () {
		return Sinks.findOne({_id: Session.get('adminSelectedObject')._id})
	} 


	Template.localsinkeditform.events({
		'click #save': function(event) {
			modifiedObject = Template.localsinkeditform.ActiveObject();
			modifiedObject.name = $('#localsink_name').val();
			modifiedObject.args = $('#localsink_args').val();
			modifiedObject.paName = $('#localsink_paname').val();
			modifiedObject.enabled = $('#localsink_enabled').prop('checked');	
			Sinks.update({_id: Session.get('adminSelectedObject')._id}, modifiedObject);
		},
		'click #delete': function(event) {
			Sinks.remove({_id: Session.get('adminSelectedObject')._id});
		}
	});	
}

if(Meteor.isServer){
}

