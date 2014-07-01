if(Meteor.isClient){
	Template.adminview.visible = function() {
		return Session.get('viewmode') == 'admin';
	};

	Handlebars.registerHelper('formvisible', function(typeName) {
		selectedObj = Session.get('adminSelectedObject');
		if(selectedObj)
			return selectedObj.majorTypeName === typeName;
		else
			return false;
	});	

	Template.adminview.selectedObjectType = function() {
		selectedObj = Session.get('adminSelectedObject');
		if(selectedObj)
			return (selectedObj.minorTypeName + selectedObj.majorTypeName);
		else
			return '';
	};	
}

if(Meteor.isServer){
}
