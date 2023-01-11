const {app, Logger} = require('jj.js');
const open = require('open');

//server
open('http://localhost:3003');
app.run(3003, '0.0.0.0', function(err){
    !err && console.info('http server is ready on 3003');
});