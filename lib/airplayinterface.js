	if(Meteor.isServer)
	{
		
		CreateNewAirplayService = function(source)
		{
			var fs = Npm.require('fs');
			serviceTemplate = Assets.getText('filetemplates/airplaytemplate.service');		
			servicePath = serviceDirectory + '/' + source.name + '.service';
			newServiceText = serviceTemplate.replace(/{{user}}/g, serviceUser).replace(/{{airplayName}}/g, source.airplayName).replace(/{{paName}}/g, source.paName.replace('.monitor','')).replace(/{{airplayPort}}/g, source.airplayPort);
			fs.writeFileSync(servicePath, newServiceText);

			//Put a symbolic link in the systemd folder to make it official.
			fs.symlinkSync(servicePath, systemdSymlinkDirectory + '/' + source.name + '.service');	
			return 0;
		}

	}
