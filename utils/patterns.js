function validateEmail(email) {

    if (!email) {
        throw new Error("יש להזין אימייל")
    }

    email = email.trim();

    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-z0-9.-]+\.[A-Za-z]{2,}$/;

    return pattern.test(email);
}

function validatePassword(password) {

    if (!password || password.length < 8) {
        throw new Error("הסיסמה חייבת להכיל לפחות 8 תווים");
    }

    password = password.trim();

    const pattern = /^[!@#$%^&*.?][A-Z][a-z]*\d{4,8}$/;

    return pattern.test(password);
}

module.exports={
    validateEmail,
    validatePassword
};