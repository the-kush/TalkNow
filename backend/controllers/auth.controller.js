import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {generateToken} from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";


export const signup = async (req, res) => {
    const fullName = req.body.fullName;
    const email = req.body.email;
    const password = req.body.password;
    try {

        if(!email || !password || !fullName) {
            return res.status(400).send({ message: 'All fields are required' });
        }

        if(password.length < 6) {
           return res.status(400).send({ message: 'Password must be more than 6 characters' });
        }

        const user = await User.findOne({email});
        if (user){
            return res.status(400).send({ message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User ({
            fullName,
            email,
            password: hashedPassword,
        })

        if(newUser){
            // generate jwt token
            generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).send({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            })
        } else{
            return res.status(400).send({
                message: 'Invalid Data'
            })
        }

    }catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Server Error" });
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            return res.status(401).json({ message: 'Invalid Password' });
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        })
    } catch (err){
        console.log(err.message);
        res.status(500).json({ message: "Server Error" });
    }
}

export const logout = (req, res) => {
    try {
        res.cookie('token', "", {
            maxAge: 0
        })
        res.status(200).json({
            message: 'Logged Out Successfully'
        })
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: "Server Error" });
    }
}

export const updateProfile = async (req, res) => {

    try {
        const {profilePic} = req.body;
        const userId = req.user._id;

        if(!profilePic){
            return res.status(400).json({ message: 'Profile Pic Not Found' });
        }

        const uploadResponse =  await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId, {
            profilePic: uploadResponse.secure_url
        },
            {
                new: true
            })

        res.status(200).json({updatedUser});
    } catch (e) {
        console.log(e.message);
        return res.status(400).json({ message: 'Error updating profile' });
    }
}

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch(err) {
        console.log("Error in checkAuth controller" ,err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
