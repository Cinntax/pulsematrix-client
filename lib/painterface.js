localSinks = new Array();
localSources = new Array();
localRoutes = new Array();

	if(Meteor.isServer)
	{
		//These nodes here actually execute the pulseaudio commands- because they are external, they need be forced to execute synchronously.	
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
				for(i=0;i<sinkHeaders.length;i++)
        {
              var newSink = new PASink();
              sinkDetail = sinkHeaders[i].split('\t');

              newSink.index = sinkDetail[0]; //Index Number
              newSink.name = sinkDetail[1]; //Name
              localSinks.push(newSink);
        }
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
      	{
         	var newSource = new PASource();
         	sourceDetail = sourceHeaders[i].split('\t');

         	newSource.index = sourceDetail[0]; //Index Number
         	newSource.name = sourceDetail[1]; //Name
         	localSources.push(newSource);
      	}
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
					newRoute.index = routeDetail[0]; //index
					regexSink = /.*sink=(\S+).*/g;
        	regexSource = /.*source=(\S+).*/g;	
					sourceMatch = regexSource.exec(routeDetail[2]);
					sinkMatch = regexSink.exec(routeDetail[2]);
					if(sourceMatch && sinkMatch)
					{		
						newRoute.source = sourceMatch[1];
						newRoute.sink = sinkMatch[1];
          	localRoutes.push(newRoute);
       		} 
				}
        callback(null);
      });
    }

		//Synchronously insert a new source (really a sink in pa terms).
		InsertPASourceModule = function(data, callback)
		{
			var exec = Npm.require('child_process').exec;
			exec('pactl load-module module-null-sink sink_name="' + data.paName + '"', function (error, stdout, stderr) {
				regexOutput = /[0-9]+/g;
        outputMatch = regexOutput.exec(stdout.toString());
        if(outputMatch)
          callback(null, outputMatch[0]);
        else
          callback('insert failed.', -1);
			});
		}

		RemovePASourceModule = function(data, callback)
		{
			var exec = Npm.require('child_process').exec;
      exec('pactl unload-module ' + data.paIndex, function (error, stdout, stderr) {
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

			//Update the indices on sinks that are active in pulseaudio
		  for(i=0;i<localSinks.length;i++)
			{
					existingSink = Sinks.findOne({paName: localSinks[i].name});
					if(existingSink)
						Sinks.update({_id: existingSink._id}, {$set: {paIndex: localSinks[i].index}});
			}

			//Reset indices to -1 for sinks that are NOT in pulseaudio
      cur = Sinks.find({});
      cur.forEach(function(sink) {
        found = 0;
        for(i=0;i<localSinks.length;i++)
        {
          if(localSinks[i].name == sink.paName)
          {
            found = 1;
            break;
          }
        }
        if(!found)
					Sinks.update({_id: existingSink._id}, {$set: {paIndex: -1}});
      });

      //Update indices for sources that are in pulseaudio.
      for(i=0;i<localSources.length;i++)
      {
          existingSource = Sources.findOne({paName: localSources[i].name});
          if(existingSource)
						Sources.update({_id: existingSource._id}, {$set: {paIndex: localSources[i].index}});
      }

      //update the index to -1 for sources that couldn't be found in Pulseaudio.
      cur = Sources.find({});
      cur.forEach(function(source) {
        found = 0;
        for(i=0;i<localSources.length;i++)
        {
          if(localSources[i].name == source.paName)
          {
            found = 1;
            break;
          }
        }
        if(!found)
					Sources.update({_id: source._id}, {$set: {paIndex: -1}});
      });


			//Add any routes that PA has that we dont.
			for(i=0;i<localRoutes.length;i++)
      {
          existingRoute = Routes.findOne({sink: localRoutes[i].sink, source: localRoutes[i].source, index: localRoutes[i].index});
          if(!existingRoute)
            Routes.insert(localRoutes[i]);
      }

      //Remove any routes that we have that PA no longer does.
      cur = Routes.find({});
      cur.forEach(function(route) {
        found = 0;
        for(i=0;i<localRoutes.length;i++)
        {
          if(localRoutes[i].sink == route.sink && localRoutes[i].source == route.source && localRoutes[i].index == route.index)
          {
            found = 1;
            break;
          }
        }
        if(!found)
          Routes.remove(route);
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
		
		CreateSource = function(source)
		{
			InsertModule = Meteor._wrapAsync(InsertPASourceModule);	
			source.paIndex = InsertModule(source);
			source.paName = source.paName + '.monitor'; 
			return source;
		}	
	}
