var Pulse = require('..');

var ctx = new Pulse({
  client: 'test-client'
});

ctx.on('state', function(state){
  console.log('context:', state);
});

ctx.on('connection', function(){
  var out = ctx.createPlaybackStream({channels:1, rate:8000, format:'s16le'});
  out.on('state', function(state){
    console.log('pbs:', state);
  });
  var rec = ctx.createRecordStream({channels:1, rate:8000, format:'s16le'});
  rec.on('state', function(state){
    console.log('stream:', state);
  });

  rec.stop();
  rec.pipe(out);
  rec.play();

  //rec.stop();

  //return;

  setTimeout(function(){
    out.stop();
  }, 2000);
  setTimeout(function(){
    out.play();
  }, 4000);

  return;
  out.on('connection', function(){
    /*rec.on('connection', function(){
      setTimeout(function(){rec.pause();}, 100);
      setTimeout(function(){rec.resume();}, 1000);
    });*/
    rec.on('data', function(chunk){
      //console.log('stream.data:', chunk.length);
      out.write(chunk);
    });
  });
});
