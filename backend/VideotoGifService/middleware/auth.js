const jwt = require("aws-jwt-verify");

const authenticateToken = async (req, res, next) => {
  const idVerifier = jwt.CognitoJwtVerifier.create({
    userPoolId: req.cognito.USER_POOL,
    tokenUse: "id",
    clientId: req.cognito.Client_ID,
  });

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log("Verifying:", token);
  if (!token) {
    console.log("JSON web token missing.");
    return res.sendStatus(401);
  }
  // ID Tokens are used to authenticate users to your application
  try {
    const IdTokenVerifyResult = await idVerifier.verify(token);
    console.log(
      `authToken verified for user: ${IdTokenVerifyResult.name} at URL ${req.url}`
    );
    req.user = IdTokenVerifyResult;
    next();
    // console.log(IdTokenVerifyResult);
  } catch (err) {
    console.log(
      `JWT verification failed at URL ${req.url}`,
      err.name,
      err.message
    );
    return res.sendStatus(401);
  }
};

module.exports = { authenticateToken };
