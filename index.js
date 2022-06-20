var mysql = require('mysql');
const inquirer = require('inquirer');

// for displaying cleaner tables
require('console.table')

var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'kamal1998',
    database: 'roles'
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
        ]).then(answers => {
            conn.query('INSERT INTO roles SET ?', { title: answers.title, salary: answers.salary, department_id: answers.department }, function (error, results, fields) {
                if (error) throw error;
                console.log('\nRole added!');
                console.log('\n');

                viewRoles();
            });
        });
    });
}

const addEmployee = () => {
    // get all roles from the roles table
    conn.query('SELECT id, title FROM roles', function (error, results, fields) {
        if (error) throw error;
        // create an array of role titles
        const roles = results.map(result => {
            return result.title;
        }).sort();
        // create an array of role ids
        const roleIds = results.map(result => {
            return result.id;
        }).sort();
        // create an array of role objects to be used in the inquirer prompt
        const roleObjects = results.map(result => {
            return {
                name: result.title,
                value: result.id
            }
        }).sort();

        // if roles are empty, tell user atleast one role must be added before adding an employee
        if (roles.length === 0) {
            console.log('\nYou must add at least one role before adding an employee.');
            console.log('\n');
            showMenu();
            return;
        }

        // get all employees from the employees table
        conn.query('SELECT id, first_name, last_name FROM employees', function (error, results, fields) {
            if (error) throw error;
            // create an array of employee names
            const employees = results.map(result => {
                return result.first_name + ' ' + result.last_name;
            }).sort();
            // create an array of employee ids
            const employeeIds = results.map(result => {
                return result.id;
            }).sort();
            // create an array of employee objects to be used in the inquirer prompt
            const employeeObjects = results.map(result => {
                return {
                    name: result.first_name + ' ' + result.last_name,
                    value: result.id
                }
            }).sort();

            // include None as an option for the manager
            employeeObjects.unshift({
                name: 'None',
                value: null
            });

            inquirer.prompt([
                {
                    type: 'input',
                    name: 'firstName',
                    message: 'What is the first name of the employee you would like to add?'
                },
                {
                    type: 'input',
                    name: 'lastName',
                    message: 'What is the last name of the employee you would like to add?'
                },
                {
                    type: 'list',
                    name: 'role',
                    message: 'What is the role of the employee you would like to add?',
                    choices: roleObjects
                },
                {
                    type: 'list',
                    name: 'manager',
                    message: 'Who is the manager of the employee you would like to add?',
                    choices: employeeObjects
                }
            ]).then(answers => {
                conn.query('INSERT INTO employees SET ?', { first_name: answers.firstName, last_name: answers.lastName, role_id: answers.role, manager_id: answers.manager }, function (error, results, fields) {
                    if (error) throw error;
                    console.log('\nEmployee added!');
                    console.log('\n');

                    viewEmployees();
                });
            });
        });
    });
}


const updateEmployeeRole = () => {
    // get all employees from the employees table
    conn.query('SELECT id, first_name, last_name FROM employees', function (error, results, fields) {
        if (error) throw error;
        // create an array of employee names
        const employees = results.map(result => {
            return result.first_name + ' ' + result.last_name;
        }).sort();
        // create an array of employee ids
        const employeeIds = results.map(result => {
            return result.id;
        }).sort();
        // create an array of employee objects to be used in the inquirer prompt
        const employeeObjects = results.map(result => {
            return {
                name: result.first_name + ' ' + result.last_name,
                value: result.id
            }
        }).sort();

        // get all roles from the roles table
        conn.query('SELECT id, title FROM roles', function (error, results, fields) {
            if (error) throw error;
            // create an array of role titles
            const roles = results.map(result => {
                return result.title;
            }).sort();
            // create an array of role ids
            const roleIds = results.map(result => {
                return result.id;
            }).sort();
            // create an array of role objects to be used in the inquirer prompt
            const roleObjects = results.map(result => {
                return {
                    name: result.title,
                    value: result.id
                }
            }).sort();

            // if roles are empty, tell user atleast one role must be added before adding an employee
            if (roles.length === 0) {
                console.log('\nYou must add at least one role before adding an employee.');
                console.log('\n');
                showMenu();
                return;
            }

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employee',
                    message: 'Which employee would you like to update?',
                    choices: employeeObjects
                },
                {
                    type: 'list',
                    name: 'role',
                    message: 'What is the role of the employee you would like to update?',
                    choices: roleObjects
                }
            ]).then(answers => {
                conn.query('UPDATE employees SET ? WHERE ?', [{ role_id: answers.role }, { id: answers.employee }], function (error, results, fields) {
                    if (error) throw error;
                    console.log('\nEmployee role updated!');
                    console.log('\n');
                    
                    viewEmployees();
                });
            });
        });
    });
}

const showMenu = async () => {

    let action = await inquirer.prompt([
        {
            type: 'list',
            name: 'menu',
            message: 'Select an action:',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Update an employee role',
                'Exit'
            ],
            default: 'View all departments'
        }
    ]);

    // use select

    switch (action.menu) {
        case 'View all departments': {
            viewDepartments();
            break;
        }
        case 'View all roles': {
            viewRoles();
            break;
        }
        case 'View all employees': {
            viewEmployees();
            break;
        }
        case 'Add a department': {
            addDepartment();
            break;
        }
        case 'Add a role': {
            addRole();
            break;
        }
        case 'Add an employee': {
            addEmployee();
            break;
        }
        case 'Update an employee role': {
            updateEmployeeRole();
            break;
        }
        case 'Exit': {
            console.log('\nGoodbye!');
            conn.end();
            process.exit();
        }
    }
}

showMenu().then(() => {});