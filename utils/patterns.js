function validateEmail(email) {

    if (!email) {
        throw new Error("Email is must required")
    }

    email = email.trim();

    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-z0-9.-]+\.[A-Za-z]{2,}$/;

    return pattern.test(email);
}

function validatePassword(password) {

    if (!password || password.length < 8) {
        throw new Error("Password nust be at least 8 characters");
    }

    password = password.trim();

    const pattern = /^[!@#$%^&*.?][A-Z]\d{6,8}$/;

    return pattern.test(password);
}

module.exports={
    validateEmail,
    validatePassword
};