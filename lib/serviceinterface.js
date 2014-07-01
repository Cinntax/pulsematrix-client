if(Meteor.isServer)
{
	serviceDirectory = '/home/djcinnamon/audioui_services';
  systemdSymlinkDirectory = '/etc/systemd/system/audioui'; 
	serviceUser = 'mpd'; 
	
	//These functions will both enable the service, as well as start them immediately.	
	SystemctlStartService = function(source, callback)
  {
		var exec = Npm.require('child_process').exec;
		serviceName = source.name + '.service';
		cmd = 'systemctl enable ' + serviceName + ' && systemctl start ' + serviceName;
    exec(cmd, function (error, stdout, stderr) {
       callback(null);
		});
  }

	SystemctlStopService = function(source, callback)
  {
    var exec = Npm.require('child_process').exec;
    serviceName = source.name + '.service';
    cmd = 'systemctl disable ' + serviceName + ' && systemctl stop ' + serviceName;
    exec(cmd, function (error, stdout, stderr) {
       callback(null);
    });
  }
	
	SystemctlRestartService = function(source, callback)
  {
    var exec = Npm.require('child_process').exec;
    serviceName = source.name + '.service';
    cmd = 'systemctl restart ' + serviceName;
    exec(cmd, function (error, stdout, stderr) {
       callback(null);
    });
  }
	
	SystemctlServiceStatus = function(source, callback)
	{
		var exec = Npm.require('child_process').exec;
		serviceName = source.name + '.service';
		cmd = 'systemctl status ' + serviceName + ' | grep Active:';
		exec(cmd, function (error, stdout, stderr) {
			callback(null, stdout);
		});
	}
	
	//Public API Here!

	StartService = function(source)
	{
	  StartCmd = Meteor._wrapAsync(SystemctlStartService);
  	StartCmd(source);
	}
	StopService = function(source)
	{
		StopCmd = Meteor._wrapAsync(SystemctlStopService);
    StopCmd(source);
	}
	RestartService = function(source)
	{
		RestartCmd = Meteor._wrapAsync(SystemctlRestartService);
    RestartCmd(source);
	}

	RemoveService = function(source)
  {
      //Delete the service file.
      var fs = Npm.require('fs');
      fs.unlinkSync(serviceDirectory + '/' + source.name + '.service');
			fs.unlinkSync(systemdSymlinkDirectory + '/' + source.name + '.service');
  }

	GetStatus = function(source)
	{
		StatusCmd = Meteor._wrapAsync(SystemctlServiceStatus);
		message = StatusCmd(source);
		console.log(message);
	//	return message;
	}	
}
