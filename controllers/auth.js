export const register = (req, res) => {
  console.log("request recieved", req.body);
  res.json("Register User response from Controller");
};
