import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';




const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(res.statusCode || 500).json({
      message: error.message
    });
  }
};




const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    res.status(res.statusCode || 500).json({
      message: error.message
    });
  }
};




const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error('No user found with this email');
    }

    
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordPin = pin;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; 
    await user.save();

    const message = `Your password reset PIN is: ${pin}\nThis PIN will expire in 10 minutes.`;

    await sendEmail(user.email, 'Password Reset PIN', message);

    res.json({ message: 'PIN sent to your email' });
  } catch (error) {
    res.status(res.statusCode || 500).json({
      message: error.message
    });
  }
};




const resetPassword = async (req, res) => {
  try {
    const { email, pin, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error('No user found with this email');
    }

    if (
      !user.resetPasswordPin ||
      user.resetPasswordPin !== pin ||
      user.resetPasswordExpire < Date.now()
    ) {
      res.status(400);
      throw new Error('Invalid or expired PIN');
    }

    user.password = newPassword; 
    user.resetPasswordPin = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(res.statusCode || 500).json({
      message: error.message
    });
  }
};
export { register, login, forgotPassword, resetPassword };