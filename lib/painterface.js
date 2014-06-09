PASinks = new Meteor.Collection("Sinks");
PASources = new Meteor.Collection("Sources");
PARoutes = new Meteor.Collection("Routes");

localSinks = new Array();
localSources = new Array();
localRoutes = new Array();

	if(Meteor.isServer)
	{
		
		InsertPALoopbackModule = function(data, callback)
		{
			var exec = Npm.require('child_process').exec;
      exec('pactl load-module module-loopback source=' + data.source + ' sink=' + data.sink, function (error, stdout, stderr) {
				 regexOutput = /[0-9]+/g;
         outputMatch = regexOutput.exec(stdout.toString());
				if(outputMatch)
					callback(null, outputMatch[0]);
				else
					callback('insert failed.', -1);	
			});
		}

		RemovePALoopbackModule = function(data, callback)
    {
      var exec = Npm.require('child_process').exec;
      exec('pactl unload-module ' + data.index, function (error, stdout, stderr) {
          callback(null);
      });
    }

		//Synchronously get our sinks from pulseaudio into json.	
		GetPASinkData = function(data, callback)
		{
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

    //Synchronously get our sources from pulseaudio into json.  
    GetPASourceData = function(data, callback)
    {
      localSources = new Array();
      var exec = Npm.require('child_process').exec;
      exec('pactl list short sources', function (error, stdout, stderr) {
      	sourceHeaders = stdout.toString().split('\n');
      	console.log('sourceheaders.length: ' + sourceHeaders.length);
      	for(i=0;i<sourceHeaders.length;i++)
      	{
         	var newSource = new Source();
         	sourceDetail = sourceHeaders[i].split('\t');

         	newSource.index = sourceDetail[0]; //Index Number
         	newSource.name = sourceDetail[1]; //Name
         	newSource.type = sourceDetail[2]; //Type of source
         	localSources.push(newSource);
      	}
      	console.log('put ' + localSources.length);
       	callback(null);
      });
    }

    //Synchronously get our routes from pulseaudio into json.  
    GetPARouteData = function(data, callback)
    {
      localRoutes = new Array();
      var exec = Npm.require('child_process').exec;
      exec('pactl list short modules', function (error, stdout, stderr) {
        routeHeaders = stdout.toString().split('\n');
				console.log('routeheaders.length: ' + routeHeaders.length);
        for(i=0;i<routeHeaders.length;i++)
        {
          var newRoute = new Route();
          routeDetail = routeHeaders[i].split('\t');
					newRoute.index = routeDetail[0]; //index
					regexSink = /.*sink=(\S+).*/g;
        	regexSource = /.*source=(\S+).*/g;	
					sourceMatch = regexSource.exec(routeDetail[2]);
					sinkMatch = regexSink.exec(routeDetail[2]);
					if(sourceMatch && sinkMatch)
					{		
						console.log("source: " + sourceMatch[1]);
						console.log("sink: " + sinkMatch[1]);	
						newRoute.source = sourceMatch[1];
						newRoute.sink = sinkMatch[1];
          	localRoutes.push(newRoute);
       		} 
				}
        console.log('put ' + localRoutes.length);
        callback(null);
      });
    }

		RefreshPA = function()
		{
			//Call out to pulseaudio to get an array of sinks.
		  GetSinkData = Meteor._wrapAsync(GetPASinkData);
			GetSinkData(null);
			
			//Call out to pulseaudio to get an array of sources.	
			GetSourceData = Meteor._wrapAsync(GetPASourceData);
			GetSourceData(null);

			//Call out to pulseaudio to get an array of routes.
			GetRouteData = Meteor._wrapAsync(GetPARouteData);
			GetRouteData(null);

			console.log('refreshing PA sink data...');
      console.log('found ' + localSinks.length + ' sinks in pa.');

			console.log('refreshing PA source data...');
			console.log('found ' + localSources.length + ' sources in pa.');
			
			console.log('refreshing PA route data...');
			console.log('found ' + localRoutes.length + ' routes in pa.');

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

      //Add any sources that PA has that we dont.
      for(i=0;i<localSources.length;i++)
      {
          existingSource = PASources.findOne({name: localSources[i].name});
          if(!existingSource)
          {
            PASources.insert(localSources[i]);
            console.log("Added a source...");
          }
      }
			
			//Add any routes that PA has that we dont.
			for(i=0;i<localRoutes.length;i++)
      {
          existingRoute = PARoutes.findOne({sink: localRoutes[i].sink, source: localRoutes[i].source});
          if(!existingRoute)
          {
            PARoutes.insert(localRoutes[i]);
            console.log("Added a route...");
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

      //Remove any sources that we have that PA no longer does.
      cur = PASources.find({});
      cur.forEach(function(source) {
        found = 0;
        for(i=0;i<localSources.length;i++)
        {
          if(localSources[i].name == source.name)
          {
            found = 1;
            break;
          }
        }
        if(!found)
        {
          PASources.remove(source);
          console.log("removed a source...");
        }
      });

      //Remove any routes that we have that PA no longer does.
      cur = PARoutes.find({});
      cur.forEach(function(route) {
        found = 0;
        for(i=0;i<localRoutes.length;i++)
        {
          if(localRoutes[i].sink == route.sink && localRoutes[i].source == route.source)
          {
            found = 1;
            break;
          }
        }
        if(!found)
        {
          PARoutes.remove(route);
          console.log("removed a route...");
        }
      });

		}
	
		ActivateRoute = function(sinkName, sourceName)
		{
			console.log("activateroute called... sink=" + sinkName + ", source=" + sourceName);
      newRoute = new Route();
			newRoute.sink = sinkName;
			newRoute.source = sourceName;
      InsertModule = Meteor._wrapAsync(InsertPALoopbackModule);
      index = InsertModule(newRoute);
			console.log("insert index=" + index);
			if(index > -1)
			{
				newRoute.index = index;
				PARoutes.insert(newRoute);
			}
		}

		DeactivateRoute = function(routeIndex)
    {
      removeRoute = new Route();
			console.log('removing module at index: ' + routeIndex)
      removeRoute.index = routeIndex;
      RemoveModule = Meteor._wrapAsync(RemovePALoopbackModule);
      RemoveModule(removeRoute);

      PARoutes.remove({index: routeIndex});
    }
	}
