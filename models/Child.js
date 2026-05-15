const formatName = require('../utils/formatName');
class Child {
    #id;
    #userId;
    #name;

    constructor(id, userId, name) {
        this.#id = id;
        this.#userId = userId;
        this.#name = formatName(name);
    }
    //GET
    getId() { return this.#id; }
    getUserId() { return this.#userId; }
    getName() { return this.#name; }
    //SET
    setName(name) {

        if (!formatName(name)) {
            throw new Error("Invalid name format");
        }

        this.#name = name;
    }
}

module.exports.Child;