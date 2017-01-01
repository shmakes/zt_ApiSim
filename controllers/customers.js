F.route('/admin/customers',       query,  ['*Customer']);
F.route('/admin/customers/{id}',  get,    ['*Customer']);
F.route('/admin/customers/{id}',  get,    ['*Customer']);
F.route('/admin/customers',       save,   ['*Customer', 'post']);
F.route('/admin/customers/{id}',  remove, ['*Customer', 'delete']);


function query() {
	var self = this;
	self.$query(self.query, function(err, result){
		result['query'] = self.query;
		self.json(result);
	});
}

function get(id) {
	var self = this;
	this.$get(id, self.callback());	
}

function save() {
	var self = this;
	this.body.$save(self.callback());
	// another way to use it is
	// this.$save(this.body, self.callback());
	
}

function remove(id) {
	var self = this;
	this.$remove(id, self.callback());
}