
 import {updatePassword,deleteUser,findDataPagination} from  "../services/user.service.js";
 
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


//paginations --public 
export const findData = async (req, res) => {

const userId = req.params.userId;
const cursorId = req.query.nextCursor;

if(!userId)return res.status(400).json({
message:"userId is not given"
});

try {
  const result = await findDataPagination(userId, cursorId);

  return res.status(200).json({
      message: "The result is",
      data: result,
    });
    
} catch (error) {
  console.log("error is",error)
      res.status(400).json({
      message: "blog not found",
      error: error.message,
    });
}

};
