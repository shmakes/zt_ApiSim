//NOSQLMEMORY('tickets'); This currently breaks updates.
NEWSCHEMA('Contact').make(function(schema) {

	schema.define('contact_name', String);
	schema.define('contact_id', String);
	schema.define('date_modified', String);
	schema.define('contact_landline_1', String);
	schema.define('contact_mobile_number_1', String);
	schema.define('contact_mobile_number_2', String);
	schema.define('email', String);
	schema.define('job_title', String);
	schema.define('cont_deleted', String);

});
