F.route('/admin/tickets',       query,  ['*Ticket']);
F.route('/admin/tickets/{id}',  get,    ['*Ticket']);
F.route('/admin/tickets/{id}',  save,   ['*Ticket', 'put']);
F.route('/admin/tickets',       save,   ['*Ticket', 'post']);
F.route('/admin/tickets/{id}',  remove, ['*Ticket', 'delete']);

function query() {
	let self = this;
	self.$query(self.query, function(err, result){
		result['query'] = self.query;
		self.json(result);
	});
}

function get(id) {
	let self = this;
	this.$get(id, self.callback());	
}

function save(id) {
	let self = this;
	this.body.$save(self.callback());
}

function remove(id) {
	let self = this;
	this.$remove(id, self.callback());
}