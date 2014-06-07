PASinks = new Meteor.Collection("Sinks");
localSinks = new Array();

	if(Meteor.isServer)
	{
		//Synchronously get our sinks from pulseaudio into json.	
		GetPASinkData = function(data, callback)
		{
		console.log('making a new array...');
			localSinks = new Array();	
			var exec = Npm.require('child_process').exec;
			exec('pactl list short sinks', function (error, stdout, stderr) {
				sinkHeaders = stdout.toString().split('\n');
			  console.log('sinkheaders.length: ' + sinkHeaders.length);	
				for(i=0;i<sinkHeaders.length;i++)
        {
              var newSink = new Sink();
              sinkDetail = sinkHeaders[i].split('\t');

              newSink.index = sinkDetail[0]; //Index Number
              newSink.name = sinkDetail[1]; //Name
              newSink.type = sinkDetail[2]; //Type of Sink
              localSinks.push(newSink);
        }
				console.log('put ' + localSinks.length);
				callback(null);
			});
				

		}

		RefreshPA = function()
		{
		  GetData = Meteor._wrapAsync(GetPASinkData);
			GetData(null);
			console.log('refreshing PA sink data...');
      console.log('found ' + localSinks.length + ' sinks in pa.');
			//Add any sinks that PA has that we dont.
		  for(i=0;i<localSinks.length;i++)
			{
					existingSink = PASinks.findOne({name: localSinks[i].name});
					if(!existingSink)
					{
						PASinks.insert(localSinks[i]);
						console.log("Added a sink...");
					}
			}

			//Remove any sinks that we have that PA no longer does.
			cur = PASinks.find({});
			cur.forEach(function(sink) {
				found = 0;
				for(i=0;i<localSinks.length;i++)
				{
					if(localSinks[i].name == sink.name)
					{
						found = 1;
						break;
					}
				}
				if(!found)
				{
					PASinks.remove(sink);
					console.log("removed a sink...");
				}
			});
		}
	}

