const { signupUser, loginUser } = require("../services/auth.service");

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const result = await signupUser(name, email, password);
    res.status(201).json({ message: "Signup successfully", user });
  } catch (error) {
    res.status(400).json({ error: "Signup Failed", message: error.message });
  }
};

exports.login = async(req,res)=>{
  const {email, password } = req.body;
  try {
    const result = await loginUser(email,password);
    
  } catch (error) {
    
  }
}
