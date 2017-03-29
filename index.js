require('total.js').http('release', {port: 8786});

F.on('request', function(req, res){
	console.log(`[${req.method}] ${req.url}`);
});
