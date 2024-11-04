const express = require("express");
const router = express.Router();
const path = require("path");
const auth = require("../middleware/auth");
const videoshow = require("videoshow");
const fs = require("fs");
const AWS = require("aws-sdk");
const aws_store_param = require("../middleware/param");
const aws_secret_manager = require("../middleware/secret");
const axios = require("axios");

router.get("/test", (req, res) => {
  res.status(200).json({ message: "Image to Video Service is working!" });
});

router.get(
  "/",
  aws_store_param.getParam,
  auth.authenticateToken,
  async (req, res) => {
    if (!req.user.email) {
      console.log("Unauthorized user");
      return res.sendStatus(403);
    }

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
    //const videoName = Date.now() + "video.mp4";
    sortKey = "username";
    const qutUsername = process.env.QUT_USERNAME;

    const dynamoParams = {
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: "#partitionKey = :qutUsername", // Query with  partition
      FilterExpression: "#userAttribute = :userName",
      ExpressionAttributeNames: {
        "#partitionKey": "qut-username",
        "#userAttribute": "userName",
      },
      ExpressionAttributeValues: {
        ":qutUsername": qutUsername,
        ":userName": user,
      },
      ProjectionExpression: "videoName",
    };
    try {
      // Query of the table
      const data = await dynamoDb.query(dynamoParams).promise();

      if (data.Items.length === 0) {
        return res
          .status(404)
          .json({ message: "No videos found for this user" });
      }

      const videoNames = data.Items.map((item) => item.videoName);
      console.log("Video names for user:", videoNames);

      // Fetch presigned URLs for each .mp4 video
      const videos = await Promise.all(
        videoNames.map(async (videoName) => {
          const presignedURL = s3.getSignedUrl("getObject", {
            Bucket: bucketName,
            Key: videoName,
            Expires: 3600, // URL expiration time in seconds (1 hour)
          });
          console.log("Pre-signed URL to get the object:");
          console.log(presignedURL);
          console.log("Object retrieved with pre-signed URL: ");
          console.log(videoName);

          return {
            filename: videoName,
            url: presignedURL, // Presigned URL
          };
        })
      );

      // Return the list of presigned URLs to the client
      res.status(200).json({
        videos,
        message: "MP4 videos fetched successfully",
      });
    } catch (err) {
      console.error("Error fetching videos from S3:", err);
      res.status(500).json({ error: "Failed to fetch videos from S3" });
    }
  }
);

router.post(
  "/generate-presigned-urls",
  aws_store_param.getParam,
  auth.authenticateToken,
  async (req, res) => {
    const { fileNames } = req.body;

    if (!fileNames || fileNames.length === 0) {
      return res.status(400).json({ error: "File names are required" });
    }

    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      sessionToken: process.env.AWS_SESSION_TOKEN,
      region: process.env.AWS_REGION,
    });

    const bucketName = "n11684763-image-bucket";
    const presignedUrls = [];

    try {
      // Generate presigned URL for each file name
      for (const fileName of fileNames) {
        const presignedURL = s3.getSignedUrl("putObject", {
          Bucket: bucketName,
          Key: fileName,
          ContentType: "image/jpeg",
          Expires: 3600,
        });
        presignedUrls.push({ fileName, url: presignedURL });
      }

      // Return the list of presigned URLs
      res.status(200).json({ presignedUrls });
    } catch (err) {
      console.error("Error generating presigned URLs:", err);
      res.status(500).json({ error: "Unable to generate presigned URLs" });
    }
  }
);

