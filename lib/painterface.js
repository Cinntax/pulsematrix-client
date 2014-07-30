//Here is where we're going to interface with PulseAudio.  Hopefully this will be modified later on to actually use the pulse api, instead of pactl.
localSinks = new Array();
localSources = new Array();
localRoutes = new Array();

//Quick hack to only bring back the sources/sinks that I care about.
sinkFilter = "module-remap-sink.c"
sourceFilter = "module-null-sink.c"

	if(Meteor.isServer)
	{
		//These nodes here actually execute the pulseaudio commands- because they are external, they need be forced to execute synchronously.	
		//Insert a new "route", which is what happens when you press an inactive toggle button on the client.
		InsertPALoopbackModule = function(data, callback)
		{
			var exec = Npm.require('child_process').exec;
      exec('pactl load-module module-loopback source=' + data.sourceName + ' sink=' + data.sinkName, function (error, stdout, stderr) {
				 regexOutput = /[0-9]+/g;
         outputMatch = regexOutput.exec(stdout.toString());
				if(outputMatch)
					callback(null, outputMatch[0]);
				else
					callback('insert failed.', -1);	
			});
		}
	  //Remove a "route", which is what happens when you press an active toggle button on the client.
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
				
				for(i=0;i<sinkHeaders.length;i++)
					if(sinkHeaders[i].length > 0 && sinkHeaders[i].indexOf(sinkFilter) > -1)
        		localSinks.push(sinkHeaders[i].split('\t')[1]); //Push the sink name into the array.
				
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
      	
				for(i=0;i<sourceHeaders.length;i++)
     			if(sourceHeaders[i].length > 0 && sourceHeaders[i].indexOf(sourceFilter) > -1)
			  		localSources.push(sourceHeaders[i].split('\t')[1]); //Push the source name into the array.
       	
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
        for(i=0;i<routeHeaders.length;i++)
        {
          var newRoute = new Route();
          routeDetail = routeHeaders[i].split('\t');
					newRoute.index = routeDetail[0]; //index- we definitely need the index on these since we'll be manipulating them.
					regexSink = /.*sink=(\S+).*/g;
        	regexSource = /.*source=(\S+).*/g;	
					sourceMatch = regexSource.exec(routeDetail[2]);
					sinkMatch = regexSink.exec(routeDetail[2]);
					if(sourceMatch && sinkMatch)
					{		
						newRoute.sourceName = sourceMatch[1];
						newRoute.sinkName = sinkMatch[1];
          	localRoutes.push(newRoute);
       		} 
				}
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

			//Ensure we have a record of all sinks reported by pulseaudio.
		  for(i=0;i<localSinks.length;i++)
			{
					existingSink = Sinks.findOne({sinkName: localSinks[i]});
					if(!existingSink)
						Sinks.insert({sinkName: localSinks[i]});
			}

			//Get rid of sinks that are NOT in pulseaudio
      cur = Sinks.find({});
	
			//Loop through our meteor collection, and remove those that are no longer in pa.	
      cur.forEach(function(sink) {
        found = 0;
        for(i=0;i<localSinks.length;i++)
        {
          if(localSinks[i] == sink.sinkName)
          {
            found = 1;
            break;
          }
        }
        if(!found)
					Sinks.remove({_id: sink._id});
      });

      //Ensure we have a record of all sources reported by pulseaudio.
      for(i=0;i<localSources.length;i++)
      {
          existingSource = Sources.findOne({sourceName: localSources[i]});
          if(!existingSource)
						Sources.insert({sourceName: localSources[i]});
      }

      //Get rid of sources that couldn't be found in Pulseaudio.
      cur = Sources.find({});
      cur.forEach(function(source) {
        found = 0;
        for(i=0;i<localSources.length;i++)
        {
          if(localSources[i] == source.sourceName)
          {
            found = 1;
            break;
          }
        }
        if(!found)
					Sources.remove({_id: source._id});
      });


			//Add any routes that PA has that we dont.
			for(i=0;i<localRoutes.length;i++)
      {
          existingRoute = Routes.findOne({sinkName: localRoutes[i].sinkName, sourceName: localRoutes[i].sourceName, index: localRoutes[i].index});
          if(!existingRoute)
            Routes.insert(localRoutes[i]);
      }

      //Remove any routes that we have that PA no longer does.
      cur = Routes.find({});
      cur.forEach(function(route) {
        found = 0;
        for(i=0;i<localRoutes.length;i++)
        {
          if(localRoutes[i].sinkName == route.sinkName && localRoutes[i].sourceName == route.sourceName && localRoutes[i].index == route.index)
          {
            found = 1;
            break;
          }
        }
        if(!found)
          Routes.remove({_id: route._id});
      });
		}

//Public API	
		ActivateRoute = function(sinkName, sourceName)
		{
			console.log("activateroute called... sink=" + sinkName + ", source=" + sourceName);
      newRoute = new Route();
			newRoute.sinkName = sinkName;
			newRoute.sourceName = sourceName;
      InsertModule = Meteor._wrapAsync(InsertPALoopbackModule);
      index = InsertModule(newRoute);
			console.log("insert index=" + index);
			if(index > -1)
			{
				newRoute.index = index;
				Routes.insert(newRoute);
			}
		}

		DeactivateRoute = function(routeIndex)
    {
      removeRoute = new Route();
			console.log('removing module at index: ' + routeIndex)
      removeRoute.index = routeIndex;
      RemoveModule = Meteor._wrapAsync(RemovePALoopbackModule);
      RemoveModule(removeRoute);

      Routes.remove({index: routeIndex});
    }
		
	}
