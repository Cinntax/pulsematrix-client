//These meteor collections will be used to display the UI- they will be kept in sync with pulseaudio.
Sinks = new Meteor.Collection('sinks');
Sources = new Meteor.Collection('sources');
Routes = new Meteor.Collection('routes');

//When we start up, we're going to refresh our collections from pulseaudio, and then kick off a schedule to do it on an interval.
//In theory we shouldn't have to do this, since pulseaudio should be controlled only through this application.
if (Meteor.isServer) {
		Meteor.setInterval(RefreshPA, 600000);
  Meteor.startup(function () {
			RefreshPA();
  });
}
