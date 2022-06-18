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