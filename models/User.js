const formatName = require('../utils/formatName');
const { validateEmail, validatePassword } = require('../utils/patterns');

class User {
    #id;
    #firstname;
    #lastname;
    #password;
    #email;

    constructor(firstname, lastname, password, email) {
        this.#firstname = formatName(firstname);
        this.#lastname = formatName(lastname);
        if (!validatePassword(password)) { throw new Error("Invalid password format"); }
        this.#password = password;
        if (!validateEmail(email)) { throw new Error("Invalid email format"); }
        this.#email = email;
    }

    //GET
    getId() { return this.#id; }
    getFirstName() { return this.#firstname; }
    getLastName() { return this.#lastname; }
    getEmail() { return this.#email; }

    //SET
    setFirstName(newFirstName) {
        this.#firstname = formatName(newFirstName);
    }
    setLastName(newLastName) {
        this.#lastname = formatName(newLastName);
    }
    setPassword(newPassword) {

        if (!validatePassword(newPassword)) {
            throw new Error("Invalid password format");
        }

        this.#password = newPassword;
    }
    setEmail(newEmail) {

        if (!validateEmail(email)) {
            throw new Error("invalid email format");
        }

        this.#email = newEmail.toLowerCase();
    }
}

module.exports = User;