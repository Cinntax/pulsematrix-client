if(Meteor.isClient){
	Template.nav.events({
		'click button': function(event) {
			mode = Session.get('viewmode');
			if(!mode || mode == 'admin')
				Session.set('viewmode','client');
			else
				Session.set('viewmode','admin');
		}
	});	
}
