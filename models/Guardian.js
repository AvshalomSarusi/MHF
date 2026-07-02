const formatName = require('../utils/formatName');
const {validateEmail} = require('../utils/patterns');

class Guardian {
    #id;
    #userId;
    #name;
    #relationship;
    #email;

    constructor(userId, name, relationship, email) {
        this.#userId = userId;
        this.#name = formatName(name);
        this.#relationship = formatName(relationship);
        if (!validateEmail(email)) { throw new Error("פורמט אימייל לא תקין"); }
        this.#email = email;
    }
    //GET
    getId() { return this.#id; }
    getUserId() { return this.#userId; }
    getName() { return this.#name; }
    getRelationship() { return this.#relationship; }
    getEmail() { return this.#email; }
    //SET
    setName(newName) {
        if (!newName) {
            throw new Error("יש להזין שם");
        }
        this.#name = formatName(newName);
    }
    setRelationship(relationship) {
        if (!relationship) {
            throw new Error("יש להזין קרבה")
        }
        this.#relationship = formatName(relationship);
    }
    setEmail(email) {
        if (!email) {
            throw new Error("יש להזין אימייל");
        }
        this.#email = email;
    }
}

module.exports = Guardian;