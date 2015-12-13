var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

var PORT = process.env.PORT || 4000;

var todos = [];
var todoNextId = 1;

app.get('/', function (req, res) {
	res.send('Todo API Root');
});

//GET todos
app.get('/todos', function (req, res) {
	res.json(todos);
});
//GET todos/:id
app.get('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id);
	var matchedTodo;
	todos.forEach(function (todo) {
		if (todo.id === todoId) {
			matchedTodo =  todo;
		};
	});
	if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	};
});

//POST todos/
app.post('/todos', function (req, res) {
	var body = req.body;
	body.id = todoNextId++;

	todos.push(body);
	
	res.json(body);
});


app.listen(PORT, function () {
	console.log('Todo API application started on port : ' + PORT);
});