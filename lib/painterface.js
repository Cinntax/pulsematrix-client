//This is our hook into pulseaudio.  We're leveraging the pulseaudio API.
//We have defined the following functions:
//Retrieve all modules/sinks/sources, and synch them up with our local collection.
//Insert a new loopback module to connect a sink with a source.
//Remove an existing loopback module.

//These will be used to hold everything locally as soon as we get the info from PulseAudio.
localSinks = new Array();
localSources = new Array();
localRoutes = new Array();

//Quick hack to only bring back the sources/sinks/modules that I care about.
sinkFilter = "module-remap-sink.c"
sourceFilter = "module-null-sink.c"
moduleFilter = "module-loopback"

	if(Meteor.isServer)
	{
		 PulseAudio = Npm.require('/opt/node_modules/pulseaudio');
		//These nodes here actually execute the pulseaudio commands- because they are external, they need be forced to execute synchronously.	
		//Insert a new "route", which is what happens when you press an inactive toggle button on the client.
		InsertPALoopbackModule = function(data, callback)
		{
			var context = new PulseAudio()
			console.log('Using the pa api to load our module.');
			context.on('connection', function() { //This callback runs as soon as a successful connection to pulseaudio is obtained.
				context.loadmodule('module-loopback', 'source=' + data.sourceName + ' sink=' + data.sinkName, function(index){
					console.log('index: ' + index);
					context.end();
					if(index > 0)
						callback(null, index);
					else
						callback('insert failed.', -1);

				});
			});
		}
	  //Remove a "route", which is what happens when you press an active toggle button on the client.
		RemovePALoopbackModule = function(data, callback)
    {
			var context = new PulseAudio()
			console.log('Using the pa api to unload our module.')
			context.on('connection', function(){
				context.unloadmodule(data.index, function(success){
					console.log('return code: ' + success);
					context.end();
					callback(null);
				});
			});
    }

		//Get our sink/source/module data from the pulseaudio API.
		GetPAData = function(data, callback)
		{
			localSinks = new Array();
			localSources = new Array();
			localRoutes = new Array();

			//Since all of our pulseaudio calls are asynchronous, we'll make sure that all calls are done before closing the PA connection.
			finishedSinks = false
			finishedRoutes = false

			//PulseAudio = Npm.require('pulseaudio')
			var context = new PulseAudio()
			console.log('Using the pa api to get our sinks.')
			context.on('connection', function(){
				console.log('Got a connection to Pulseaudio!')
				
				context.on('error', function(error){console.log(error)});

				context.on('state', function(state){console.log(state)});

  			context.sink(function(list){
					for(i=0;i<list.length;i++)
					{
						if(list[i].driver.indexOf(sinkFilter) > -1)
						{
							var newSink = new Sink();
							newSink.index = list[i].index;
							newSink.name = list[i].name;
							if(list[i].description)
								newSink.displayName = list[i].description;

							localSinks.push(newSink);
						}
					}
					finishedSinks = true;
    		});
				//Our "routes" are really module-loopback modules.	
				context.module(function(list){
					for(i=0;i<list.length;i++)
					{
						if(list[i].name.indexOf(moduleFilter) > -1)
						{
							var newRoute = new Route();
							regexSink = /.*sink=(\S+).*/g;
          		regexSource = /.*source=(\S+).*/g;
							sourceMatch = regexSource.exec(list[i].argument);
          		sinkMatch = regexSink.exec(list[i].argument);
          		if(sourceMatch && sinkMatch)
          		{
								newRoute.index = list[i].index;
            		newRoute.sourceName = sourceMatch[1];
            		newRoute.sinkName = sinkMatch[1];
            		localRoutes.push(newRoute);
							}	
						}
					}
					finishedRoutes = true;
				});
				//Our "sources" are really the monitors of null sinks.	
				context.source(function(list){
					for(i=0;i<list.length;i++)
					{
						if(list[i].driver.indexOf(sourceFilter) > -1)
						{
							var newSource = new Source();
							newSource.index = list[i].index;
							newSource.name = list[i].name;
							if(list[i].description)
								newSource.displayName = list[i].description.replace('Monitor of ','');

							localSources.push(newSource);
						}
					}
					while(!finishedSinks || !finishedRoutes); //It's possible we might still be pulling something else- wait until all data is pulled.
					console.log('sources, routes and sinks have been pulled. closing connection.')
					context.end();
				  callback(null);
				});
			}); //End Connection
		}

		//This method will call out to pulseaudio, and then refresh our local Meteor collections with what's in PA.
		RefreshPA = function()
		{
			//Call out to pulseaudio to get our data.
			console.log('Refreshing PA data...')
			GetData = Meteor._wrapAsync(GetPAData);
			GetData(null);
			
      console.log('found ' + localSinks.length + ' sinks in pa.');
			console.log('found ' + localSources.length + ' sources in pa.');
			console.log('found ' + localRoutes.length + ' routes in pa.');

			//Ensure we have a record of all sinks reported by pulseaudio.
		  for(i=0;i<localSinks.length;i++)
			{
					existingSink = Sinks.findOne({name: localSinks[i].name});
					if(!existingSink)
						Sinks.insert(localSinks[i]);
			}

			//Get rid of sinks that are NOT in pulseaudio
      cur = Sinks.find({});
	
			//Loop through our meteor collection, and remove those that are no longer in pa.	
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
					Sinks.remove({_id: sink._id});
      });

      //Ensure we have a record of all sources reported by pulseaudio.
      for(i=0;i<localSources.length;i++)
      {
          existingSource = Sources.findOne({name: localSources[i].name});
          if(!existingSource)
						Sources.insert(localSources[i]);
      }

      //Get rid of sources that couldn't be found in Pulseaudio.
      cur = Sources.find({});
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
