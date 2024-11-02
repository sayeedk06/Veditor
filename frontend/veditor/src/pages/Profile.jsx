import { useEffect, useState } from "react";
import axios from 'axios';
import Cookies from 'js-cookie';
import Upload from '../components/Upload';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Heading, Stack, Box, Link, SimpleGrid, Image } from '@chakra-ui/react';
import stars from "../assets/starsPremium.png"

// Import the ImageSearch component
import ImageSearch from '../components/ImageSearch'; // Adjust the path based on your folder structure

export default function Profile() {
    const [userName, setUsername] = useState("");
    const [userId, setUserID] = useState("");
    const [groups, setGroups] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);

    useEffect(() => {
        const token = Cookies.get('token');
        const header = { 'Authorization': `Bearer ${token}` };

        axios.get(process.env.REACT_APP_BASE_URL + 'user', { headers: header })
            .then(function (response) {
                return response.data;
            }).then(function (data) {
                setUsername(data.name);
                setUserID(data.email);
                setGroups(data.groups);
            }).catch(function (err) {
                console.log(err);
            });
    }, []);

    return (
        <Box>
        <Box bgGradient="linear(to-b, #7E30E1, #E26EE5)"
        height="fit-content"
        minHeight="100vh" 
     >
            <Navbar/>
            <Box
                p={8}
                maxW="lg"
                mx="auto"
                mt={5}
                bgColor="transparent"
                borderRadius="md"
            >
                <SimpleGrid columns={[1, 2]} spacing={10}>
                    <Box>
                        {/* Welcome Heading */}
                        <Heading as="h1" mb={5} color="white" fontSize="7xl" textAlign="left"  ml={-60}>
                            Welcome,
                        </Heading>
                        <Heading as="h1" mb={5} color="white" fontSize="7xl" textAlign="left" whiteSpace="nowrap" ml={-60}>
                            {userName}
                        </Heading>
                    </Box>                    
                {/* Display User Groups */}
                {groups.length > 0 && (
                    <Box mb={5} textAlign="center" bg="transparent"  ml={15} mt={0} >
                        <Stack direction="row" spacing={4} justify="center">
                            {groups.map((group, index) => (
                                    <Link href="/premium" _hover={{ textDecoration: 'none', color: '#E9E9F5' }}>
                                        <Heading as="h1" fontSize="7x1" color="white" fontStyle="bold">{group}</Heading>
                                        <Image
                                            src={stars} // Update with the correct image path
                                            alt={group}
                                            boxSize="150px" // Adjust the size as needed
                                            borderRadius="full"
                                            _hover={{ transform: 'scale(1.05)', transition: 'transform 0.2s' }} // Scale effect on hover
                                        />   
                                                                   
                                    </Link>
                            ))}
                        </Stack>
                    </Box>
                )}
                </SimpleGrid>
            </Box>

            <Box
                maxHeight="500px" 
                height="fit-content"
                display="flex"
                justifyContent="center"
                alignItems="center"
                p={4}
            >
                <Upload userName={userName} selectedImages={selectedImages}/>
            </Box>

            {/* ImageSearch Component */}
            <Box
                p={8}
                mt={5}
                borderRadius="md"
                //boxShadow="lg"
            >
                <Heading as="h2" mb={5} color="whitesmoke" fontSize="40px" textAlign="center">
                    Search for Images
                </Heading>
                <ImageSearch setSelectedImages={setSelectedImages} selectedImages={selectedImages} /> {/* This is where the ImageSearch component is rendered */}
            </Box>
        </Box>
        <Footer style={{ marginTop: 'auto' }} />
        </Box>
    );
}