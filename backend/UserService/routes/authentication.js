const express = require("express");
const router = express.Router();
// const auth = require("../middleware/auth");
const Cognito = require("@aws-sdk/client-cognito-identity-provider");
const aws_store_param = require("../middleware/param");
// const qrcode = require("qrcode");

router.post("/register", aws_store_param.getParam, async (req, res) => {
  console.log("HEREEE")

  console.log(req.body)
  const { name, username, email, password } = req.body;

  console.log(username + email + password);

  console.log("THEREEE")
  const clientId = req.cognito.Client_ID; // Obtain from the AWS console

  // Checking for empty form values
  if (!email || !password || !username || !name) {
    return res.status(400).json({
      error: true,
      message:
        "Request body incomplete - name, username, email, and password are required",
    });
  }

  console.log("Signing up user");

  try {
    const client = new Cognito.CognitoIdentityProviderClient({
      region: "ap-southeast-2",
    });
    const command = new Cognito.SignUpCommand({
      ClientId: clientId,
      Username: username,
      Password: password,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "name", Value: name },
      ],
    });

    const token = await client.send(command);
    console.log(token);

    // Send successful response back
    return res.json({ awstoken: token });
  } catch (err) {
    console.error(err);

    // Handle specific errors from AWS Cognito
    if (err.name === "UsernameExistsException") {
      return res.status(409).json({
        // 409 Conflict
        error: true,
        message: "Username already exists",
      });
    } else if (err.name === "InvalidPasswordException") {
      return res.status(400).json({
        error: true,
        message: "Password did not conform to the policy (e.g., too weak)",
      });
    } else if (err.name === "InvalidParameterException") {
      return res.status(400).json({
        error: true,
        message: "Invalid email or other attributes",
      });
    } else {
      // Handle any other errors
      return res.status(500).json({
        error: true,
        message: "Internal server error. Please try again later.",
      });
    }
  }
});

router.post("/mfa", aws_store_param.getParam, async (req, res) => {
  const { mfaCode, mfaSession, mfaUser } = req.body;
  // console.log(mfaCode)
  // console.log(mfaSession)
  const client = new Cognito.CognitoIdentityProviderClient({
    region: "ap-southeast-2",
  });

  const command = new Cognito.VerifySoftwareTokenCommand({
    Session: mfaSession, // Use the same session token from the previous steps
    UserCode: mfaCode, // The TOTP code provided by the user
  });
  try {
    const verifyResponse = await client.send(command);
    if (verifyResponse.Status === "SUCCESS") {
      console.log("MFA Code successfully verified!");
      return res.json({ mfaVerified: true });
    }
  } catch (err) {
    console.log(err);
    return res.json({ mfaVerified: false });
  }
});

router.post("/login", aws_store_param.getParam, async (req, res) => {
  const { username, password, mfaCode } = req.body;
  console.log(req.cognito);
  const client = new Cognito.CognitoIdentityProviderClient({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
    region: process.env.AWS_REGION, // Specify your region
  });

  console.log("Getting auth token");

  // Get authentication tokens from the Cognito API using username and password
  const command = new Cognito.InitiateAuthCommand({
    AuthFlow: Cognito.AuthFlowType.USER_PASSWORD_AUTH,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
    ClientId: req.cognito.Client_ID,
  });

  try {
    // Send the authentication request
    const auth_response = await client.send(command);
    // console.log(auth_response)
    if (auth_response.ChallengeName === "MFA_SETUP") {
      if (
        auth_response.ChallengeParameters.MFAS_CAN_SETUP ===
        '["SOFTWARE_TOKEN_MFA"]'
      ) {
        const command = new Cognito.AssociateSoftwareTokenCommand({
          Session: auth_response.Session, // Use the session token from the login step
        });

        try {
          const response = await client.send(command);

          const secretCode = response.SecretCode; // Use this secret to generate the QR code
          console.log(secretCode);
          const totpURL = `otpauth://totp/veditor:${username}?secret=${secretCode}&issuer=veditor&algorithm=SHA1&digits=6`;
          qrcode.toDataURL(totpURL, (err, url) => {
            return res.json({
              qrcode: url,
              session: response.Session,
              user_id: auth_response.ChallengeParameters.MFAS_CAN_SETUP,
            });
          });
        } catch (error) {
          console.error("Error initiating TOTP setup:", error);
          throw error;
        }
      }
    } else if (auth_response.ChallengeName == "SOFTWARE_TOKEN_MFA") {
      console.log(
        "Authenticator App MFA required, responding to MFA challenge"
      );

      const challengeResponse = new Cognito.RespondToAuthChallengeCommand({
        ChallengeName: auth_response.ChallengeName,
        ClientId: req.cognito.Client_ID,
        ChallengeResponses: {
          USERNAME: username,
          SOFTWARE_TOKEN_MFA_CODE: mfaCode, // Use MFA code here (for SMS MFA)
        },
        Session: auth_response.Session, // Ensure to pass the session from the InitiateAuth response
      });

      const mfaAuthResponse = await client.send(challengeResponse);
      const idToken = mfaAuthResponse.AuthenticationResult.IdToken;
      if (!idToken) {
        return res.sendStatus(403);
      }
      console.log("Auth Token Received: ", idToken);
      return res.json({ authToken: idToken });
    }
  } catch (error) {
    console.error("Error authenticating:", error);

    // Handle specific Cognito errors
    if (error.name === "NotAuthorizedException") {
      return res
        .status(401)
        .json({ message: "Incorrect username or password" });
    } else if (error.name === "UserNotFoundException") {
      return res.status(404).json({ message: "User does not exist" });
    } else if (error.name === "PasswordResetRequiredException") {
      return res.status(403).json({ message: "Password reset required" });
    } else if (error.name === "UserNotConfirmedException") {
      return res.status(403).json({ message: "User account not confirmed" });
    } else {
      // Handle generic errors
      return res
        .status(500)
        .json({ message: "An error occurred during authentication" });
    }
  }
});

module.exports = router;