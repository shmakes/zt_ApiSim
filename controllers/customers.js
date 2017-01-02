F.route('/admin/customers',       query,  ['*Customer']);
F.route('/admin/customers/{id}',  get,    ['*Customer']);
F.route('/admin/customers/{id}',  save,   ['*Customer', 'put']);
F.route('/admin/customers',       save,   ['*Customer', 'post']);
F.route('/admin/customers/{id}',  remove, ['*Customer', 'delete']);

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