SourceCollection = function()
{
	PASources = new Meteor.Collection("Sources");
  localSources = new Array();

	SourceCollection.prototype.find = function(selector,options)
	{
		return PASources.find(selector,options);
	}
	
	if(Meteor.isServer)
	{
		//Synchronously get our sinks from pulseaudio into json.	
		GetPAData = function(data, callback)
		{
			var exec = Npm.require('child_process').exec;
			exec('pactl list short sources', function (error, stdout, stderr) {
				sourceHeaders = stdout.toString().split('\n');
				for(i=0;i<sourceHeaders.length;i++)
        {
              var newSource = new Source();
              sourceDetail = sourceHeaders[i].split('\t');

              newSource.index = sourceDetail[0]; //Index Number
              newSource.name = sourceDetail[1]; //Name
              newSource.type = sourceDetail[2]; //Type of Sink
              localSources.push(newSource);
        }
				callback(null);
			});
				

		}

		SourceCollection.prototype.RefreshPA = function()
		{
			PASources.remove({});
			localSources = new Array();
		  GetData = Meteor._wrapAsync(GetPAData);
			GetData(null);
		  for(i=0;i<localSources.length;i++)
			{
					PASources.insert(localSources[i]);	
			}
		}
	
	this.RefreshPA();
	}
}
