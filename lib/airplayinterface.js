	if(Meteor.isServer)
	{
		
		CreateNewAirplayService = function(source)
		{
			var fs = Npm.require('fs');
			serviceTemplate = Assets.getText('filetemplates/airplaytemplate.service');		
			
			newServiceText = serviceTemplate.replace('{{airplayName}}', source.airplayName).replace('{{paName}}', source.paName.replace('.monitor','')).replace('{{airplayPort}}', source.airplayPort);
			fs.writeFileSync('/home/djcinnamon/' + source.name + '.service', newServiceText);
		}

		RemoveAirplayService = function(source)
    {
	
    }
		
		StartAirplayService = function(data, callback)
    {
    }

    StopAirplayService = function(data, callback)
    {
    }

		Start = function(source)
		{
		}

		Stop = function(source)
		{
		}
	}
