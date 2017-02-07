F.route('/SugarCRMZahid/indexphp', zt, ['post']);

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
		case 'fetchTicketDetail':
			queryByDate(self, 'tickets', body);
			break;
		case 'ticketUpdate':
			updateById(self, 'tickets', body, 'ticket_no', body.ticket_no);
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
		self.statusCode = 400;
		self.json({ status: utils.httpStatus(self.statusCode), 
					message: 'Missing modifyFromDate',
					request_time: new Date().toISOString(),
					response_time: new Date().toISOString()
		})
		return;
	}
	if (!body.modifyToDate) {
		self.statusCode = 400;
		self.json({ status: utils.httpStatus(self.statusCode), 
					message: 'Missing modifyToDate',
					request_time: new Date().toISOString(),
					response_time: new Date().toISOString()
		})
		return;
	}
	let minDate = Date.parse(body.modifyFromDate);
	let maxDate = Date.parse(body.modifyToDate);
	if (((maxDate - minDate) / (1000 * 3600 * 24)) > 15.0) {
		self.json({ 
			status: 'failure',
			message: 'date range should not exceed 15 days',
			request_time: new Date().toISOString(),
			response_time: new Date().toISOString()
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

function updateById(self, schema, body, idField, idValue) {
	if (!idValue) {
		self.json({ 
			status: 'failure',
			message: 'Ticket Id can not be null',
			request_time: new Date().toISOString(),
			response_time: new Date().toISOString()
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
				message: 'Ticket Id is not valid',
				request_time: new Date().toISOString(),
				response_time: new Date().toISOString()
			})
			return;
		}
		self.json({success: true, id: body[idField]});
	});
}

