F.route('/SugarCRMZahid/index.php', zt, ['post']);

function zt() {
	let self = this;
	let auth = self.req.headers.authorization;
	if (auth.length !== 32) {
		self.json({ 
			status: 'failure',
			message: 'Authorization Failed',
			request_time: new Date().toISOString(),
			response_time: new Date().toISOString()
		})
		return;
	}
	let ep = self.query.entryPoint;
	if (!ep) {
		self.statusCode = 400;
		self.json({ status: utils.httpStatus(self.statusCode), 
					message: 'Missing entryPoint',
					request_time: new Date().toISOString(),
					response_time: new Date().toISOString()
		})
		return;
	}

	let body = self.body;
	switch (ep) {
		case 'fetchCustomerDetail':
			queryByDate(self, 'customers', body);
			break;
		case 'fetchCustomerDetailById':
			getById(self, 'customers', body, 'customer_id', body.customer_id);
			break;
		case 'fetchTicketDetail':
			queryByDate(self, 'tickets', body);
			break;
		case 'ticketUpdate':
            NOSQL('tickets')
            .find()
            .where('ticket_no', body.ticket_no)
            .callback(function(err, data) {
                let existing = data.length === 0 ? body : data[0];

                // Currently, their API does no validation, so these all update.
                if (true || body.inspection_flag == 'Yes' || body.inspection_flag == 'No') {
                    existing.inspection_flag = body.inspection_flag; // Yes/No
                }
                if (true || !isNaN(parseFloat(body.scheduled_hours))) {
                    existing.scheduled_hours = body.scheduled_hours; // Number
                }
                if (true || body.job_scope == 'Inspection' || body.job_scope == 'Repair') {
                    existing.job_scope       = body.job_scope;       // Inspection/Repair
                }
                if (true || !isNaN(parseFloat(body.number_visit))) {
                    existing.number_visit    = body.number_visit;    // Number
                }
                existing.planner_status      = body.planner_status;  // Whatever appt. status SP Sends
                existing.scheduled_date      = resolveDateOrDefault(body.scheduled_date, '1970-01-01');  // DateTime or it goes to 1970-01-01
                existing.planning_date       = resolveDateOrDefault(body.planning_date, '1970-01-01');   // DateTime or it goes to 1970-01-01
                if (body.job_status == 'Work started' || body.job_status == 'Completed') {
                    existing.job_status      = body.job_status;      // Work started/Completed ... etc.???
                }
                existing.model               = body.model;
                existing.serial_no           = body.serial_no;
                existing.city                = body.city;
                existing.location_direction  = body.location_direction;
                existing.advisor_instruction = body.advisor_instruction;
                existing.technician_name     = body.technician_name;
                existing.delivery_date       = resolveDateOrDefault(body.delivery_date, null); // DateTime or it goes to null.
                if (!isNaN(parseInt(body.shm))) {
                    existing.shm             = parseInt(body.shm); // Truncates to integer. If it can't, then zero.
                } else {
                    existing.shm             = 0;
                }
                existing.date_modified = new Date().toISOString().replace("T"," ").replace(/\..*$/g, "");
                updateById(self, 'tickets', existing, 'ticket_no', existing.ticket_no);
            });
			break;
		default:
			self.statusCode = 400;
			self.json({ status: utils.httpStatus(self.statusCode), 
						message: 'Invalid endPoint',
						request_time: new Date().toISOString(),
						response_time: new Date().toISOString()
			})
	}
}

function queryByDate(self, schema, body) {
	if (!body.modifyFromDate) {
		self.json({ 
			status: 'failure',
			message: 'ModifyFromDate can not be null'
		})
		return;
	}
	if (!body.modifyToDate) {
		self.json({ 
			status: 'failure',
			message: 'ModifyToDate can not be null'
		})
		return;
	}
	let minDate = Date.parse(body.modifyFromDate);
	let maxDate = Date.parse(body.modifyToDate);
	if (((maxDate - minDate) / (1000 * 3600 * 24)) > 15.0) {
		self.json({ 
			status: 'failure',
			message: 'date range should not exceed 15 days'
		})
		return;
	}

	NOSQL(schema)
	.find()
	.where('date_modified', '>',  body.modifyFromDate)
	.where('date_modified', '<=', body.modifyToDate)
	.callback(function(err, data) {
		self.json(data);
	});
}

function getById(self, schema, body, idField, idValue) {

	if (!idValue) {
		self.json({ 
			status: 'failure',
			message: 'Customer ID can not be null'
		})
		return;
	}

	NOSQL(schema)
	.find()
	.where(idField, idValue)
	.callback(function(err, data) {
		self.json(data);
	});
}

function updateById(self, schema, body, idField, idValue) {
	if (!idValue) {
		self.json({ 
			status: 'failure',
			message: 'Ticket Id can not be null'
		})
		return;
	}

	NOSQL(schema)
	.update(body)
	.where(idField, idValue)
	.callback(function(err, count) {
		if (count !== 1) {
			self.json({ 
				status: 'failure',
				message: 'Ticket Id is not valid'
			})
			return;
		}
		self.json({success: true, id: body[idField]});
	});
}

function resolveDateOrDefault(dateString, defaultValue) {
    var timestamp=Date.parse(dateString)
    return (isNaN(timestamp)==false) ? dateString : defaultValue;
}