router.post(
  "/save-metadata",
  aws_store_param.getParam,
  auth.authenticateToken,
  async (req, res) => {
    const { fileNames, user } = req.body; // Expecting file names and user information from the frontend

    const dynamoDb = new AWS.DynamoDB.DocumentClient({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      sessionToken: process.env.AWS_SESSION_TOKEN,
      region: process.env.AWS_REGION,
    });

    const tableName = process.env.TABLE_NAME;

    try {
      for (const fileName of fileNames) {
        const item = {
          "qut-username": process.env.QUT_USERNAME,
          videoName: fileName,
          userName: user,
          createdAt: new Date().toISOString(),
        };

        const params = {
          TableName: tableName,
          Item: item,
        };

        await dynamoDb.put(params).promise();
      }

      res.status(200).json({ message: "Metadata saved successfully" });
    } catch (error) {
      console.error("Error saving metadata:", error);
      res.status(500).json({ error: "Unable to save metadata" });
    }
  }
);

//     const s3 = new AWS.S3({
//       accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//       sessionToken: process.env.AWS_SESSION_TOKEN,
//       region: process.env.AWS_REGION, // Specify your region
//     });

//     const dynamoDb = new AWS.DynamoDB.DocumentClient({
//       accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//       sessionToken: process.env.AWS_SESSION_TOKEN,
//       region: process.env.AWS_REGION, // Specify your region
//     });
//     const bucketName = "n11684763-image-bucket";
// //     const presignedURL = [];

//     try {
//       // Generate presigned URL for each file name
//       for (const fileName of fileNames) {
//         const presignedURL = s3.getSignedUrl("putObject", {
//           Bucket: bucketName,
//           Key: fileName,
//           ContentType: "image/jpeg", // Assuming JPEG images; adjust if necessary
//           Expires: 3600, // URL expiration time in seconds (1 hour)
//         });
//         presignedUrls.push({ fileName, url: presignedURL });
//       }

//       // Return the list of presigned URLs
//       res.status(200).json({ presignedUrls });
//     } catch (err) {
//       console.error("Error generating presigned URLs:", err);
//       res.status(500).json({ error: "Unable to generate presigned URLs" });
//     }
//   }
// );

// const user = req.user["cognito:username"];
// const imageName = Date.now() + ".jpeg";
// const videoName = imageName;
// sortKey = "videoName";

// const item = {
//   "qut-username": process.env.QUT_USERNAME,
//   [sortKey]: videoName,
//   userName: user,
//   createdAt: new Date().toISOString(),
// };

// const dynamoParams = {
//   TableName: process.env.TABLE_NAME,
//   Item: item, // The item to be inserted
// };

// try {
//   const presignedURL = await s3.getSignedUrl("putObject", {
//     Bucket: bucketName,
//     Key: videoName,
//     ContentType: "video/mp4",
//     Expires: 3600, // URL expiration time in seconds (1 hour)
//   });
// } catch (err) {
//   throw new Error(`Unable to generate URL ${err}`);
// }
// res(presignedURL);

// router.post(
//   "/upload",
//   aws_store_param.getParam,
//   auth.authenticateToken,
//   async (req, res) => {
//     console.log(req.body);

//     const images = req.files.images;
//     console.log(images);
//     imagePath = [];
//     images.map((x) => {
//       let relative_path = path.join(__dirname, "images/", x.name);
//       imagePath.push(relative_path);
//       x.mv(relative_path, function (err) {
//         if (err) {
//           console.log("Could not upload file");
//           return res.send("Failed");
//         }
//       });
//     });

//     var videoOptions = {
//       fps: req.body.fps,
//       loop: req.body.loop, // seconds
//       transition: true,
//       transitionDuration: req.body.transition, // seconds
//       videoBitrate: 1024,
//       videoCodec: "libx264",
//       size: "640x?",
//       audioBitrate: "128k",
//       audioChannels: 2,
//       format: req.body.format,
//       pixelFormat: "yuv420p",
//     };

//     const name = Date.now() + "video.mp4";
//     const user_email = req.user.email;

//     videoshow(imagePath, videoOptions)
//       .save(path.join(__dirname, "output/", name))
//       .on("start", function (command) {
//         console.log("ffmpeg process started:", command);
//       })
//       .on("error", function (err, stdout, stderr) {
//         console.error("Error:", err);
//         console.error("ffmpeg stderr:", stderr);
//       })
//       .on("end", function (output) {
//         console.error("Video created in:", output);
//         const relative_path = path.join(__dirname, "output/", name);
//         console.log(name, relative_path, user_email);

