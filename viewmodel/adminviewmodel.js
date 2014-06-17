if(Meteor.isClient){
	Template.adminview.visible = function() {
		return Session.get('viewmode') == 'admin';
	};
	
}

if(Meteor.isServer){
}
