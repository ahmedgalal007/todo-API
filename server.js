var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
app.use(bodyParser.json());

var PORT = process.env.PORT || 4000;

var todos = [];
var todoNextId = 1;

app.get('/', function(req, res) {
	res.send('Todo API Root');
});

//GET /todos?completed=true
app.get('/todos', function(req, res) {
	var queryParams = req.query;
	//var filteredTodos = todos;
	var whereClause = {};

	if (queryParams.hasOwnProperty('q') && queryParams.q.trim().length > 0) {
		whereClause.description = {
			$like: '%' + queryParams.q + '%'
		};
	}

	if (queryParams.hasOwnProperty('completed')) {
		whereClause.completed = (queryParams.completed == 'true') ? true : false;
	}

	//if (queryParams) {
	db.todo.findAll({
		where: whereClause
	}).then(function(todos) {
		res.json(todos);
	}, function(e) {
		res.status(500).send();
	});

});

//GET /todos/:id
app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.findById(todoId).then(function(todo) {
		if (!!todo) {
			res.status(200).json(todo.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).send();
	});
});

//POST todos/
app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function(todo) {
		return res.status(200).json(todo.toJSON());
	}).catch(function(e) {
		res.status(400).json(e);
	});
});

app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.destroy({
		where: {
			id: todoId
		}
	}).then(function(rowDeleted) {
		if (rowDeleted === 0) {
			res.status(404).send({
				error: 'No row found with that id!'
			})
		} else {
			res.status(204).send();
		}
	}, function(e) {
		res.status(500).send();
	});
});

app.put('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};


	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.findById(todoId).then(function(todo) {
		if (todo) {
			return todo.update(attributes).then(function(todo) {
				res.json(todo.toJSON());
			}, function(e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).send();
	})
});

app.post('/users', function (req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then( function(user) {
		return res.status(200).json(user.toPublicJSON());
	}, function (e) {
		res.status(400).json(e);
	});
})

db.sequelize.sync({force: true}).then(function() {
	app.listen(PORT, function() {
		console.log('Todo API application started on port : ' + PORT);
	});
});