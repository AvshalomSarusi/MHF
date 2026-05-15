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
        this.relationship = formatName(relationship);
        if (!validateEmail(email)) { throw new Error("Invalid email format"); }
        this.#email = email;
    }
    //GET
    getId() { return this.#id; }
    getUserId() { return this.#userId; }
    getName() { return this.#name; }
    getRelationship() { return this.#relationship; }
    getEmail() { return this.#email; }
    //SET
    setName(newNome) {
        if (!newName) {
            throw new Error("Name is must required");
        }
        this.#name = formatName(newNome);
    }
    setRelationship(relationship) {
        if (!relationship) {
            throw new Error("Relationship is must required")
        }
        this.#relationship = formatName(relationship);
    }
    setEmail(email) {
        if (!email) {
            throw new Error("Email is must required");
        }
        this.#email = email;
    }
}

module.exports = Guardian;