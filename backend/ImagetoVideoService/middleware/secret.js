SecretsManager = require("@aws-sdk/client-secrets-manager");

const secret_name = "n11684763-API-secret";
const client = new SecretsManager.SecretsManagerClient({
  region: "ap-southeast-2",
});

const getSecret = async (req, res, next) => {
  try {
    response = await client.send(
      new SecretsManager.GetSecretValueCommand({
        SecretId: secret_name,
      })
    );
    const secret = JSON.parse(response.SecretString);
    req.secret = secret.PIXABAY_API_KEY;
    console.log(secret);
    next();
  } catch (error) {
    console.log(error);
  }
};

module.exports = { getSecret };