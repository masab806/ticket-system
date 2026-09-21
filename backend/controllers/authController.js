const authService = require('../services/authService');

//signup route into function
const signup = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await authService.signupUser(email, password);

        res.status(201).json(result);

    } catch (err) {
        console.error(err);

        if (err.message === "Email already registered") {
            return res.status(400).json({
                error: err.message
            });
        }

        res.status(500).json({
            error: "Server error during signup"
        });
    }
};

//email verrification route into function
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const message = await authService.verifyEmailToken(token);

        res.send(message);

    } catch (err) {
        console.error(err);

        res.status(400).send(err.message);
    }
};

//login route to function
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await authService.loginUser(email, password);

        res.status(200).json(result);

    } catch (err) {
        console.error(err);

        if (
            err.message === "Invalid email or password" ||
            err.message === "Please verify your email before logging in."
        ) {
            return res.status(400).json({
                error: err.message
            });
        }

        res.status(500).json({
            error: "Server error during login"
        });
    }
};

const getProfile = async (req,res)=> {
    try {
        const {userId} = req.user

        if(!userId){
            return res.status(400).json({
                error: "Invalid User"
            })
        }

        const result = await authService.getUserProfile(userId)

        return res.status(200).json(result)

    } catch (error) {
        console.log("Error: ", error)
    }
}

module.exports = {
    signup,
    verifyEmail,
    login,
    getProfile
};