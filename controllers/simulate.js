F.route('/SugarCRMZahid/index.php', zt, ['post']);

function zt() {
	let self = this;
	let auth = self.req.headers.authorization
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
                let existing = data[0];

                existing.inspection_flag     = body.inspection_flag; // Yes/No
                existing.scheduled_hours     = body.scheduled_hours; // Number
                existing.job_scope           = body.job_scope;       // Inspection/Repair
                existing.number_visit        = body.number_visit;    // Number
                existing.planner_status      = body.planner_status;  // ??????
                existing.scheduled_date      = body.scheduled_date;  // DateTime
                existing.planning_date       = body.planning_date;   // DateTime
                existing.job_status          = body.job_status;      // ??????
                existing.model               = body.model;
                existing.serial_no           = body.serial_no;
                existing.city                = body.city;
                existing.location_direction  = body.location_direction;
                existing.advisor_instruction = body.advisor_instruction;
                existing.technician_name     = body.technician_name;

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

