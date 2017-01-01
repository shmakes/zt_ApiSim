NOSQLMEMORY('tickets');
NEWSCHEMA('Ticket').make(function(schema) {

	schema.define('ticket_no', String, true);
	schema.define('region', String);
	schema.define('branch', String);
	schema.define('ticket_status', String);
	schema.define('customer_name', String);
	schema.define('contact_name', String);
	schema.define('contact_mobile_no', String);
	schema.define('category', String);
	schema.define('segment', String);
	schema.define('technician', String);
	schema.define('compartment', String);
	schema.define('equipment_condition', String);
	schema.define('model', String);
	schema.define('serial_no', String);
	schema.define('city', String);
	schema.define('location_direction', String);
	schema.define('technical_contact_name', String);
	schema.define('technical_contact_number', String);
	schema.define('advisor_instructions', String);
	schema.define('job_type', String);
	schema.define('job_status', String);
	schema.define('instpection_flag', String);
	schema.define('scheduled_hours', String);
	schema.define('job_scope', String);
	schema.define('number_visit', String);
	schema.define('planner_status', String);
	schema.define('scheduled_date', String);
	schema.define('planning_date', String);
	schema.define('technician_name', String);
	schema.define('modify_date', String);

	// Query tickets
	schema.setQuery(function(error, options, callback) {

		options.page = U.parseInt(options.page) - 1;
		options.max = U.parseInt(options.max, 20);
		if (options.page < 0)
			options.page = 0;
		var take = U.parseInt(options.max);
		var skip = U.parseInt(options.page * options.max);
		var filter = NOSQL('tickets').find();

		filter.take(take);
		filter.skip(skip);

		if(options.sort) filter.sort(options.sort);

		filter.callback(function(err, docs, count) {
			
			// let's create object which will be returned
			var data = {};
			data.count = count;
			data.items = docs;
			data.limit = options.max;
			data.pages = Math.ceil(data.count / options.max) || 1;
			data.page = options.page + 1;

			callback(data);
		});

	});

	schema.setGet(function(error, model, id, callback) {

		NOSQL('tickets')
			.one()
			.where('id', id)
			.callback(function(err, ticket){

				callback({success: !!ticket, data: ticket});

			});

	});

	schema.setSave(function(error, model, options, callback) {

		// if there's no id then it's an insert otherwise update
		var isNew = model.id ? false : true;

		// create id if it's new
		if(isNew) model.id = UID(); //UID returns string such as 16042321110001yfg

		NOSQL('tickets')
			.upsert(model) // update or insert
			.where('id', model.id)
			.callback(function() {

				callback({success: true, id: model.id});

			});
	});

	// Remove a specific ticket
	schema.setRemove(function(error, id, callback) {

		NOSQL('tickets')
			.remove()
			.where('id', id)
			.callback(function(){

				callback({success: true});

			});
		
	});
});
