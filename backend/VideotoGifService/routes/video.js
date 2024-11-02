const express = require("express");
const router = express.Router();
const path = require("path");
const auth = require("../middleware/auth");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const AWS = require("aws-sdk");
const aws_store_param = require("../middleware/param");

function timeToSeconds(time) {
  const segments = time.split(":");
  const hours = parseInt(segments[0]);
  const minutes = parseInt(segments[1]);
  const seconds = parseInt(segments[2]);
  return hours * 3600 + minutes * 60 + seconds;
}

router.get("/test", (req, res) => {
  res.status(200).json({ message: "Video to GIF Service is working!" });
});

router.post(
  "/makegif",
  aws_store_param.getParam,
  auth.authenticateToken,
  async (req, res) => {
    const video = req.files.video;
    if (!video) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const relative_path = path.join(__dirname, "output", "gif.mp4");
    video.mv(relative_path, function (err) {
      if (err) {
        console.log("Could not upload file");
        return res.status(500).send("Failed to upload the video file.");
      }

      const start = timeToSeconds(req.body.start);
      const end = timeToSeconds(req.body.end);
      const gifDuration = end - start;
      const outputFilePath = path.join(__dirname, "output", "new.gif");

      ffmpeg(relative_path)
        .setStartTime(start)
        .setDuration(gifDuration)
        .output(outputFilePath)
        .on("end", async () => {
          try {
            const data = fs.readFileSync(outputFilePath); // Read the GIF file

            const s3 = new AWS.S3({
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
              sessionToken: process.env.AWS_SESSION_TOKEN,
              region: process.env.AWS_REGION,
            });

            const dynamoDb = new AWS.DynamoDB.DocumentClient({
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
              sessionToken: process.env.AWS_SESSION_TOKEN,
              region: process.env.AWS_REGION, // Specify your region
            });

            const bucketName = "n11684763-assignment2";
            const user = req.user["cognito:username"];
            const videoName = Date.now() + "giffy.gif";
            const sortKey = "videoName";

            const item = {
              "qut-username": process.env.QUT_USERNAME,
              [sortKey]: videoName,
              userName: user,
              createdAt: new Date().toISOString(),
            };

            const dynamoParams = {
              TableName: process.env.TABLE_NAME,
              Item: item,
            };

            // Generate pre-signed URL for S3 upload
            const presignedURL = await s3.getSignedUrl("putObject", {
              Bucket: bucketName,
              Key: videoName,
              ContentType: "image/gif",
              Expires: 3600,
            });
            console.log("Pre-signed URL to put the object:");
            console.log(presignedURL);

            // Upload GIF to S3
            const response = await fetch(presignedURL, {
              method: "PUT",
              body: data,
              headers: {
                "Content-Type": "image/gif",
              },
            });
            console.log(response);

            // Insert metadata into DynamoDB
            await dynamoDb.put(dynamoParams).promise();

            // Send the GIF as a response
            res.writeHead(200, {
              "Content-Type": "image/gif",
              "Content-Length": data.length,
              "Content-Disposition": "inline",
            });
            res.end(data);

            // Delete the local GIF file asynchronously
            await fs.promises.unlink(outputFilePath);
            //console.log("GIF file deleted successfully.");
            console.log("Gif created succesfully.");
          } catch (error) {
            console.error("Error during GIF generation or upload:", error);
            res.status(500).json({ error: "Error processing GIF" });
          }
        })
        .on("error", (err) => {
          console.error("Error during ffmpeg processing:", err);
          res.status(500).json({ error: "Error processing video" });
        })
        .run();
    });
  }
);

module.exports = router;