//         if (fs.existsSync(output)) {
//           // Read the video file as a buffer

//           fs.readFile(output, async (err, data) => {
//             if (err) {
//               return res.status(500).send("Error reading video file.");
//             }

//             const s3 = new AWS.S3({
//               accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//               secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//               sessionToken: process.env.AWS_SESSION_TOKEN,
//               region: process.env.AWS_REGION, // Specify your region
//             });

//             const dynamoDb = new AWS.DynamoDB.DocumentClient({
//               accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//               secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//               sessionToken: process.env.AWS_SESSION_TOKEN,
//               region: process.env.AWS_REGION, // Specify your region
//             });

//             const bucketName = "n11684763-assignment2";
//             const user = req.user["cognito:username"];
//             const videoName = Date.now() + "video.mp4";
//             sortKey = "videoName";

//             const item = {
//               "qut-username": process.env.QUT_USERNAME, // Primary key (partition key)
//               [sortKey]: videoName,
//               userName: user,
//               createdAt: new Date().toISOString(),
//             };

//             const dynamoParams = {
//               TableName: process.env.TABLE_NAME,
//               Item: item, // The item to be inserted
//             };

//             try {
//               const presignedURL = await s3.getSignedUrl("putObject", {
//                 Bucket: bucketName,
//                 Key: videoName,
//                 ContentType: "video/mp4",
//                 Expires: 3600, // URL expiration time in seconds (1 hour)
//               });
//             } catch (err) {
//               throw new Error(`Unable to generate URL ${err}`);
//             }
//             res(presignedURL);
//           });
//         }
//       });
//   }
// );

//               console.log("Pre-signed URL to put the object:");
//               console.log(presignedURL);

//               const response = await fetch(presignedURL, {
//                 method: "PUT",
//                 body: data,
//                 headers: {
//                   "Content-Type": "video/mp4",
//                 },
//               });
//               console.log(response);
//               console.log("Video uploaded to S3 successfully.");
//             } catch (err) {
//               throw new Error(`Upload failed ${err}`);
//             }

//             // Put the item in DynamoDB
//             try {
//               // Put the item in DynamoDB
//               await dynamoDb.put(dynamoParams).promise();
//               console.log("Item successfully added:", item);
//             } catch (error) {
//               console.error("Error inserting item:", error);
//             }

//             // Set appropriate headers
//             res.writeHead(200, {
//               "Content-Type": "video/mp4",
//               "Content-Length": data.length,
//               "Content-Disposition": "inline",
//               "Cache-Control": "no-cache",
//             });

//             // Send the video data as a buffer
//             res.end(data);
//             const directory = path.join(__dirname, "images/");
//             fs.readdir(directory, (err, files) => {
//               if (err) throw err;

//               //delete the uploaded images
//               for (const file of files) {
//                 fs.unlink(path.join(directory, file), (err) => {
//                   if (err) throw err;
//                 });
//               }
//             });
//           });
//         } else {
//           res.status(404).send("Video file not found.");
//         }
//       });
//   }
// );

router.get("/pixabay", aws_secret_manager.getSecret, async (req, res) => {
  console.log("API CALLLLL ");

  const PIXABAY_API_KEY = req.secret; //process.env.PIXABAY_API_KEY;
  const query = req.query.q; // Get the query from the request (user input)

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  // Corrected API URL, ensure it's properly structured
  const URL = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(
    query
  )}&image_type=photo&orientation=vertical`;

  try {
    // Fetch data from the Pixabay API
    const response = await axios.get(URL);
    const images = response.data.hits.map((hit) => {
      return {
        webformatURL: hit.webformatURL,
      };
    });

    // Send the filtered images back to the frontend
    res.json(images);
  } catch (error) {
    console.error("Error fetching data from Pixabay API:", error);
    res.status(500).json({ error: "Error fetching images" });
  }
});
module.exports = router;
