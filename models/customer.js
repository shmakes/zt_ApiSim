//NOSQLMEMORY('tickets'); This currently breaks updates.
NEWSCHEMA('Customer').make(function(schema) {

	schema.define('customer_account_number', String, true);
	schema.define('customer_name', String, true);
	schema.define('customer_landline_1', String);
	schema.define('customer_landline_2', String);
	schema.define('customer_loyalty_id', String);
	schema.define('contacts', '[Contact]');
	schema.define('address', String);
	schema.define('city', String);
	schema.define('region', String);
	schema.define('postal_code', String);
	schema.define('country', String);
	schema.define('site_name', String);
	schema.define('site_number', String);
	schema.define('date_modified', String);

	// Query customers
	schema.setQuery(function(error, options, callback) {

		options.page = U.parseInt(options.page) - 1;
		options.max = U.parseInt(options.max, 20);
		if (options.page < 0)
			options.page = 0;
		let take = U.parseInt(options.max);
		let skip = U.parseInt(options.page * options.max);
		let minDate = options.modifyFromDate || '';
		let maxDate = options.modifyToDate || '';

		let filter = NOSQL('customers').find();

		filter.take(take);
		filter.skip(skip);
		
		if (minDate) {
			filter.where('date_modified', '>', minDate);
		}
		if (maxDate) {
			filter.where('date_modified', '<=', maxDate);
		}

		if(options.sort) filter.sort(options.sort);

		filter.callback(function(err, docs, count) {
			
			// let's create object which will be returned
			let data = {};
			data.count = count;
			data.items = docs;
			data.limit = options.max;
			data.pages = Math.ceil(data.count / options.max) || 1;
			data.page = options.page + 1;

			callback(data);
		});

	});

	schema.setGet(function(error, model, id, callback) {

		NOSQL('customers')
			.one()
			.where('customer_account_number', id)
			.callback(function(err, customer){

				callback({success: !!customer, data: customer});

			});

	});

	schema.setSave(function(error, model, options, callback) {

		NOSQL('customers')
			.update(model, model)
			.where('customer_account_number', model.customer_account_number)
			.callback(function() {

				callback({success: true, id: model.customer_account_number});

			});

	});

	// Remove a specific customer
	schema.setRemove(function(error, id, callback) {

		NOSQL('customers')
			.remove()
			.where('customer_account_number', id)
			.callback(function(){

				callback({success: true});

			});
		
	});
});
