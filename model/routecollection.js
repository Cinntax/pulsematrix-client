RouteCollection = function()
{
	PASinks = new Meteor.Collection("Sinks");

	SinkCollection.prototype.find = function(selector,options)
	{
		return PASinks.find(selector,options);
	}
	
	if(Meteor.isServer)
	{	
		SinkCollection.prototype.RefreshPA = function()
		{
			PASinks.remove({});
			var exec = Npm.require('child_process').exec;
			var Fiber = Npm.require('fibers')
			
				exec('pactl list short sinks', function (error, stdout, stderr) {
					Fiber(function (stdout)
					{
						sinkHeaders = stdout.toString().split('\n');
		    		for(i=0;i<sinkHeaders.length;i++)
						{
							var newSink = new Sink();
      				sinkDetail = sinkHeaders[i].split('\t');
						
        			newSink.index = sinkDetail[0]; //Index Number
        			newSink.name = sinkDetail[1]; //Name
							newSink.type = sinkDetail[2]; //Type of Sink
							PASinks.insert(newSink);	
						}
				}).run(stdout)});
		}
	
	this.RefreshPA();
	}
}
