
 import {updatePassword,deleteUser} from  "../services/user.service.js"
export const updateUserPassword = async(req, res)=>{
    const {email, oldPassword, newPassword} = req.body;
    try {
        const result = await updatePassword(email, oldPassword, newPassword);
        return res.status(200).json({message:"password updated",result:result});
    } catch (error) {
        return res.status(400).json({message:"cannot update the password",error:error.message});
    }
}

export const deleteuser = async(req, res)=>{
    const { password} = req.body;
    const {userId} = req.user;
    try {
        const result = await deleteUser(userId, password);
        return res.status(200).json({
            message:"user delete",
        })
    } catch (error) {
                return res.status(400).json({message:"cannot delete user",error:error.message});
    }
}