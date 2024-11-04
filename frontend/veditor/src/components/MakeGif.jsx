import { Button, ButtonGroup, Input, Progress, Text, Divider, FormLabel, Heading, Box, Flex } from '@chakra-ui/react';
import { useState } from "react";
import axios from 'axios';
import Cookies from 'js-cookie';

export default function MakeGif({ userName }) {
    const [inputs, setInputs] = useState({ start: "", end: ""});
    const [video, setVideo] = useState(null);
    const [gifSrc, setGifSrc] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0); // Track progress

    const handleChange = (event) => {
        const { name, value } = event.target;

        const formattedValue = formatTimeInput(value);

        setInputs((prevFormData) => ({ ...prevFormData, [name]: formattedValue }));
    };

    const handleVideo = (event) => {
        setVideo(event.target.files[0]);
    }

    const formatTimeInput = (value) => {
        const parts = value.split(':').map(part => part.padStart(2, '0'));  
        while (parts.length < 3) {
            parts.unshift('00');  
        }
        return parts.slice(0, 3).join(':');  
    };


    const handleForm = (event) => {
        event.preventDefault();

        const fd = new FormData();
        for (const key in inputs) {
            fd.append(key, inputs[key]);
        }

        if (video) {
            fd.append('video', video);
        }

        const token = Cookies.get('token');
        const header = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
        // http://localhost:8000/api/

        axios.post(process.env.REACT_APP_BASE_URL + 'video/makegif', fd, {
        // axios.post('http://n11684763-video-gif-service-alb-1885147598.ap-southeast-2.elb.amazonaws.com/api/video/makegif', fd, {
            headers: header,
            responseType: 'blob',
            onUploadProgress: progressEvent => {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(progress);
            }
        })
        .then((response) => {
            setUploadProgress(50);
            console.log(response.data)
            const url = URL.createObjectURL(response.data);
            setGifSrc(url)
            setUploadProgress(100); // Set progress to 100% after upload is complete
        })
        .catch(() => {
            setUploadProgress(0); // Reset progress if there's an error
        });
    };

    return (
        <Box
            bgGradient="transparent"//bgGradient="linear(to-b, #7E30E1, #E26EE5)"
            minHeight="100vh"
            display="flex"
            justifyContent="center"
            alignItems="center"
            p={4}
        >
            {/* Flex container for side-by-side layout */}
            <Flex
                direction={['column', 'row']}  // Stack on small screens, side-by-side on larger screens
                bg="#F3F8FF"
                p={8}
                borderRadius="md"
                boxShadow="lg"
                maxW="5xl"
                w="full"
                justifyContent="space-between"
            >
                {/* Upload Form */}
                <Box maxW="xl" minW="400px" w="full" mr={[0, 0, 8]} h="full">
                    <form onSubmit={handleForm} className='upload-form'>
                        <FormLabel color="#7E30E1">Upload video:</FormLabel>
                        <Input
                            backgroundColor='#E9E9F5'
                            w={300}
                            type="file"
                            name='video'
                            placeholder='Upload images'
                            onChange={handleVideo}
                            multiple="multiple"
                            mb={4}
                        />
                        <ButtonGroup spacing={4} mt={5} display="flex" justifyContent="space-between">
                         <FormLabel color="#7E30E1">Start Time:</FormLabel>
                        <Input
                            backgroundColor='#E9E9F5'
                            w={300}
                            name='start'
                            placeholder='Seconds'
                            value={inputs.start}
                            onChange={handleChange}
                            mb={4}
                        />
                        <FormLabel color="#7E30E1">End Time:</FormLabel>
                        <Input
                            backgroundColor='#E9E9F5'
                            w={300}
                            name='end'
                            placeholder='Seconds'
                            value={inputs.end}
                            onChange={handleChange}
                            mb={4}
                        />
                        </ButtonGroup>
                        <Divider mt={5} mb={5} borderColor="#7E30E1" />
                        <Button type="submit" colorScheme='purple' bg="#7E30E1" color="#F3F8FF" _hover={{ bg: '#E26EE5' }} mb={4}>
                            Upload
                        </Button>

                        {/* Progress Bar with Percentage */}
                        {uploadProgress > 0 && (
                            <Box mt={4}>
                                <Progress colorScheme="purple" value={uploadProgress} size="sm" hasStripe isAnimated />
                                <Text mt={2} textAlign="center" color="#7E30E1">{uploadProgress}%</Text>
                            </Box>
                        )}
                    </form>
                </Box>

                {/* Video Display */}
                <Box maxW="md" minW="400px" w="full" ml={[0, 0, 8]} mt={[8, 0]} alignItems="center"
                    justifyContent="center">
                    <Heading mt={10} color="#7E30E1" textAlign="center">Your Gif</Heading>
                    {gifSrc ? (
                <img src={gifSrc} alt="Generated GIF" style={{ width: '300px', height: 'auto', display: 'block', // Ensure the image is a block element
                 margin: '0 auto' }} />
            ) : (
                <p>Loading GIF...</p>
            )}
                </Box>
            </Flex>
        </Box>
    );
}