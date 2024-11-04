import { Button, ButtonGroup, Input, Progress, Text, Divider, FormLabel, Heading, Box, Flex, Select } from '@chakra-ui/react';
import { useState} from "react";
import axios from 'axios';
import Cookies from 'js-cookie';
import ShowVideo from './ShowVideo';

export default function Upload({ userName, selectedImages }) { 
    const [inputs, setInputs] = useState({ fps: "", loop: "", transition: "", format: "" });
    const [images, setImages] = useState([]);
    const [audio, setAudio] = useState(null);
    const [videoSrc, setVideoSrc] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);

    const urlToFile = async (url, filename, mimeType) => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new File([blob], filename, { type: mimeType });
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setInputs((prevFormData) => ({ ...prevFormData, [name]: value }));
    };

    const handleImage = (event) => {
        setImages(event.target.files);
    };

    const handleAudio = (event) => {
        setAudio(event.target.files[0]);
    };

    const fetchPresignedUrls = async (fileNames) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.post(
                process.env.REACT_APP_VIDEO_SERVICE + 'video/generate-presigned-urls',
                { fileNames },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data.presignedUrls;
        } catch (error) {
            console.error("Error fetching presigned URLs:", error);
            return [];
        }
    };

    const uploadImages = async (presignedUrls) => {
        for (const { fileName, url } of presignedUrls) {
            console.log("URL" + url)
            const image = selectedImages.find((img) => img.webformatURL.includes(fileName));
            const file = await urlToFile(image.webformatURL, fileName, 'image/jpeg');

            try {
                await axios.put(url, file, {
                    headers: {
                        'Content-Type': 'image/jpeg',
                    },
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(progress);
                    },
                });
                console.log(`${fileName} uploaded successfully`);
            } catch (error) {
                console.error(`Error uploading ${fileName}:`, error);
            }
        }
    };

    const saveMetadata = async (fileNames) => {
        try {
            const token = Cookies.get('token');
            await axios.post(
                process.env.REACT_APP_VIDEO_SERVICE + 'video/save-metadata',
                { fileNames, user: userName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error("Error saving metadata:", error);
        }
    };

    const handleForm = async (event) => {
        event.preventDefault();

        const fileNames = selectedImages.map((image) => image.webformatURL.split('/').pop());

        // Step 1: Fetch Presigned URLs
        const presignedUrls = await fetchPresignedUrls(fileNames);

        // Step 2: Upload Images to S3
        await uploadImages(presignedUrls);

        // Step 3: Save Metadata in DynamoDB
        await saveMetadata(fileNames);
    };

    return (
        <Box
            bgGradient="transparent"
            minHeight="100vh"
            display="flex"
            justifyContent="center"
            alignItems="center"
            p={4}
        >
            <Flex
                direction={['column', 'column', 'row']}
                bg="#F3F8FF"
                p={8}
                borderRadius="md"
                boxShadow="lg"
                maxW="5xl"
                w="full"
                justifyContent="space-between"
            >
                <Box maxW="md" w="full" mr={[0, 0, 8]}>
                    <form onSubmit={handleForm} className='upload-form'>
                        <FormLabel color="#7E30E1">Upload Images:</FormLabel>
                        <Input
                            backgroundColor='#E9E9F5'
                            w={300}
                            type="file"
                            name='images'
                            placeholder='Upload images'
                            onChange={handleImage}
                            multiple="multiple"
                            mb={4}
                            isDisabled={selectedImages.length > 0}
                        />
                        {selectedImages.length > 0 && (
                            <Text color="#7E30E1" ml={3}>
                                {selectedImages.length} image(s) selected
                            </Text>
                        )}
                        <FormLabel color="#7E30E1">Upload Audio:</FormLabel>
                        <Input
                            backgroundColor='#E9E9F5'
                            w={300}
                            type="file"
                            name='audio'
                            placeholder='Upload audio'
                            onChange={handleAudio}
                            mb={4}
                        />
                        <ButtonGroup spacing={4} mt={5} display="flex" justifyContent="space-between">
                            <Select
                                backgroundColor='#E9E9F5'
                                w={100}
                                name='fps'
                                placeholder='FPS'
                                value={inputs.fps}
                                onChange={handleChange}
                            >
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="30">30</option>
                                <option value="40">40</option>
                            </Select> 
                            <Select
                                backgroundColor='#E9E9F5'
                                w={100}
                                name='loop'
                                placeholder='Loop'
                                value={inputs.loop}
                                onChange={handleChange}
                            >
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                            </Select>
                            <Select
                                backgroundColor='#E9E9F5'
                                w={200}
                                name='transition'
                                placeholder='Transition'
                                value={inputs.transition}
                                onChange={handleChange}
                                minWidth={150}
                            >
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                            </Select>
                        </ButtonGroup>
                        <Divider mt={5} mb={5} borderColor="#7E30E1" />
                        <Button type="submit" colorScheme='purple' bg="#7E30E1" color="#F3F8FF" _hover={{ bg: '#E26EE5' }} mb={4}>
                            Upload
                        </Button>

                        {uploadProgress > 0 && (
                            <Box mt={4}>
                                <Progress colorScheme="purple" value={uploadProgress} size="sm" hasStripe isAnimated />
                                <Text mt={2} textAlign="center" color="#7E30E1">{uploadProgress}%</Text>
                            </Box>
                        )}
                    </form>
                </Box>

                <Box maxW="md" w="full" ml={[0, 0, 8]} mt={[8, 8, 0]}>
                    <Heading mt={10} color="#7E30E1">Created Video</Heading>
                    <ShowVideo videoSrc={videoSrc} />
                </Box>
            </Flex>
        </Box>
    );
}





// export default function Upload({ userName, selectedImages }) {
//     const [inputs, setInputs] = useState({ fps: "", loop: "", transition: "", format: "" });
//     const [images, setImages] = useState([]);
//     const [audio, setAudio] = useState(null);
//     const [videoSrc, setVideoSrc] = useState('');
//     const [uploadProgress, setUploadProgress] = useState(0); // Track progress

//       // Function to fetch image from URL and convert it to a File object
//   const urlToFile = async (url, filename, mimeType) => {
//     const response = await fetch(url); // Fetch image from URL
//     const blob = await response.blob(); // Convert response to Blob
//     return new File([blob], filename, { type: mimeType }); // Convert Blob to File
//   };


//     const handleChange = (event) => {
//         const { name, value } = event.target;
//         setInputs((prevFormData) => ({ ...prevFormData, [name]: value }));
//     };

//     const handleImage = (event) => {
//         setImages(event.target.files);
//     }

//     const handleAudio = (event) => {
//         setAudio(event.target.files[0]);
//     }

//     const uploadImages = async (presignedUrls) => {
//         for (const { fileName, url } of presignedUrls) {
//             const image = selectedImages.find((img) => img.webformatURL.includes(fileName));
//             const file = await urlToFile(image.webformatURL, fileName, 'image/jpeg');

//             try {
//                 await axios.put(url, file, {
//                     headers: {
//                         'Content-Type': 'image/jpeg',
//                     },
//                 });
//                 console.log(`${fileName} uploaded successfully`);
//             } catch (error) {
//                 console.error(`Error uploading ${fileName}:`, error);
//             }
//         }
//     };



//     const handleForm = async (event) => {
//         event.preventDefault();

//         const fd = new FormData();
//         for (const key in inputs) {
//             fd.append(key, inputs[key]);
//         }

//         if(selectedImages.length !== 0) {
//             console.log(selectedImages)
//             for (const image of selectedImages) {
//                 const filename = image.webformatURL.split('/').pop();
//                 const mimeType = `image/${filename.split('.').pop()}`; // Infer MIME type from file extension
//                 const file = await urlToFile(image.webformatURL, filename, mimeType);
//                 fd.append('images', file); // Append the file to form data
//               }
//         } else{
//             console.log("AS FILES")
//             for (let i = 0; i < images.length; i++) {
//                 fd.append('images', images[i]);
//             }
//         }
        
//         if (audio) {
//             fd.append('audio', audio);
//         }
//         //hard coding format

//          fd.append('format', 'mp4');


//         const token = Cookies.get('token');
//         const header = {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'multipart/form-data'
//         }
//         // axios.post(process.env.REACT_APP_BASE_URL + 'video/upload', fd, {
//         axios.post(' http://n11684763-imagevideo-service-alb-943714070.ap-southeast-2.elb.amazonaws.com/api/video/upload', fd, {
//             headers: header,
//             responseType: 'blob',
//             onUploadProgress: progressEvent => {
//                 const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//                 setUploadProgress(progress);
//             }
//         })
//         .then((response) => {
//             setUploadProgress(50);
//             const blob = response.data;
//             if (blob.size === 0) {
//                 throw new Error('Received an empty video file.');
//             }
//             const url = URL.createObjectURL(blob);
//             setVideoSrc(url);
//             setUploadProgress(100); // Set progress to 100% after upload is complete
//         })
//         .catch(() => {
//             setUploadProgress(0); // Reset progress if there's an error
//         });
//     };

//     return (
//         <Box
//             bgGradient="transparent"
//             minHeight="100vh"
//             display="flex"
//             justifyContent="center"
//             alignItems="center"
//             p={4}
//         >
//             {/* Flex container for side-by-side layout */}
//             <Flex
//                 direction={['column', 'column', 'row']}  // Stack on small screens, side-by-side on larger screens
//                 bg="#F3F8FF"
//                 p={8}
//                 borderRadius="md"
//                 boxShadow="lg"
//                 maxW="5xl"
//                 w="full"
//                 justifyContent="space-between"
//             >
//                 {/* Upload Form */}
//                 <Box maxW="md" w="full" mr={[0, 0, 8]}>
//                     <form onSubmit={handleForm} className='upload-form'>
//                         <FormLabel color="#7E30E1">Upload Images:</FormLabel>
//                         <Input
//                             backgroundColor='#E9E9F5'
//                             w={300}
//                             type="file"
//                             name='images'
//                             placeholder='Upload images'
//                             onChange={handleImage}
//                             multiple="multiple"
//                             mb={4}
//                             isDisabled={selectedImages.length > 0}
//                         />
//                         {selectedImages.length > 0 && (
//                                 <Text color="#7E30E1" ml={3}>
//                                     {selectedImages.length} image(s) selected
//                                 </Text>
//                             )}
//                         <FormLabel color="#7E30E1">Upload Audio:</FormLabel>
//                         <Input
//                             backgroundColor='#E9E9F5'
//                             w={300}
//                             type="file"
//                             name='audio'
//                             placeholder='Upload audio'
//                             onChange={handleAudio}
//                             mb={4}
//                         />
//                         <ButtonGroup spacing={4} mt={5} display="flex" justifyContent="space-between">
//                             <Select
//                                 backgroundColor='#E9E9F5'
//                                 w={100}
//                                 name='fps'
//                                 placeholder='FPS'
//                                 value={inputs.fps}
//                                 onChange={handleChange}
//                             >
//                                 <option value="10">10</option>
//                                 <option value="20">20</option>
//                                 <option value="30">30</option>
//                                 <option value="40">40</option>
//                             </Select> 
//                             <Select
//                                 backgroundColor='#E9E9F5'
//                                 w={100}
//                                 name='loop'
//                                 placeholder='Loop'
//                                 value={inputs.loop}
//                                 onChange={handleChange}
                                
                            
//                             >
//                                 <option value="1">1</option>
//                                 <option value="2">2</option>
//                                 <option value="3">3</option>
//                             </Select>
//                             <Select
//                                 backgroundColor='#E9E9F5'
//                                 w={200}
//                                 name='transition'
//                                 placeholder='Transition'
//                                 value={inputs.transition}
//                                 onChange={handleChange}
//                                 minWidth={150}
//                             >
//                                 <option value="1">1</option>
//                                 <option value="2">2</option>
//                                 <option value="3">3</option>
//                             </Select>
//                         </ButtonGroup>
//                         <Divider mt={5} mb={5} borderColor="#7E30E1" />
//                         <Button type="submit" colorScheme='purple' bg="#7E30E1" color="#F3F8FF" _hover={{ bg: '#E26EE5' }} mb={4}>
//                             Upload
//                         </Button>

//                         {/* Progress Bar with Percentage */}
//                         {uploadProgress > 0 && (
//                             <Box mt={4}>
//                                 <Progress colorScheme="purple" value={uploadProgress} size="sm" hasStripe isAnimated />
//                                 <Text mt={2} textAlign="center" color="#7E30E1">{uploadProgress}%</Text>
//                             </Box>
//                         )}
//                     </form>
//                 </Box>

//                 {/* Video Display */}
//                 <Box maxW="md" w="full" ml={[0, 0, 8]} mt={[8, 8, 0]}>
//                     <Heading mt={10} color="#7E30E1">Created Video</Heading>
//                     <ShowVideo videoSrc={videoSrc} />
//                 </Box>
//             </Flex>
//         </Box>
//     );
// }
