const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Cognito = require("@aws-sdk/client-cognito-identity-provider");
const aws_store_param = require("../middleware/param");
const deletefile = require('../middleware/errorFileCheck')
router.get("/test", (req, res) => {
  res.status(200).json({ message: "User Service is working!" });
});

router.get(
  "/",
  aws_store_param.getParam,
  auth.authenticateToken,
  deletefile.deletefile,
  async function (req, res, next) {
    console.log("GET USER: ", req.cognito.USER_POOL);

    try {
      const client = new Cognito.CognitoIdentityProviderClient({
        region: "ap-southeast-2",
      });
      const command = new Cognito.AdminListGroupsForUserCommand({
        Username: req.user["cognito:username"],
        UserPoolId: req.cognito.USER_POOL,
      });

      const response = await client.send(command);
      const groups = response.Groups.map((group) => group.GroupName);
      console.log(groups);

      if (groups) {
        res.json({
          name: req.user.name,
          groups: groups,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
);

module.exports = router;
