if(Meteor.isClient){
 	Template.sourceform.ActiveObject = function () {
		return Sources.findOne({_id: Session.get('adminSelectedObject')._id})
	} 

	Template.sourceform.events({
		'click #delete': function(event) {
			Sources.remove({_id: Session.get('adminSelectedObject')._id});
		}
	});	
}

if(Meteor.isServer){
	Meteor.methods({
		SourceStatus: function(source){
			GetStatus(source);
		},
		DeleteSource: function(source){
		  console.log('deleting source...');	
			//Call out to the service library to create the service.
			//We'll want to be sure that we're not still running the service.
			//This will overwrite	the existing file.	
		  //servicePath =	CreateNewAirplayService(source);

			//Call out to the pa library to create the source.
      //if(source.paIndex == -1)
      //{ 
      //  paSource = CreateSource(source)
    //    source = paSource;  
  //    }
			//Sources.update({_id: source._id}, source);
		}
	});	
}

