const formatName = require('../utils/formatName');

class Medication {
    #id;
    #userId;
    #name;
    #antibiotic;

    constructor(userId, name, antibiotic) {
        this.#userId = userId;
        this.#name = formatName(name);
        this.#antibiotic = antibiotic;
    }
    //GET
    getId() { return this.#id; }
    getUserId() { return this.#userId; }
    getName() { return this.#name; }
    getAntibiotic() { return this.#antibiotic; }
    //SET
    setName(newName) {
        if (!newName) {
            throw new Error("יש להזין שם")
        }
        this.#name = formatName(newName);
    }
    setAntibiotic(isAntibiotic) {
        if (
            isAntibiotic !== true &&
            isAntibiotic !== false &&
            isAntibiotic !== 0 &&
            isAntibiotic !== 1
        ) {
            throw new Error("ערך האנטיביוטיקה חייב להיות: true/false או 1/0");
        }
        this.#antibiotic = isAntibiotic === true || isAntibiotic === 1 ? 1 : 0;
    }
}
module.exports = Medication;