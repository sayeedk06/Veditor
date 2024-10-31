// const AWS = require("aws-sdk");
const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");
const client = new SSMClient({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
  region: process.env.AWS_REGION,
});

const getParam = async (req, res, next) => {
  let cognito = {};
  console.log("Sometjing" + process.env.AWS_ACCESS_KEY_ID);
  try {
    console.log("Chacha");
    param_response = await client.send(
      new GetParameterCommand({
        Name: "/n11684763/aws/clients_id",
        Recursive: true,
      })
    );
    console.log(param_response.Parameter.Value);
    cognito["Client_ID"] = param_response.Parameter.Value;
  } catch (error) {
    console.log(error);
  }

  try {
    param_response = await client.send(
      new GetParameterCommand({
        Name: "/n11684763/aws/user_pool_id",
        Recursive: true,
      })
    );
    cognito["USER_POOL"] = param_response.Parameter.Value;
    console.log(param_response.Parameter.Value);
  } catch (error) {
    console.log(error);
  }
  req.cognito = cognito;
  next();
};

module.exports = { getParam };
