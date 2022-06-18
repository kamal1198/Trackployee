var mysql = require('mysql');
const inquirer = require('inquirer');

// for displaying cleaner tables
require('console.table')

var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'employees'
});

conn.connect(function (err) {
    if (err) {
        console.error('DB connection error: ' + err.stack);
        return;
    }

    console.log('DB connected - id ' + conn.threadId);
});

const viewDepartments = () => {
    conn.query('SELECT id AS ID, dpt_name AS NAME FROM departments', function (error, results, fields) {
        if (error) throw error;
        console.log('\n');
        console.log('\nShowing all departments:');
        console.table(results);
        console.log('\n');

        // prompt user to choose an action
        showMenu();
    });
}

const viewRoles = () => {
    // join the roles table with the departments table to show the department name for each role
    conn.query('SELECT roles.id AS ID, roles.title AS TITLE, roles.salary AS SALARY, departments.dpt_name AS DEPARTMENT FROM roles LEFT JOIN departments ON roles.department_id = departments.id', function (error, results, fields) {
        if (error) throw error;
        console.log('\nShowing all roles:');
        console.table(results);
        console.log('\n');

        // prompt user to choose an action
        showMenu();
    });
}

const viewEmployees = () => {
    // join the employees table with the roles table to show the role title for each employee
    // join the employees table with the employees table to show the manager name for each employee
    conn.query('SELECT employees.id AS ID, employees.first_name AS FIRST_NAME, employees.last_name AS LAST_NAME, roles.title AS JOB_TITLE, departments.dpt_name AS DEPARTMENT, roles.salary AS SALARY, CONCAT(e.first_name, " ", e.last_name) AS MANAGER FROM employees LEFT JOIN roles ON employees.role_id = roles.id LEFT JOIN departments ON departments.id = roles.department_id LEFT JOIN employees e ON employees.manager_id = e.id', function (error, results, fields) {
        if (error) throw error;
        console.log('\nShowing all employees:');
        console.table(results);
        console.log('\n');

        // prompt user to choose an action
        showMenu();
    });
}

const addDepartment = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'What is the name of the department you would like to add?'
        }
    ]).then(answers => {
        conn.query('INSERT INTO departments SET ?', { dpt_name: answers.name }, function (error, results, fields) {
            if (error) throw error;
            console.log('\nDepartment added!');
            console.log('\n');
            
            viewDepartments();
        });
    });
}

const addRole = () => {
    // get all departments from the departments table
    conn.query('SELECT id, dpt_name FROM departments', function (error, results, fields) {
        if (error) throw error;
        // create an array of department names
        const departments = results.map(result => {
            return result.dpt_name;
        }).sort();
        // create an array of department ids
        const departmentIds = results.map(result => {
            return result.id;
        }).sort();
        // create an array of department objects to be used in the inquirer prompt
        const departmentObjects = results.map(result => {
            return {
                name: result.dpt_name,
                value: result.id
            }
        }).sort();

        inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'What is the title of the role you would like to add?'
            },
            {
                type: 'number',
                name: 'salary',
                message: 'What is the salary of the role you would like to add?'
            },
            {
                type: 'list',
                name: 'department',
                message: 'What is the department of the role you would like to add?',
                choices: departmentObjects
            }