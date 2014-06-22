if(Meteor.isClient){
 	Template.airplaysourceeditform.ActiveObject = function () {
		return Sources.findOne({_id: Session.get('adminSelectedObject')._id})
	} 


	Template.airplaysourceeditform.events({
		'click #save': function(event) {
			modifiedObject = Template.airplaysourceeditform.ActiveObject();
			modifiedObject.name = $('#airplaysource_name').val();
			modifiedObject.airplayName = $('#airplaysource_airplayname').val();
			modifiedObject.airplayPort = $('#airplaysource_airplayport').val();
			modifiedObject.paName = $('#airplaysource_paname').val();
			modifiedObject.enabled = $('#airplaysource_enabled').prop('checked');
			Meteor.call('SavePASource', modifiedObject);
		},
		'click #delete': function(event) {
			Sources.remove({_id: Session.get('adminSelectedObject')._id});
		}
	});	
}

if(Meteor.isServer){
	Meteor.methods({
		SavePASource: function(source){
		  //Call out to the pa library to create the source.
			if(source.paIndex == -1)
			{	
				paSource = CreateSource(source)
				source = paSource;	
			}
			if(source.paIndex > -1 && source.servicePath == '')
			{
				CreateNewAirplayService(source);
			}
			Sources.update({_id: source._id}, source);
		}
	});	
}

