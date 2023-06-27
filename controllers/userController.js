import userModel from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
//import transporter from "../config/emailConfig.js";

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "ajayshinde10000@gmail.com",
    pass: "yvjfaicpumlmgvcp",
  },
});



class UserController {
  static userRegistration = async (req, res) => {
    const { name, email, password, password_confirmation, tc } = req.body;
    const user = await userModel.findOne({ email: email });
    if (user) {
      res.send({ status: "failed", message: "Email Already Exists" });
    } else {
      if (name && email && password && password_confirmation && tc) {
        if (password === password_confirmation) {
          try {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);

            const doc = new userModel({
              name: name,
              email: email,
              password: hashPassword,
              tc: tc,
            });
            await doc.save();

            const saved_user = await userModel.findOne({ email: email });
            //Generating JWT Token
            const token = jwt.sign(
              { userID: saved_user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "1d" }
            );
            res
              .status(201)
              .send({
                status: "success",
                message: "User Registered Successfully",
                token: token,
              });
          } catch (err) {
            console.log(err);
            res.send({ status: "failed", message: "Unable To Register" });
          }
        } else {
          res.send({
            status: "failed",
            message: "Password And Confirmation Password Doesn't Match",
          });
        }
      } else {
        res.send({ status: "failed", message: "All Fields Are Required" });
      }
    }
  };

  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (email && password) {
        const user = await userModel.findOne({ email: email });
        if (user != null) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (user.email === email && isMatch) {
            //Generate JWT TOKEN
            const token = jwt.sign(
              { userID: user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "1d" }
            );
            res.send({
              status: "success",
              message: "Login Succesfull",
              token: token,
            });
          } else {
            res.send({
              status: "failed",
              message: "Email Or Password Are Not Valid",
            });
          }
        } else {
          res.send({
            status: "failed",
            message: "You Are Not Registered User",
          });
        }
      } else {
        res.send({ status: "failed", message: "All Fields Are Required" });
      }
    } catch (err) {
      res.send({ status: "failed", message: "Unable To Login" });
    }
  };

  static changeUserPassword = async (req, res) => {
    const { password, password_confirmation } = req.body;
    if (password && password_confirmation) {
      if (password !== password_confirmation) {
        res.send({
          status: "failed",
          message: "Password And Confirm Password Does Not Match",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const newHashPassword = await bcrypt.hash(password, salt);

        await userModel.findByIdAndUpdate(req.user._id, {
          $set: {
            password: newHashPassword,
          },
        });

        res.send({
          status: "success",
          message: "Password Changed Successfully",
        });
      }
    } else {
      res.send({ status: "failed", message: "All Fields Are Required" });
    }
  };

  static loggedUser = async (req, res) => {
    res.send({ user: req.user });
  };

  static sendUserPasswordResetEmail = async (req, res) => {
    const { email } = req.body;
    if (email) {
      const user = await userModel.findOne({ email: email });
      if (user) {
        const secret = user._id + process.env.JWT_SECRET_KEY;
        const token = jwt.sign({ userID: user._id }, secret, {
          expiresIn: "15m",
        });
        const link = `http://localhost:8000/api/user/reset/${user._id}/${token}`;
        console.log(link);
        
       // Send Email
        // let info = await transporter.sendMail({
        //     from:process.env.EMAIL_FROM,
        //     to: user.email,
        //     subject:"GeekShop - password Reset Link",
        //    // html:`<a href="${link}">click Here</a> to Reset Your Password`
        //    text: `Dear user,
        //    To reset your password, click on this link: ${link}
        //    If you did not request any password resets, then ignore this email.`
        // })

        const mailOptions = {
            from: "ajayshinde10000@gmail.com",
            to: user.email,
            subject: "Testing Nodemailer",
            text:`Dear user,
                To reset your password, click on this link: ${link}
               If you did not request any password resets, then ignore this email.` ,
          };

          transporter.sendMail(mailOptions)
  .then((info) => {
    console.log('Email sent: ' + info.response);
  })
  .catch((error) => {
    console.log(error);
  });

        res.send(link);

        // console.log("Hit")

        // transporter
        //   .sendMail(mailOptions)
        //   .then((info) => {
        //     console.log("Email sent: " + info.response);
        //   })
        //   .catch((error) => {
        //     console.log(error);
        //   });


      } else {
        res.send({ status: "failed", message: "Email Does Not Exist" });
      }
    } else {
      res.send({ status: "failed", message: "Email Fields is Required" });
    }
  };

  static userPasswordReset = async (req, res) => {
    const { password, password_confirmation } = req.body;
    const { id, token } = req.params;
    const user = await userModel.findById(id);
    const newSecret = user._id + process.env.JWT_SECRET_KEY;

    try {
      jwt.verify(token, newSecret);
      if (password && password_confirmation) {
        if (password == password_confirmation) {
          const salt = await bcrypt.genSalt(10);
          const newHashPassword = await bcrypt.hash(password, salt);
          await userModel.findByIdAndUpdate(req._id, {
            $set: {
              password: newHashPassword,
            },
          });
          res.send({ status: "failed", message: "Password Reset Successfull" });
        } else {
          res.send({
            status: "failed",
            message: "Password And confirm Password Does Not Match",
          });
        }
      } else {
        res.send({ status: "failed", message: "All Fields Are Required" });
      }
    } catch (err) {
      res.send({ status: "failed", message: "Invalid Token" });
    }
  };
}

export default UserController;
